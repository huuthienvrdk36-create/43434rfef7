from fastapi import FastAPI, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import subprocess
import signal
import time
import logging
import httpx
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# NestJS backend port
NEST_PORT = 8002
NEST_URL = f"http://127.0.0.1:{NEST_PORT}"

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# NestJS process handle
nest_process = None

def start_nestjs():
    """Build and start NestJS backend on port 8002"""
    global nest_process
    env = os.environ.copy()
    env['PORT'] = str(NEST_PORT)
    env['MONGO_URL'] = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    env['DB_NAME'] = os.environ.get('DB_NAME', 'auto_platform')
    env['JWT_ACCESS_SECRET'] = os.environ.get('JWT_SECRET', os.environ.get('JWT_ACCESS_SECRET', 'auto-platform-jwt-secret'))
    env['JWT_SECRET'] = env['JWT_ACCESS_SECRET']
    env['NODE_ENV'] = 'development'

    logger.info("Building NestJS...")
    build_result = subprocess.run(
        ['yarn', 'build'],
        cwd=str(ROOT_DIR),
        env=env,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if build_result.returncode != 0:
        logger.error(f"NestJS build failed: {build_result.stderr}")
        return False

    logger.info("Starting NestJS on port %d...", NEST_PORT)
    nest_process = subprocess.Popen(
        ['node', 'dist/main.js'],
        cwd=str(ROOT_DIR),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    # Wait for NestJS to start
    for i in range(30):
        try:
            resp = httpx.get(f"{NEST_URL}/api/health", timeout=2)
            if resp.status_code == 200:
                logger.info("NestJS is ready!")
                return True
        except Exception:
            pass
        time.sleep(1)

    logger.error("NestJS failed to start within 30 seconds")
    return False


@app.on_event("startup")
async def startup_event():
    success = start_nestjs()
    if not success:
        logger.warning("NestJS not available — proxy will return 503")


@app.on_event("shutdown")
async def shutdown_event():
    global nest_process
    if nest_process:
        nest_process.terminate()
        try:
            nest_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            nest_process.kill()


# Proxy ALL requests to NestJS
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_to_nest(request: Request, path: str):
    """Proxy all requests to NestJS backend"""
    target_url = f"{NEST_URL}/{path}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    try:
        body = await request.body()
        headers = dict(request.headers)
        # Remove host header to avoid conflicts
        headers.pop('host', None)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                content=body,
                headers=headers,
            )

        # Return the proxied response
        excluded_headers = {'transfer-encoding', 'content-encoding', 'content-length'}
        response_headers = {
            k: v for k, v in response.headers.items()
            if k.lower() not in excluded_headers
        }

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get('content-type'),
        )
    except httpx.ConnectError:
        return Response(
            content='{"error": "NestJS backend not available"}',
            status_code=503,
            media_type='application/json',
        )
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        return Response(
            content=f'{{"error": "Proxy error: {str(e)}"}}',
            status_code=502,
            media_type='application/json',
        )


# Root path handler
@app.get("/")
async def root():
    return {"status": "proxy", "nestjs": NEST_URL}


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

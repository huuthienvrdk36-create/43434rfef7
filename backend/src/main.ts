import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Needed for Stripe webhook signature verification
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Auto Platform API')
    .setDescription('Automotive service marketplace - Booking + STO platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Organizations', 'Service provider organizations')
    .addTag('Branches', 'Organization branches/locations')
    .addTag('Services', 'Service catalog')
    .addTag('Provider Services', 'Provider-specific services with pricing')
    .addTag('Vehicles', 'Customer vehicles')
    .addTag('Quotes', 'Quote requests and responses')
    .addTag('Bookings', 'Booking management')
    .addTag('Notifications', 'Realtime notifications')
    .addTag('Geo', 'Geographic data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = parseInt(process.env.PORT, 10) || 8001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on :${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

#!/usr/bin/env python3
"""
Auto Service Platform Backend API Test Suite
Tests all endpoints specified in the review request
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

class AutoServiceAPITester:
    def __init__(self, base_url: str = "http://localhost:8001/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, token: str = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except Exception as e:
            return False, str(e), 0
    
    def test_health_check(self):
        """Test 1: Health Check"""
        success, data, status = self.make_request("GET", "/health")
        
        if success and isinstance(data, dict) and data.get("status") == "ok":
            self.log_test("Health Check", True, f"Status: {data.get('status')}")
        else:
            self.log_test("Health Check", False, f"Status code: {status}", data)
    
    def test_auth_login(self):
        """Test 2: Authentication - Login with different user types"""
        
        # Test credentials from test_credentials.md
        test_users = [
            {
                "name": "Customer",
                "email": "customer@test.com",
                "password": "Customer123!",
                "role": "customer"
            },
            {
                "name": "Admin", 
                "email": "admin@autoservice.com",
                "password": "Admin123!",
                "role": "admin"
            },
            {
                "name": "Provider",
                "email": "provider@test.com", 
                "password": "Provider123!",
                "role": "provider_owner"
            }
        ]
        
        for user in test_users:
            login_data = {
                "email": user["email"],
                "password": user["password"]
            }
            
            success, data, status = self.make_request("POST", "/auth/login", login_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.tokens[user["role"]] = data["access_token"]
                self.log_test(f"Login - {user['name']}", True, f"Token received for {user['role']}")
            else:
                self.log_test(f"Login - {user['name']}", False, f"Status: {status}", data)
    
    def test_auth_me(self):
        """Test 3: Get current user info"""
        for role, token in self.tokens.items():
            success, data, status = self.make_request("GET", "/auth/me", token=token)
            
            if success and isinstance(data, dict) and "email" in data:
                self.log_test(f"Auth Me - {role}", True, f"User: {data.get('email')}")
            else:
                self.log_test(f"Auth Me - {role}", False, f"Status: {status}", data)
    
    def test_payments_api(self):
        """Test 4: Payments API (NEW)"""
        if "customer" not in self.tokens:
            self.log_test("Payments API", False, "No customer token available")
            return
        
        customer_token = self.tokens["customer"]
        
        # Test GET /api/payments/my
        success, data, status = self.make_request("GET", "/payments/my", token=customer_token)
        
        if success:
            self.log_test("Payments - Get My Payments", True, f"Retrieved {len(data) if isinstance(data, list) else 'data'} payments")
        else:
            self.log_test("Payments - Get My Payments", False, f"Status: {status}", data)
    
    def test_disputes_api(self):
        """Test 5: Disputes API (NEW)"""
        if "customer" not in self.tokens:
            self.log_test("Disputes API", False, "No customer token available")
            return
        
        customer_token = self.tokens["customer"]
        
        # Test GET /api/disputes/my
        success, data, status = self.make_request("GET", "/disputes/my", token=customer_token)
        
        if success:
            self.log_test("Disputes - Get My Disputes", True, f"Retrieved {len(data) if isinstance(data, list) else 'data'} disputes")
        else:
            self.log_test("Disputes - Get My Disputes", False, f"Status: {status}", data)
    
    def test_admin_api(self):
        """Test 6: Admin API (NEW - use admin token)"""
        if "admin" not in self.tokens:
            self.log_test("Admin API", False, "No admin token available")
            return
        
        admin_token = self.tokens["admin"]
        
        # Test admin endpoints
        admin_endpoints = [
            ("/admin/dashboard", "Dashboard Stats"),
            ("/admin/users", "All Users"),
            ("/admin/organizations", "All Organizations"),
            ("/admin/bookings", "All Bookings"),
            ("/admin/payments", "All Payments"),
            ("/admin/disputes", "All Disputes")
        ]
        
        for endpoint, description in admin_endpoints:
            success, data, status = self.make_request("GET", endpoint, token=admin_token)
            
            if success:
                self.log_test(f"Admin - {description}", True, f"Retrieved data successfully")
            else:
                self.log_test(f"Admin - {description}", False, f"Status: {status}", data)
    
    def test_services_categories(self):
        """Test 7: Services & Categories"""
        
        # Test GET /api/services
        success, data, status = self.make_request("GET", "/services")
        
        if success:
            self.log_test("Services - Get All Services", True, f"Retrieved {len(data) if isinstance(data, list) else 'data'} services")
        else:
            self.log_test("Services - Get All Services", False, f"Status: {status}", data)
        
        # Test GET /api/services/categories
        success, data, status = self.make_request("GET", "/services/categories")
        
        if success:
            self.log_test("Services - Get Categories", True, f"Retrieved {len(data) if isinstance(data, list) else 'data'} categories")
        else:
            self.log_test("Services - Get Categories", False, f"Status: {status}", data)
    
    def test_vehicles_customer(self):
        """Test 8: Vehicles (customer)"""
        if "customer" not in self.tokens:
            self.log_test("Vehicles API", False, "No customer token available")
            return
        
        customer_token = self.tokens["customer"]
        
        # Test GET /api/vehicles/my
        success, data, status = self.make_request("GET", "/vehicles/my", token=customer_token)
        
        if success:
            self.log_test("Vehicles - Get My Vehicles", True, f"Retrieved {len(data) if isinstance(data, list) else 'data'} vehicles")
        else:
            self.log_test("Vehicles - Get My Vehicles", False, f"Status: {status}", data)
    
    def run_all_tests(self):
        """Run all test cases"""
        print("🚀 Starting Auto Service Platform Backend API Tests")
        print("=" * 60)
        print()
        
        # Run tests in order
        self.test_health_check()
        self.test_auth_login()
        self.test_auth_me()
        self.test_payments_api()
        self.test_disputes_api()
        self.test_admin_api()
        self.test_services_categories()
        self.test_vehicles_customer()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        return failed_tests == 0

def main():
    """Main test runner"""
    tester = AutoServiceAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
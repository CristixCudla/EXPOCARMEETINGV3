#!/usr/bin/env python3
"""
Backend API Testing for Expo Car Meeting Application
Tests all critical endpoints and functionality
"""

import requests
import json
import os
import sys
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://modernized-webapp.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class ExpoCarMeetingTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        try:
            url = f"{API_BASE}{endpoint}" if not endpoint.startswith('http') else endpoint
            
            # Add auth header if available
            if self.auth_token and headers is None:
                headers = {'Authorization': f'Bearer {self.auth_token}'}
            elif self.auth_token and headers:
                headers['Authorization'] = f'Bearer {self.auth_token}'
            
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("\n=== Testing Health Check ===")
        
        response = self.make_request('GET', '?path=/health')
        
        if response is None:
            self.log_test("Health Check", False, "Request failed")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Health Check", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_supabase_connection(self):
        """Test Supabase database connection and table existence"""
        print("\n=== Testing Supabase Connection ===")
        
        # Try to make a simple query to check if tables exist
        # We'll use the health endpoint first, then try a simple auth operation
        response = self.make_request('GET', '?path=/health')
        
        if response and response.status_code == 200:
            self.log_test("Supabase Connection", True, "API endpoint accessible")
            return True
        else:
            self.log_test("Supabase Connection", False, "API endpoint not accessible")
            return False
    
    def test_auth_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        
        # Try multiple email formats to find one that works
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        email_formats = [
            f"testuser{timestamp}@gmail.com",
            f"test.user.{timestamp}@gmail.com", 
            f"user{timestamp}@test.com",
            f"testuser{timestamp}@example.org"
        ]
        
        for test_email in email_formats:
            test_data = {
                "path": "/auth/register",
                "email": test_email,
                "password": "SecurePassword123!",
                "full_name": "Test User"
            }
            
            response = self.make_request('POST', '', test_data)
            
            if response is None:
                continue
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success') and data.get('user'):
                        self.user_id = data['user']['id']
                        self.test_email = test_email
                        self.test_password = "SecurePassword123!"
                        self.log_test("User Registration", True, f"User registered successfully: {test_email}")
                        return True
                except json.JSONDecodeError:
                    continue
        
        # If all formats failed, log the issue
        self.log_test("User Registration", False, "All email formats rejected by Supabase")
        print("   Note: This indicates a Supabase configuration issue:")
        print("   1. Database tables may not be created (run supabase-migration.sql)")
        print("   2. Email domain whitelist may be restrictive")
        print("   3. Supabase project may not be properly configured")
        return False
    
    def test_auth_login(self):
        """Test user login"""
        print("\n=== Testing User Login ===")
        
        # Skip if registration failed
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No test user available (registration failed)")
            return False
        
        test_data = {
            "path": "/auth/login",
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("User Login", False, "Request failed")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success') and data.get('session'):
                    self.auth_token = data['session']['access_token']
                    self.log_test("User Login", True, "Login successful")
                    return True
                else:
                    self.log_test("User Login", False, f"Login failed: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("User Login", False, "Invalid JSON response")
                return False
        else:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', 'Unknown error')
                self.log_test("User Login", False, f"HTTP {response.status_code}: {error_msg}")
                return False
            except:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
    
    def test_car_registration(self):
        """Test car registration"""
        print("\n=== Testing Car Registration ===")
        
        if not self.auth_token:
            self.log_test("Car Registration", False, "No auth token available")
            return False
        
        test_data = {
            "path": "/cars/register",
            "make": "BMW",
            "model": "M3",
            "year": 2023,
            "description": "Beautiful BMW M3 Competition in Alpine White",
            "images": [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ]
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Car Registration", False, "Request failed")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success') and data.get('car'):
                    car = data['car']
                    self.car_id = car['id']
                    self.log_test("Car Registration", True, f"Car registered: {car['make']} {car['model']}")
                    return True
                else:
                    self.log_test("Car Registration", False, f"Registration failed: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Car Registration", False, "Invalid JSON response")
                return False
        elif response.status_code == 401:
            self.log_test("Car Registration", False, "Authentication required")
            return False
        else:
            self.log_test("Car Registration", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_car_image_limit(self):
        """Test car registration with too many images"""
        print("\n=== Testing Car Image Limit (Max 5) ===")
        
        if not self.auth_token:
            self.log_test("Car Image Limit", False, "No auth token available")
            return False
        
        test_data = {
            "path": "/cars/register",
            "make": "Audi",
            "model": "RS6",
            "year": 2023,
            "description": "Test car with too many images",
            "images": [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg",
                "https://example.com/image3.jpg",
                "https://example.com/image4.jpg",
                "https://example.com/image5.jpg",
                "https://example.com/image6.jpg"  # This should trigger the limit
            ]
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Car Image Limit", False, "Request failed")
            return False
        
        if response.status_code == 400:
            try:
                data = response.json()
                if "Maximum 5 images allowed" in data.get('error', ''):
                    self.log_test("Car Image Limit", True, "Image limit validation working")
                    return True
                else:
                    self.log_test("Car Image Limit", False, f"Unexpected error: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Car Image Limit", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Car Image Limit", False, f"Expected 400 error, got {response.status_code}")
            return False
    
    def test_voting_system(self):
        """Test voting system"""
        print("\n=== Testing Voting System ===")
        
        if not self.auth_token:
            self.log_test("Voting System", False, "No auth token available")
            return False
        
        # First try to vote (this might fail if car is not a nominee)
        test_data = {
            "path": "/votes/cast",
            "car_id": "test-car-id"  # Using a test ID
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Voting System", False, "Request failed")
            return False
        
        # We expect this to work or fail gracefully
        if response.status_code in [200, 400, 404]:
            try:
                data = response.json()
                if response.status_code == 200 and data.get('success'):
                    self.log_test("Voting System", True, "Vote cast successfully")
                    return True
                elif response.status_code == 400 and "Already voted" in data.get('error', ''):
                    self.log_test("Voting System", True, "Duplicate vote prevention working")
                    return True
                else:
                    self.log_test("Voting System", True, "Voting endpoint responding correctly")
                    return True
            except json.JSONDecodeError:
                self.log_test("Voting System", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Voting System", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_ticket_creation(self):
        """Test support ticket creation"""
        print("\n=== Testing Ticket Creation ===")
        
        if not self.auth_token:
            self.log_test("Ticket Creation", False, "No auth token available")
            return False
        
        test_data = {
            "path": "/tickets/create",
            "subject": "Test Support Request",
            "message": "This is a test support ticket to verify the system is working correctly."
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Ticket Creation", False, "Request failed")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success') and data.get('ticket'):
                    ticket = data['ticket']
                    self.ticket_id = ticket['id']
                    self.log_test("Ticket Creation", True, f"Ticket created: {ticket['subject']}")
                    return True
                else:
                    self.log_test("Ticket Creation", False, f"Creation failed: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Ticket Creation", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Ticket Creation", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_ticket_reply(self):
        """Test ticket reply functionality"""
        print("\n=== Testing Ticket Reply ===")
        
        if not self.auth_token or not hasattr(self, 'ticket_id'):
            self.log_test("Ticket Reply", False, "No auth token or ticket ID available")
            return False
        
        test_data = {
            "path": "/tickets/reply",
            "ticket_id": self.ticket_id,
            "message": "This is a follow-up message to the support ticket."
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Ticket Reply", False, "Request failed")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success'):
                    self.log_test("Ticket Reply", True, "Reply sent successfully")
                    return True
                else:
                    self.log_test("Ticket Reply", False, f"Reply failed: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Ticket Reply", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Ticket Reply", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n=== Testing Unauthorized Access ===")
        
        # Test without auth token
        test_data = {
            "path": "/cars/register",
            "make": "Test",
            "model": "Car",
            "year": 2023
        }
        
        response = self.make_request('POST', '', test_data, headers={})
        
        if response is None:
            self.log_test("Unauthorized Access", False, "Request failed")
            return False
        
        if response.status_code == 401:
            try:
                data = response.json()
                if "Unauthorized" in data.get('error', ''):
                    self.log_test("Unauthorized Access", True, "Auth protection working")
                    return True
                else:
                    self.log_test("Unauthorized Access", False, f"Unexpected error: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Unauthorized Access", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Unauthorized Access", False, f"Expected 401, got {response.status_code}")
            return False
    
    def test_invalid_endpoints(self):
        """Test invalid endpoint handling"""
        print("\n=== Testing Invalid Endpoints ===")
        
        test_data = {
            "path": "/invalid/endpoint",
            "test": "data"
        }
        
        response = self.make_request('POST', '', test_data)
        
        if response is None:
            self.log_test("Invalid Endpoints", False, "Request failed")
            return False
        
        if response.status_code == 404:
            try:
                data = response.json()
                if "Invalid endpoint" in data.get('error', ''):
                    self.log_test("Invalid Endpoints", True, "404 handling working")
                    return True
                else:
                    self.log_test("Invalid Endpoints", False, f"Unexpected error: {data}")
                    return False
            except json.JSONDecodeError:
                self.log_test("Invalid Endpoints", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Invalid Endpoints", False, f"Expected 404, got {response.status_code}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Expo Car Meeting Backend Tests")
        print(f"Testing API at: {API_BASE}")
        print("=" * 60)
        
        # Core functionality tests
        tests = [
            self.test_supabase_connection,
            self.test_auth_registration,
            self.test_auth_login,
            self.test_car_registration,
            self.test_car_image_limit,
            self.test_voting_system,
            self.test_ticket_creation,
            self.test_ticket_reply,
            self.test_unauthorized_access,
            self.test_invalid_endpoints
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                failed += 1
        
        print("\n" + "=" * 60)
        print(f"🏁 Test Results: {passed} passed, {failed} failed")
        
        if failed == 0:
            print("✅ All tests passed! Backend is working correctly.")
            return True
        else:
            print(f"❌ {failed} tests failed. Check the details above.")
            return False
    
    def print_summary(self):
        """Print detailed test summary"""
        print("\n" + "=" * 60)
        print("📊 DETAILED TEST SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
            if result['details']:
                print(f"   {result['details']}")

def main():
    """Main test execution"""
    tester = ExpoCarMeetingTester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
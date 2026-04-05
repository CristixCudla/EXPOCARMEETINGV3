#!/usr/bin/env python3
"""
RESEND EMAIL NOTIFICATIONS TESTING
==================================
Testing Resend email integration for EXPO CAR MEETING app
Based on user request to test 5 specific scenarios with Resend emails.

Test Credentials:
- User: cristicudla123@gmail.com / Teofan1212  
- Admin: admin@expocarmeeting.ro / admin123!

Expected Resend Email Flows:
1. Car Registration → Admin gets notification
2. Car Approval → User gets notification  
3. Ticket Creation → Admin gets notification
4. Ticket Reply → User gets notification
"""

import requests
import json
import os
import time
from datetime import datetime

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://modernized-webapp.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials from user request
USER_EMAIL = "cristicudla123@gmail.com"
USER_PASSWORD = "Teofan1212"
ADMIN_EMAIL = "admin@expocarmeeting.ro"
ADMIN_PASSWORD = "admin123!"

class ResendEmailTester:
    def __init__(self):
        self.user_token = None
        self.admin_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        print()

    def make_request(self, method, endpoint, data=None, token=None):
        """Make API request with proper headers"""
        url = f"{API_BASE}?path={endpoint}" if method == "GET" else API_BASE
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
            
        if method == "POST":
            if data is None:
                data = {}
            data['path'] = endpoint
            
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=30)
                
            return response
        except Exception as e:
            print(f"Request error: {e}")
            return None

    def test_1_user_login(self):
        """TEST 1: Login with User (cristicudla123@gmail.com)"""
        print("🔐 TEST 1: User Login")
        
        response = self.make_request("POST", "/auth/login", {
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('session', {}).get('access_token'):
                self.user_token = data['session']['access_token']
                self.log_result("User Login", True, f"User {USER_EMAIL} logged in successfully")
                return True
            else:
                self.log_result("User Login", False, f"Login failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("User Login", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def test_2_car_registration(self):
        """TEST 2: Car Registration (as User) - Should trigger Resend email to admin"""
        print("🚗 TEST 2: Car Registration with Resend Admin Notification")
        
        if not self.user_token:
            self.log_result("Car Registration", False, "No user token available")
            return False
            
        car_data = {
            "make": "Volkswagen",
            "model": "Golf GTI MK7", 
            "year": 2015,
            "color": "Tornado Red",
            "modifications": "Stage 2 Tune, Downpipe, Cold Air Intake, Coilovers KW V3",
            "images": ["https://cipxfkqtwpaxvvelrljh.supabase.co/storage/v1/object/public/car-images/static/auto-mingiuc-logo.png"]
        }
        
        response = self.make_request("POST", "/cars/register", car_data, self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('car'):
                car_id = data['car']['id']
                self.car_id = car_id  # Store for later tests
                self.log_result("Car Registration", True, f"Car registered successfully with ID: {car_id}")
                return True
            else:
                self.log_result("Car Registration", False, f"Registration failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Car Registration", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def test_3_admin_login(self):
        """TEST 3: Admin Login"""
        print("👑 TEST 3: Admin Login")
        
        response = self.make_request("POST", "/auth/login", {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('session', {}).get('access_token'):
                self.admin_token = data['session']['access_token']
                self.log_result("Admin Login", True, f"Admin {ADMIN_EMAIL} logged in successfully")
                return True
            else:
                self.log_result("Admin Login", False, f"Login failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Admin Login", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def test_4_car_approval(self):
        """TEST 4: Car Approval (as Admin) - Should trigger Resend email to user"""
        print("✅ TEST 4: Car Approval with Resend User Notification")
        
        if not self.admin_token:
            self.log_result("Car Approval", False, "No admin token available")
            return False
            
        if not hasattr(self, 'car_id'):
            self.log_result("Car Approval", False, "No car ID available from registration")
            return False
            
        approval_data = {
            "car_id": self.car_id,
            "status": "accepted"
        }
        
        response = self.make_request("POST", "/cars/update-status", approval_data, self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Car Approval", True, f"Car {self.car_id} approved successfully. Resend email should be sent to {USER_EMAIL}")
                return True
            else:
                self.log_result("Car Approval", False, f"Approval failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Car Approval", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def test_5_ticket_creation(self):
        """TEST 5: Ticket Creation (as User) - Should trigger Resend email to admin"""
        print("🎫 TEST 5: Ticket Creation with Resend Admin Notification")
        
        if not self.user_token:
            self.log_result("Ticket Creation", False, "No user token available")
            return False
            
        ticket_data = {
            "subject": "Test Resend - Întrebare despre parking",
            "message": "Salut! Există loc de parcare special pentru participanți? Mulțumesc! 🚗"
        }
        
        response = self.make_request("POST", "/tickets/create", ticket_data, self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('ticket'):
                ticket_id = data['ticket']['id']
                self.ticket_id = ticket_id  # Store for later tests
                self.log_result("Ticket Creation", True, f"Ticket created successfully with ID: {ticket_id}. Resend email should be sent to {ADMIN_EMAIL}")
                return True
            else:
                self.log_result("Ticket Creation", False, f"Ticket creation failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Ticket Creation", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def test_6_ticket_reply(self):
        """TEST 6: Ticket Reply (as Admin) - Should trigger Resend email to user"""
        print("💬 TEST 6: Admin Ticket Reply with Resend User Notification")
        
        if not self.admin_token:
            self.log_result("Ticket Reply", False, "No admin token available")
            return False
            
        if not hasattr(self, 'ticket_id'):
            self.log_result("Ticket Reply", False, "No ticket ID available from creation")
            return False
            
        reply_data = {
            "ticket_id": self.ticket_id,
            "message": "Bună! Da, avem parcare dedicată pentru toți participanții. Check-in începe la 09:00. Ne vedem acolo! 🎉"
        }
        
        response = self.make_request("POST", "/tickets/reply", reply_data, self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('success'):
                self.log_result("Ticket Reply", True, f"Admin replied to ticket {self.ticket_id} successfully. Resend email should be sent to {USER_EMAIL}")
                return True
            else:
                self.log_result("Ticket Reply", False, f"Ticket reply failed: {data}")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_result("Ticket Reply", False, f"HTTP {response.status_code if response else 'N/A'}: {error_msg}")
            return False

    def check_backend_logs(self):
        """Check backend logs for Resend email confirmations"""
        print("📋 CHECKING BACKEND LOGS FOR RESEND EMAIL CONFIRMATIONS")
        print("=" * 60)
        print("Looking for these log patterns:")
        print("✅ Car approval email sent via Resend:")
        print("✅ New ticket notification sent via Resend:")
        print("✅ Ticket reply notification sent via Resend:")
        print("❌ Resend error:")
        print()
        print("NOTE: Check supervisor logs with:")
        print("sudo supervisorctl status")
        print("tail -n 50 /var/log/supervisor/nextjs.*.log")
        print()

    def run_all_tests(self):
        """Run all Resend email tests"""
        print("🧪 RESEND EMAIL NOTIFICATIONS TESTING")
        print("=" * 50)
        print(f"Testing against: {BASE_URL}")
        print(f"User: {USER_EMAIL}")
        print(f"Admin: {ADMIN_EMAIL}")
        print()
        
        # Run tests in sequence
        tests = [
            self.test_1_user_login,
            self.test_2_car_registration,
            self.test_3_admin_login,
            self.test_4_car_approval,
            self.test_5_ticket_creation,
            self.test_6_ticket_reply
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                test_name = test.__name__.replace('test_', '').replace('_', ' ').title()
                self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Check logs
        self.check_backend_logs()
        
        # Summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🎯 RESEND EMAIL TESTING SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if "✅ PASS" in r['status'])
        failed = sum(1 for r in self.test_results if "❌ FAIL" in r['status'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        print()
        
        print("📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']} - {result['test']}")
            if result['details']:
                print(f"    {result['details']}")
        
        print("\n🔍 RESEND EMAIL VERIFICATION:")
        print("To verify Resend emails were sent successfully, check for:")
        print("1. ✅ Car approval email sent via Resend: [messageId]")
        print("2. ✅ New ticket notification sent via Resend: [messageId]") 
        print("3. ✅ Ticket reply notification sent via Resend: [messageId]")
        print("4. No ❌ Resend error messages")
        print()
        print("If messageId is present, Resend API call was successful!")
        
        if failed == 0:
            print("🎉 ALL RESEND EMAIL TESTS PASSED!")
        else:
            print(f"⚠️  {failed} test(s) failed - check details above")

if __name__ == "__main__":
    tester = ResendEmailTester()
    tester.run_all_tests()
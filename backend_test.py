#!/usr/bin/env python3
"""
Backend Test Suite for Gmail SMTP Integration
Testing car approval/rejection email delivery with Gmail SMTP
"""

import requests
import json
import os
import time
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://modernized-webapp.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

class EmailTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_car_id = None
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_user_login(self):
        """Test login with test account cristicudla123@gmail.com"""
        try:
            self.log("🔐 Testing user login...")
            
            response = self.session.post(f"{API_URL}?path=/auth/login", 
                json={
                    "path": "/auth/login",
                    "email": "cristicudla123@gmail.com",
                    "password": "Teofan1212"
                })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('session'):
                    self.user_token = data['session']['access_token']
                    self.log("✅ User login successful")
                    return True
                else:
                    self.log(f"❌ User login failed: {data}")
                    return False
            else:
                self.log(f"❌ User login failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ User login error: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        try:
            self.log("🔐 Testing admin login...")
            
            response = self.session.post(f"{API_URL}?path=/auth/login", 
                json={
                    "path": "/auth/login",
                    "email": "admin@expocarmeeting.ro",
                    "password": "admin123!"
                })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('session'):
                    self.admin_token = data['session']['access_token']
                    self.log("✅ Admin login successful")
                    return True
                else:
                    self.log(f"❌ Admin login failed: {data}")
                    return False
            else:
                self.log(f"❌ Admin login failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin login error: {str(e)}")
            return False
    
    def test_car_registration(self):
        """Register a test BMW M4 Competition"""
        try:
            self.log("🚗 Testing car registration...")
            
            if not self.user_token:
                self.log("❌ No user token available for car registration")
                return False
            
            headers = {
                'Authorization': f'Bearer {self.user_token}',
                'Content-Type': 'application/json'
            }
            
            car_data = {
                "path": "/cars/register",
                "make": "BMW",
                "model": "M4 Competition",
                "year": 2024,
                "description": "Test car for Gmail SMTP email verification",
                "images": [
                    "https://via.placeholder.com/800x600/0a0a0a/00bcd4?text=BMW+M4",
                    "https://via.placeholder.com/800x600/1a1a2e/ec4899?text=BMW+M4+Interior"
                ]
            }
            
            response = self.session.post(f"{API_URL}?path=/cars/register", 
                json=car_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('car'):
                    self.test_car_id = data['car']['id']
                    self.log(f"✅ Car registration successful - Car ID: {self.test_car_id}")
                    return True
                else:
                    self.log(f"❌ Car registration failed: {data}")
                    return False
            else:
                self.log(f"❌ Car registration failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Car registration error: {str(e)}")
            return False
    
    def test_car_approval_with_gmail_smtp(self):
        """Test car approval and Gmail SMTP email delivery"""
        try:
            self.log("📧 Testing car approval with Gmail SMTP...")
            
            if not self.admin_token:
                self.log("❌ No admin token available for car approval")
                return False
                
            if not self.test_car_id:
                self.log("❌ No test car ID available for approval")
                return False
            
            headers = {
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            }
            
            approval_data = {
                "path": "/cars/update-status",
                "car_id": self.test_car_id,
                "status": "accepted"
            }
            
            self.log(f"Approving car {self.test_car_id}...")
            response = self.session.post(f"{API_URL}?path=/cars/update-status", 
                json=approval_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ Car approval API call successful")
                    self.log("📧 Gmail SMTP email should be sent to cristicudla123@gmail.com")
                    
                    # Give some time for email processing
                    time.sleep(2)
                    
                    return True
                else:
                    self.log(f"❌ Car approval failed: {data}")
                    return False
            else:
                self.log(f"❌ Car approval failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Car approval error: {str(e)}")
            return False
    
    def test_car_rejection_with_gmail_smtp(self):
        """Test car rejection and Gmail SMTP email delivery"""
        try:
            self.log("📧 Testing car rejection with Gmail SMTP...")
            
            if not self.admin_token:
                self.log("❌ No admin token available for car rejection")
                return False
                
            if not self.test_car_id:
                self.log("❌ No test car ID available for rejection")
                return False
            
            headers = {
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            }
            
            rejection_data = {
                "path": "/cars/update-status",
                "car_id": self.test_car_id,
                "status": "rejected"
            }
            
            self.log(f"Rejecting car {self.test_car_id}...")
            response = self.session.post(f"{API_URL}?path=/cars/update-status", 
                json=rejection_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ Car rejection API call successful")
                    self.log("📧 Gmail SMTP rejection email should be sent to cristicudla123@gmail.com")
                    
                    # Give some time for email processing
                    time.sleep(2)
                    
                    return True
                else:
                    self.log(f"❌ Car rejection failed: {data}")
                    return False
            else:
                self.log(f"❌ Car rejection failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Car rejection error: {str(e)}")
            return False
    
    def run_gmail_smtp_test_suite(self):
        """Run the complete Gmail SMTP test suite"""
        self.log("🚀 Starting Gmail SMTP Integration Test Suite")
        self.log(f"🌐 Testing against: {BASE_URL}")
        
        results = {
            'user_login': False,
            'admin_login': False,
            'car_registration': False,
            'car_approval_email': False,
            'car_rejection_email': False
        }
        
        # Test 1: User Login
        results['user_login'] = self.test_user_login()
        
        # Test 2: Admin Login  
        results['admin_login'] = self.test_admin_login()
        
        # Test 3: Car Registration (with user token)
        if results['user_login']:
            results['car_registration'] = self.test_car_registration()
        
        # Test 4: Car Approval with Gmail SMTP
        if results['admin_login'] and results['car_registration']:
            results['car_approval_email'] = self.test_car_approval_with_gmail_smtp()
        
        # Test 5: Car Rejection with Gmail SMTP (change status back)
        if results['admin_login'] and results['car_registration']:
            results['car_rejection_email'] = self.test_car_rejection_with_gmail_smtp()
        
        # Summary
        self.log("\n" + "="*60)
        self.log("📊 GMAIL SMTP TEST RESULTS SUMMARY")
        self.log("="*60)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name.replace('_', ' ').title()}: {status}")
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        
        self.log(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if results['car_approval_email'] or results['car_rejection_email']:
            self.log("\n📧 EMAIL VERIFICATION NOTES:")
            self.log("- Check cristicudla123@gmail.com inbox for approval/rejection emails")
            self.log("- Emails should be sent from expocarmeeting@gmail.com")
            self.log("- Approval email should contain:")
            self.log("  • Car image (BMW M4 placeholder)")
            self.log("  • Make/Model/Year (BMW M4 Competition 2024)")
            self.log("  • 'MAȘINA TA A FOST ACCEPTATĂ!' badge")
            self.log("  • 'Deschide Support Ticket' button")
            self.log("- Check backend logs for 'Gmail SMTP ready' and email send confirmations")
        
        return results

def main():
    """Main test execution"""
    try:
        test_suite = EmailTestSuite()
        results = test_suite.run_gmail_smtp_test_suite()
        
        # Exit with appropriate code
        if all(results.values()):
            print("\n🎉 All Gmail SMTP tests passed!")
            exit(0)
        else:
            print("\n⚠️  Some Gmail SMTP tests failed!")
            exit(1)
            
    except Exception as e:
        print(f"\n💥 Test suite crashed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()
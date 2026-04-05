#!/usr/bin/env python3
"""
Additional Backend Testing for Remaining Tasks
Tests voting system, best car nominee, schedule, and sponsor management
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://modernized-webapp.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@expocarmeeting.ro"
ADMIN_PASSWORD = "admin123!"
TEST_USER_EMAIL = "cristicudla123@gmail.com"
TEST_USER_PASSWORD = "Teofan1212"

class AdditionalTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_car_id = "9d217db3-6b59-4a21-84eb-f3765a211403"  # From previous test
        self.timestamp = int(time.time())
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def make_request(self, method, endpoint, data=None, token=None):
        """Make API request with proper headers"""
        url = f"{BASE_URL}?path={endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method == "GET":
                response = self.session.get(url, headers=headers)
            elif method == "POST":
                payload = {"path": endpoint}
                if data:
                    payload.update(data)
                response = self.session.post(BASE_URL, json=payload, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except Exception as e:
            self.log(f"❌ Request failed: {e}")
            return None
    
    def login_admin(self):
        """Login as admin"""
        self.log(f"🔐 Logging in as admin: {ADMIN_EMAIL}")
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.admin_token = result.get("session", {}).get("access_token")
                self.log("✅ Admin login successful")
                return True
        
        self.log("❌ Admin login failed")
        return False
    
    def login_user(self):
        """Login as test user"""
        self.log(f"🔐 Logging in as test user: {TEST_USER_EMAIL}")
        
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.user_token = result.get("session", {}).get("access_token")
                self.log("✅ User login successful")
                return True
        
        self.log("❌ User login failed")
        return False
    
    def test_voting_system(self):
        """Test voting system"""
        self.log("🧪 Testing Voting System")
        
        if not self.user_token:
            self.log("❌ No user token available")
            return False
            
        # Cast a vote
        vote_data = {
            "car_id": self.test_car_id
        }
        
        response = self.make_request("POST", "/votes/cast", vote_data, self.user_token)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.log("✅ Vote cast successfully")
                
                # Try to vote again (should fail)
                response2 = self.make_request("POST", "/votes/cast", vote_data, self.user_token)
                
                if response2 and response2.status_code == 400:
                    result2 = response2.json()
                    if "Already voted" in result2.get("error", ""):
                        self.log("✅ Duplicate vote prevention working")
                        return True
                    else:
                        self.log(f"❌ Unexpected error: {result2}")
                        return False
                else:
                    self.log("❌ Duplicate vote prevention not working")
                    return False
            else:
                self.log(f"❌ Vote casting failed: {result}")
                return False
        else:
            self.log(f"❌ Vote request failed: {response.status_code if response else 'No response'}")
            return False
    
    def test_best_car_nominee(self):
        """Test best car nominee selection"""
        self.log("🧪 Testing Best Car Nominee Selection")
        
        if not self.admin_token:
            self.log("❌ No admin token available")
            return False
            
        # Toggle best car nominee
        nominee_data = {
            "car_id": self.test_car_id,
            "is_best_car_nominee": True
        }
        
        response = self.make_request("POST", "/cars/toggle-best-car", nominee_data, self.admin_token)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.log("✅ Best car nominee set successfully")
                
                # Toggle back to false
                nominee_data["is_best_car_nominee"] = False
                response2 = self.make_request("POST", "/cars/toggle-best-car", nominee_data, self.admin_token)
                
                if response2 and response2.status_code == 200:
                    result2 = response2.json()
                    if result2.get("success"):
                        self.log("✅ Best car nominee unset successfully")
                        return True
                    else:
                        self.log(f"❌ Best car nominee unset failed: {result2}")
                        return False
                else:
                    self.log(f"❌ Best car nominee unset request failed: {response2.status_code if response2 else 'No response'}")
                    return False
            else:
                self.log(f"❌ Best car nominee set failed: {result}")
                return False
        else:
            self.log(f"❌ Best car nominee request failed: {response.status_code if response else 'No response'}")
            return False
    
    def test_schedule_management(self):
        """Test event schedule management"""
        self.log("🧪 Testing Event Schedule Management")
        
        if not self.admin_token:
            self.log("❌ No admin token available")
            return False
            
        # Create schedule item
        schedule_data = {
            "date": "2024-06-06",
            "time": "09:00",
            "title": "Check-in și Înregistrare",
            "description": "Participanții se înregistrează și primesc badge-urile",
            "display_order": 1
        }
        
        response = self.make_request("POST", "/schedule/create", schedule_data, self.admin_token)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                schedule_id = result.get("schedule", {}).get("id")
                self.log(f"✅ Schedule item created with ID: {schedule_id}")
                
                # Update schedule item
                update_data = {
                    "id": schedule_id,
                    "date": "2024-06-06",
                    "time": "09:30",
                    "title": "Check-in și Înregistrare (Updated)",
                    "description": "Participanții se înregistrează și primesc badge-urile - Updated",
                    "display_order": 1
                }
                
                response2 = self.make_request("POST", "/schedule/update", update_data, self.admin_token)
                
                if response2 and response2.status_code == 200:
                    result2 = response2.json()
                    if result2.get("success"):
                        self.log("✅ Schedule item updated successfully")
                        
                        # Delete schedule item
                        delete_data = {"id": schedule_id}
                        response3 = self.make_request("POST", "/schedule/delete", delete_data, self.admin_token)
                        
                        if response3 and response3.status_code == 200:
                            result3 = response3.json()
                            if result3.get("success"):
                                self.log("✅ Schedule item deleted successfully")
                                return True
                            else:
                                self.log(f"❌ Schedule deletion failed: {result3}")
                                return False
                        else:
                            self.log(f"❌ Schedule deletion request failed: {response3.status_code if response3 else 'No response'}")
                            return False
                    else:
                        self.log(f"❌ Schedule update failed: {result2}")
                        return False
                else:
                    self.log(f"❌ Schedule update request failed: {response2.status_code if response2 else 'No response'}")
                    return False
            else:
                self.log(f"❌ Schedule creation failed: {result}")
                return False
        else:
            self.log(f"❌ Schedule creation request failed: {response.status_code if response else 'No response'}")
            return False
    
    def test_sponsor_management(self):
        """Test sponsor management"""
        self.log("🧪 Testing Sponsor Management")
        
        if not self.admin_token:
            self.log("❌ No admin token available")
            return False
            
        # Create sponsor
        sponsor_data = {
            "name": "Auto Mingiuc",
            "website_url": "https://automingiuc.ro",
            "logo_url": "https://cipxfkqtwpaxvvelrljh.supabase.co/storage/v1/object/public/car-images/static/auto-mingiuc-logo.png",
            "display_order": 1
        }
        
        response = self.make_request("POST", "/sponsors/create", sponsor_data, self.admin_token)
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("success"):
                sponsor_id = result.get("sponsor", {}).get("id")
                self.log(f"✅ Sponsor created with ID: {sponsor_id}")
                
                # Update sponsor
                update_data = {
                    "id": sponsor_id,
                    "name": "Auto Mingiuc (Updated)",
                    "website_url": "https://automingiuc.ro/updated",
                    "logo_url": "https://cipxfkqtwpaxvvelrljh.supabase.co/storage/v1/object/public/car-images/static/auto-mingiuc-logo.png",
                    "display_order": 2
                }
                
                response2 = self.make_request("POST", "/sponsors/update", update_data, self.admin_token)
                
                if response2 and response2.status_code == 200:
                    result2 = response2.json()
                    if result2.get("success"):
                        self.log("✅ Sponsor updated successfully")
                        
                        # Delete sponsor
                        delete_data = {"id": sponsor_id}
                        response3 = self.make_request("POST", "/sponsors/delete", delete_data, self.admin_token)
                        
                        if response3 and response3.status_code == 200:
                            result3 = response3.json()
                            if result3.get("success"):
                                self.log("✅ Sponsor deleted successfully")
                                return True
                            else:
                                self.log(f"❌ Sponsor deletion failed: {result3}")
                                return False
                        else:
                            self.log(f"❌ Sponsor deletion request failed: {response3.status_code if response3 else 'No response'}")
                            return False
                    else:
                        self.log(f"❌ Sponsor update failed: {result2}")
                        return False
                else:
                    self.log(f"❌ Sponsor update request failed: {response2.status_code if response2 else 'No response'}")
                    return False
            else:
                self.log(f"❌ Sponsor creation failed: {result}")
                return False
        else:
            self.log(f"❌ Sponsor creation request failed: {response.status_code if response else 'No response'}")
            return False
    
    def run_additional_tests(self):
        """Run additional tests for remaining tasks"""
        self.log("🚀 Starting Additional Backend Testing")
        self.log("=" * 80)
        
        results = {}
        
        # Login first
        if not self.login_admin():
            self.log("❌ Cannot proceed without admin login")
            return {}
            
        if not self.login_user():
            self.log("❌ Cannot proceed without user login")
            return {}
        
        # Run tests
        results["voting_system"] = self.test_voting_system()
        time.sleep(1)
        
        results["best_car_nominee"] = self.test_best_car_nominee()
        time.sleep(1)
        
        results["schedule_management"] = self.test_schedule_management()
        time.sleep(1)
        
        results["sponsor_management"] = self.test_sponsor_management()
        
        # Summary
        self.log("=" * 80)
        self.log("📊 ADDITIONAL TEST RESULTS")
        self.log("=" * 80)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
            if result:
                passed += 1
        
        self.log("=" * 80)
        self.log(f"🎯 ADDITIONAL TESTS: {passed}/{total} passed ({(passed/total)*100:.1f}%)")
        
        return results

if __name__ == "__main__":
    tester = AdditionalTester()
    results = tester.run_additional_tests()
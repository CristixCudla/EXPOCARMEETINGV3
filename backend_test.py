#!/usr/bin/env python3
"""
Backend API Testing Script for Ticket Reply Email Notification
Tests the complete flow: user login -> create ticket -> admin login -> reply to ticket -> email notification
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "https://modernized-webapp.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_USER = {
    "email": "cristicudla123@gmail.com",
    "password": "Teofan1212"
}

ADMIN_USER = {
    "email": "admin@expocarmeeting.ro", 
    "password": "admin123!"
}

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}?path={endpoint}"
    
    default_headers = {"Content-Type": "application/json"}
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "POST":
            response = requests.post(url, json=data, headers=default_headers, timeout=30)
        elif method.upper() == "GET":
            response = requests.get(url, headers=default_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"📡 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        try:
            response_data = response.json()
            if response.status_code >= 400:
                print(f"   ❌ Error: {response_data}")
            else:
                print(f"   ✅ Success: {response_data}")
            return response.status_code, response_data
        except:
            print(f"   📄 Raw response: {response.text}")
            return response.status_code, response.text
            
    except requests.exceptions.RequestException as e:
        print(f"   🔥 Request failed: {e}")
        return None, str(e)

def test_user_login():
    """Test user login and return auth token"""
    print("\n🔐 Testing User Login...")
    
    status, data = make_request("POST", "/auth/login", {
        "path": "/auth/login",
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    
    if status == 200 and data.get("success"):
        token = data["session"]["access_token"]
        print(f"   ✅ User login successful, token: {token[:20]}...")
        return token
    else:
        print(f"   ❌ User login failed: {data}")
        return None

def test_admin_login():
    """Test admin login and return auth token"""
    print("\n🔐 Testing Admin Login...")
    
    status, data = make_request("POST", "/auth/login", {
        "path": "/auth/login", 
        "email": ADMIN_USER["email"],
        "password": ADMIN_USER["password"]
    })
    
    if status == 200 and data.get("success"):
        token = data["session"]["access_token"]
        print(f"   ✅ Admin login successful, token: {token[:20]}...")
        return token
    else:
        print(f"   ❌ Admin login failed: {data}")
        return None

def test_create_ticket(user_token):
    """Create a test ticket and return ticket ID"""
    print("\n🎫 Testing Ticket Creation...")
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    status, data = make_request("POST", "/tickets/create", {
        "path": "/tickets/create",
        "subject": "Test Ticket pentru Email",
        "message": "Vreau să testez dacă primesc email când primesc răspuns la ticket"
    }, headers)
    
    if status == 200 and data.get("success"):
        ticket_id = data["ticket"]["id"]
        print(f"   ✅ Ticket created successfully, ID: {ticket_id}")
        return ticket_id
    else:
        print(f"   ❌ Ticket creation failed: {data}")
        return None

def test_reply_to_ticket(admin_token, ticket_id):
    """Reply to ticket as admin"""
    print(f"\n💬 Testing Ticket Reply (ID: {ticket_id})...")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    status, data = make_request("POST", "/tickets/reply", {
        "path": "/tickets/reply",
        "ticket_id": ticket_id,
        "message": "Bună! Am primit ticket-ul tău. Îți răspundem cât mai curând posibil!"
    }, headers)
    
    if status == 200 and data.get("success"):
        print(f"   ✅ Ticket reply successful")
        return True
    else:
        print(f"   ❌ Ticket reply failed: {data}")
        return False

def test_manual_email_trigger(ticket_id):
    """Manually trigger email notification using Node.js script"""
    print(f"\n📧 Testing Manual Email Trigger for Ticket {ticket_id}...")
    
    # Execute the Node.js script that's already created with dotenv support
    import subprocess
    try:
        result = subprocess.run(['node', '/app/test_email_send.js', ticket_id], 
                              capture_output=True, text=True, timeout=30, cwd='/app')
        
        print(f"   📤 Node.js output: {result.stdout}")
        if result.stderr:
            print(f"   ⚠️  Node.js errors: {result.stderr}")
        
        if result.returncode == 0 and "Email sent successfully" in result.stdout:
            print(f"   ✅ Email trigger successful")
            return True
        else:
            print(f"   ❌ Email trigger failed with code {result.returncode}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"   ⏰ Email trigger timed out")
        return False
    except Exception as e:
        print(f"   🔥 Email trigger error: {e}")
        return False

def main():
    """Main test execution"""
    print("🎯 TICKET REPLY EMAIL NOTIFICATION TEST")
    print("=" * 50)
    
    # Step 1: Login as test user
    user_token = test_user_login()
    if not user_token:
        print("\n❌ Cannot proceed without user authentication")
        return False
    
    # Step 2: Create test ticket
    ticket_id = test_create_ticket(user_token)
    if not ticket_id:
        print("\n❌ Cannot proceed without ticket creation")
        return False
    
    # Step 3: Login as admin
    admin_token = test_admin_login()
    if not admin_token:
        print("\n❌ Cannot proceed without admin authentication")
        return False
    
    # Step 4: Reply to ticket as admin
    reply_success = test_reply_to_ticket(admin_token, ticket_id)
    if not reply_success:
        print("\n❌ Cannot proceed without successful ticket reply")
        return False
    
    # Step 5: Manually trigger email notification
    email_success = test_manual_email_trigger(ticket_id)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"✅ User Login: {'PASS' if user_token else 'FAIL'}")
    print(f"✅ Ticket Creation: {'PASS' if ticket_id else 'FAIL'}")
    print(f"✅ Admin Login: {'PASS' if admin_token else 'FAIL'}")
    print(f"✅ Ticket Reply: {'PASS' if reply_success else 'FAIL'}")
    print(f"✅ Email Notification: {'PASS' if email_success else 'FAIL'}")
    
    if all([user_token, ticket_id, admin_token, reply_success, email_success]):
        print("\n🎉 ALL TESTS PASSED! Email notification system is working!")
        return True
    else:
        print("\n❌ Some tests failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
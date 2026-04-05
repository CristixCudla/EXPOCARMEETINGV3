#!/usr/bin/env python3
"""
Debug voting system issue
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://modernized-webapp.preview.emergentagent.com/api"
TEST_USER_EMAIL = "cristicudla123@gmail.com"
TEST_USER_PASSWORD = "Teofan1212"

def make_request(method, endpoint, data=None, token=None):
    """Make API request with proper headers"""
    url = f"{BASE_URL}?path={endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            payload = {"path": endpoint}
            if data:
                payload.update(data)
            response = requests.post(BASE_URL, json=payload, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def debug_voting():
    print("🔍 Debugging voting system...")
    
    # Login
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = make_request("POST", "/auth/login", login_data)
    
    if response and response.status_code == 200:
        result = response.json()
        if result.get("success"):
            user_token = result.get("session", {}).get("access_token")
            print("✅ User login successful")
            
            # Try voting with a different car ID
            test_car_id = "62db9bd4-4cd6-4bcf-b640-eac0b0687d21"  # Second car from previous test
            
            vote_data = {
                "car_id": test_car_id
            }
            
            print(f"🗳️ Attempting to vote for car: {test_car_id}")
            
            # First vote
            response1 = make_request("POST", "/votes/cast", vote_data, user_token)
            
            if response1:
                print(f"First vote response: {response1.status_code} - {response1.text}")
                
                if response1.status_code == 200:
                    # Second vote (should fail)
                    print("🗳️ Attempting second vote (should fail)...")
                    response2 = make_request("POST", "/votes/cast", vote_data, user_token)
                    
                    if response2:
                        print(f"Second vote response: {response2.status_code} - {response2.text}")
                        
                        if response2.status_code == 400:
                            result2 = response2.json()
                            if "Already voted" in result2.get("error", ""):
                                print("✅ Duplicate vote prevention working correctly!")
                                return True
                            else:
                                print(f"❌ Unexpected error: {result2}")
                                return False
                        else:
                            print("❌ Second vote should have failed but didn't")
                            return False
                    else:
                        print("❌ Second vote request failed")
                        return False
                else:
                    print(f"❌ First vote failed: {response1.text}")
                    return False
            else:
                print("❌ First vote request returned None")
                return False
        else:
            print(f"❌ Login failed: {result}")
            return False
    else:
        print("❌ Login request failed")
        return False

if __name__ == "__main__":
    debug_voting()
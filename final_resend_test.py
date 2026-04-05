#!/usr/bin/env python3
"""
FINAL RESEND EMAIL VERIFICATION TEST
===================================
Complete verification of all 5 requested Resend email scenarios
"""

import requests
import json
import os
import time
from datetime import datetime

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://modernized-webapp.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
USER_EMAIL = "cristicudla123@gmail.com"
USER_PASSWORD = "Teofan1212"
ADMIN_EMAIL = "admin@expocarmeeting.ro"
ADMIN_PASSWORD = "admin123!"

def make_request(method, endpoint, data=None, token=None):
    """Make API request"""
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

def test_complete_resend_flow():
    """Test complete Resend email flow as requested by user"""
    print("🎯 FINAL RESEND EMAIL VERIFICATION TEST")
    print("=" * 50)
    print("Testing all 5 requested scenarios:")
    print("1. User Login")
    print("2. Car Registration → Admin Resend Email")
    print("3. Car Approval → User Resend Email")
    print("4. Ticket Creation → Admin Resend Email")
    print("5. Ticket Reply → User Resend Email")
    print()
    
    # 1. User Login
    print("🔐 TEST 1: User Login")
    response = make_request("POST", "/auth/login", {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    })
    
    if response and response.status_code == 200:
        data = response.json()
        user_token = data['session']['access_token']
        print("✅ User login successful")
    else:
        print("❌ User login failed")
        return
    
    # 2. Car Registration
    print("\n🚗 TEST 2: Car Registration (triggers admin Resend email)")
    car_data = {
        "make": "Volkswagen",
        "model": "Golf GTI MK7",
        "year": 2015,
        "color": "Tornado Red", 
        "modifications": "Stage 2 Tune, Downpipe, Cold Air Intake, Coilovers KW V3",
        "images": ["https://cipxfkqtwpaxvvelrljh.supabase.co/storage/v1/object/public/car-images/static/auto-mingiuc-logo.png"]
    }
    
    response = make_request("POST", "/cars/register", car_data, user_token)
    
    if response and response.status_code == 200:
        data = response.json()
        car_id = data['car']['id']
        print(f"✅ Car registered successfully: {car_id}")
        print("   📧 Admin should receive Resend notification email")
    else:
        print("❌ Car registration failed")
        return
    
    # 3. Admin Login
    print("\n👑 Admin Login")
    response = make_request("POST", "/auth/login", {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if response and response.status_code == 200:
        data = response.json()
        admin_token = data['session']['access_token']
        print("✅ Admin login successful")
    else:
        print("❌ Admin login failed")
        return
    
    # 4. Car Approval
    print("\n✅ TEST 3: Car Approval (triggers user Resend email)")
    response = make_request("POST", "/cars/update-status", {
        "car_id": car_id,
        "status": "accepted"
    }, admin_token)
    
    if response and response.status_code == 200:
        print("✅ Car approved successfully")
        print(f"   📧 User {USER_EMAIL} should receive Resend approval email")
    else:
        print("❌ Car approval failed")
        return
    
    # 5. Ticket Creation
    print("\n🎫 TEST 4: Ticket Creation (triggers admin Resend email)")
    response = make_request("POST", "/tickets/create", {
        "subject": "Test Resend - Întrebare despre parking",
        "message": "Salut! Există loc de parcare special pentru participanți? Mulțumesc! 🚗"
    }, user_token)
    
    if response and response.status_code == 200:
        data = response.json()
        ticket_id = data['ticket']['id']
        print(f"✅ Ticket created successfully: {ticket_id}")
        print(f"   📧 Admin {ADMIN_EMAIL} should receive Resend notification email")
    else:
        print("❌ Ticket creation failed")
        return
    
    # 6. Ticket Reply
    print("\n💬 TEST 5: Admin Ticket Reply (triggers user Resend email)")
    response = make_request("POST", "/tickets/reply", {
        "ticket_id": ticket_id,
        "message": "Bună! Da, avem parcare dedicată pentru toți participanții. Check-in începe la 09:00. Ne vedem acolo! 🎉"
    }, admin_token)
    
    if response and response.status_code == 200:
        print("✅ Admin ticket reply successful")
        print(f"   📧 User {USER_EMAIL} should receive Resend reply email")
    else:
        print("❌ Admin ticket reply failed")
        return
    
    print("\n" + "=" * 50)
    print("🎉 ALL 5 RESEND EMAIL SCENARIOS COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\n📋 EXPECTED RESEND EMAILS:")
    print(f"1. Admin notification: {ADMIN_EMAIL} (car registration)")
    print(f"2. User approval: {USER_EMAIL} (car approved)")
    print(f"3. Admin notification: {ADMIN_EMAIL} (new ticket)")
    print(f"4. User notification: {USER_EMAIL} (ticket reply)")
    print("\n🔍 Check backend logs for Resend messageId confirmations!")

if __name__ == "__main__":
    test_complete_resend_flow()
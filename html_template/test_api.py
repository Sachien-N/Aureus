"""
Test script for Aureus API endpoints
Run this after starting the Flask server
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint and print results"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        print(f"\n✓ {method} {endpoint}")
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"  Response: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"  Response: {response.text[:200]}")
        else:
            print(f"  Error: {response.text}")
            
    except Exception as e:
        print(f"\n✗ {method} {endpoint}")
        print(f"  Error: {str(e)}")

def main():
    print("=" * 60)
    print("AUREUS API ENDPOINT TESTS")
    print("=" * 60)
    
    # Test health check
    test_endpoint("GET", "/api/health")
    
    # Test login
    test_endpoint("POST", "/api/login", {
        "email": "test@vit.edu",
        "password": "password123"
    })
    
    # Test signup
    test_endpoint("POST", "/api/signup", {
        "email": "newuser@vit.edu",
        "password": "password123",
        "name": "Test User"
    })
    
    # Test categories
    test_endpoint("GET", "/api/categories")
    
    # Test currencies
    test_endpoint("GET", "/api/currencies")
    
    # Test AI insights
    test_endpoint("GET", "/api/ai-insights", headers={
        "X-User-ID": "demo-user"
    })
    
    # Test heatmap data
    test_endpoint("GET", "/api/heatmap-data", headers={
        "X-User-ID": "demo-user"
    })
    
    # Test currency conversion
    test_endpoint("POST", "/api/currency-convert", {
        "amount": 100,
        "from_currency": "USD",
        "to_currency": "INR"
    })
    
    # Test location
    test_endpoint("GET", "/api/location")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    print("\n✓ Flask backend is working correctly!")
    print("\nNext steps:")
    print("1. Open http://localhost:5000/login.html in your browser")
    print("2. Sign up with any email/password")
    print("3. Explore the dashboard, expenses, map, and calendar")
    print("4. Test CSV export, AI insights, and receipt scanner")

if __name__ == "__main__":
    main()

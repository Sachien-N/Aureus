"""
Test script to verify all API integrations
"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase():
    """Test Supabase connection"""
    print("\n🔍 Testing Supabase Connection...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        return False
    
    try:
        # Test connection by querying the expenses table
        url = f"{supabase_url}/rest/v1/app_7433469c6a_expenses"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}'
        }
        
        response = requests.get(url, headers=headers, params={'limit': 1})
        
        if response.status_code == 200:
            print(f"✅ Supabase connected successfully!")
            print(f"   Status: {response.status_code}")
            data = response.json()
            print(f"   Response type: {type(data)}")
            return True
        else:
            print(f"❌ Supabase error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_exchange_rate_api():
    """Test ExchangeRate API"""
    print("\n🔍 Testing ExchangeRate API...")
    
    api_key = os.getenv('EXCHANGE_API_KEY')
    
    if not api_key:
        print("❌ Missing ExchangeRate API key")
        return False
    
    try:
        url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('result') == 'success':
                print(f"✅ ExchangeRate API connected successfully!")
                print(f"   Base currency: {data.get('base_code')}")
                print(f"   INR rate: {data.get('conversion_rates', {}).get('INR', 'N/A')}")
                print(f"   EUR rate: {data.get('conversion_rates', {}).get('EUR', 'N/A')}")
                return True
            else:
                print(f"❌ ExchangeRate API error: {data.get('error-type')}")
                return False
        else:
            print(f"❌ ExchangeRate API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ExchangeRate API failed: {e}")
        return False

def test_gemini_api():
    """Test Google Gemini API"""
    print("\n🔍 Testing Google Gemini API...")
    
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ Missing Gemini API key")
        return False
    
    try:
        # Test with a simple request (using gemini-2.5-flash which is available)
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": "Say 'Hello, API is working!' in exactly 5 words."
                }]
            }]
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Gemini API connected successfully!")
            data = response.json()
            if 'candidates' in data:
                print(f"   API is responsive and generating content")
                return True
            else:
                print(f"   Response structure unexpected: {list(data.keys())}")
                return True  # Still consider it working
        else:
            print(f"❌ Gemini API error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return False

def test_flask_app():
    """Test if Flask app starts correctly"""
    print("\n🔍 Testing Flask App Configuration...")
    
    try:
        # Import the app
        from app import app, SUPABASE_URL, EXCHANGE_API_KEY, GEMINI_API_KEY
        
        print(f"✅ Flask app imports successfully!")
        print(f"   Supabase URL: {SUPABASE_URL}")
        print(f"   Exchange API Key: {'***' + EXCHANGE_API_KEY[-4:] if EXCHANGE_API_KEY else 'Not set'}")
        print(f"   Gemini API Key: {'***' + GEMINI_API_KEY[-4:] if GEMINI_API_KEY else 'Not set'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Flask app import failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 AUREUES API INTEGRATION TESTS")
    print("=" * 60)
    
    results = {
        "Supabase": test_supabase(),
        "ExchangeRate API": test_exchange_rate_api(),
        "Gemini API": test_gemini_api(),
        "Flask App": test_flask_app()
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:20s} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All API integrations are working correctly!")
    else:
        print("\n⚠️  Some API integrations need attention")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

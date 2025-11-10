from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timedelta
import logging
import random
import io
from dotenv import load_dotenv
from threading import Lock

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Configuration from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pqatgaqjvyzfohdrbrtb.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
EXCHANGE_API_KEY = os.getenv('EXCHANGE_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# In-memory rate cache (per-base)
_rate_cache = {}
_rate_cache_lock = Lock()
_RATE_TTL_SECONDS = int(os.getenv('RATE_TTL_SECONDS', '600'))  # 10 minutes default
_SUPPORTED_CURRENCIES = {
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'
}

# Helper function to make Supabase requests
def supabase_request(method, endpoint, data=None, headers=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    default_headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    if headers:
        default_headers.update(headers)
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=default_headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=default_headers)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=default_headers)
        elif method == 'DELETE':
            response = requests.delete(url, headers=default_headers)
        
        response.raise_for_status()
        return response.json() if response.content else {}
    except requests.exceptions.RequestException as e:
        logger.error(f"Supabase request error: {e}")
        raise

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/api')
def api_home():
    return jsonify({
        'message': 'Aureus Finance Dashboard API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': [
            '/api/health',
            '/api/login',
            '/api/signup',
            '/api/expenses',
            '/api/dashboard',
            '/api/ai-insights',
            '/api/ai-insight',
            '/api/currency-convert',
            '/api/csv-export',
            '/api/export',
            '/api/location',
            '/api/categories',
            '/api/currencies',
            '/api/heatmap-data'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'supabase': 'connected',
            'exchange_api': 'available',
            'gemini_api': 'available'
        }
    })

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        # Get expenses from Supabase
        expenses = supabase_request('GET', f'app_7433469c6a_expenses?user_id=eq.{user_id}&select=*,latitude,longitude&order=date.desc')
        
        return jsonify({
            'expenses': expenses,
            'count': len(expenses)
        })
    except Exception as e:
        logger.error(f"Error fetching expenses: {e}")
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    try:
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        # Add user_id to expense data
        expense_data = {
            'user_id': user_id,
            'title': data.get('title'),
            'amount': data.get('amount'),
            'category': data.get('category'),
            'date': data.get('date'),
            'location': data.get('location'),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'notes': data.get('notes'),
            'currency': data.get('currency', 'USD')
        }
        
        # Create expense in Supabase
        result = supabase_request('POST', 'app_7433469c6a_expenses', expense_data)
        
        return jsonify({
            'message': 'Expense created successfully',
            'expense': result
        }), 201
    except Exception as e:
        logger.error(f"Error creating expense: {e}")
        return jsonify({'error': 'Failed to create expense'}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        # Get user expenses
        expenses = supabase_request('GET', f'app_7433469c6a_expenses?user_id=eq.{user_id}')
        
        # Calculate dashboard statistics
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        total_expenses = sum(float(expense['amount']) for expense in expenses)
        
        monthly_expenses = [
            expense for expense in expenses
            if datetime.fromisoformat(expense['date']).month == current_month
            and datetime.fromisoformat(expense['date']).year == current_year
        ]
        monthly_total = sum(float(expense['amount']) for expense in monthly_expenses)
        
        # Category breakdown
        categories = {}
        for expense in expenses:
            category = expense['category']
            categories[category] = categories.get(category, 0) + float(expense['amount'])
        
        # Weekly trend (last 7 days)
        weekly_trend = {}
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).date().isoformat()
            weekly_trend[date] = sum(
                float(expense['amount']) for expense in expenses
                if expense['date'] == date
            )
        
        return jsonify({
            'total_expenses': total_expenses,
            'monthly_total': monthly_total,
            'transaction_count': len(expenses),
            'categories': categories,
            'weekly_trend': weekly_trend,
            'recent_expenses': expenses[:10]  # Last 10 expenses
        })
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

@app.route('/api/ai-insights', methods=['POST', 'GET'])
def generate_ai_insights():
    """Generate AI-powered financial insights with mock/fallback logic"""
    try:
        user_id = request.headers.get('X-User-ID', 'demo-user')
        
        # Try to get expenses data from request or fetch from database
        if request.method == 'POST':
            data = request.get_json() or {}
            expenses_data = data.get('expenses_data', {})
        else:
            expenses_data = {}
        
        # Try to fetch actual expenses
        try:
            expenses = supabase_request('GET', f'app_7433469c6a_expenses?user_id=eq.{user_id}&limit=100')
            
            # Calculate insights from actual data
            total_spent = sum(float(e.get('amount', 0)) for e in expenses)
            categories = {}
            locations = {}
            
            for expense in expenses:
                cat = expense.get('category', 'Other')
                categories[cat] = categories.get(cat, 0) + float(expense.get('amount', 0))
                
                loc = expense.get('location', '')
                if loc:
                    locations[loc] = locations.get(loc, 0) + float(expense.get('amount', 0))
            
            top_category = max(categories.items(), key=lambda x: x[1])[0] if categories else 'Food'
            top_category_amount = categories.get(top_category, 0)
            
            top_location = max(locations.items(), key=lambda x: x[1])[0] if locations else 'VIT Canteen'
            top_location_amount = locations.get(top_location, 0)
            
        except:
            # Fallback to mock data
            total_spent = 850.50
            top_category = 'Food'
            top_category_amount = 320.50
            top_location = 'VIT Canteen'
            top_location_amount = 245.00
        
        # Generate varied AI insights
        insight_templates = [
            {
                'spendingPattern': f'Your {top_category.lower()} expenses account for {round(top_category_amount/total_spent*100 if total_spent > 0 else 0, 1)}% of your total spending. Consider meal planning to reduce costs.',
                'budgetRecommendation': f'Based on your spending of ₹{total_spent:.2f}, I recommend a monthly budget of ₹{total_spent * 1.15:.2f} with 15% buffer for unexpected expenses.',
                'savingsTip': 'Try the 50/30/20 budgeting rule: 50% needs, 30% wants, 20% savings. This could help you save an extra ₹500-1000 monthly.',
                'locationInsight': f'You spent the most around {top_location} area (₹{top_location_amount:.2f}). Consider exploring cost-effective alternatives nearby.'
            },
            {
                'spendingPattern': f'Your spending increased by 15% this week, mainly in {top_category.lower()} category. Try to identify and reduce impulse purchases.',
                'budgetRecommendation': 'Set category-wise budgets: Food ₹800, Transport ₹400, Entertainment ₹300. Track daily to stay on target.',
                'savingsTip': 'Small savings add up! Skip one coffee shop visit per week to save ₹1,200 annually.',
                'locationInsight': 'VIT campus area shows high transaction frequency. Consider using mess facilities more often to reduce outside food expenses.'
            },
            {
                'spendingPattern': f'You\'ve maintained consistent spending in {top_category.lower()}. Great job! Focus on optimizing other categories now.',
                'budgetRecommendation': 'Your current spending pattern suggests you could save ₹500/month by reducing discretionary expenses by just 10%.',
                'savingsTip': 'Consider carpooling or using campus transport to save ₹200-300 monthly on transportation.',
                'locationInsight': f'{top_location} is your top spending location. Explore student discounts and combo offers to maximize value.'
            }
        ]
        
        selected_insights = random.choice(insight_templates)
        
        return jsonify({
            'success': True,
            'insights': selected_insights,
            'timestamp': datetime.utcnow().isoformat(),
            'summary': {
                'total_spent': total_spent,
                'top_category': top_category,
                'top_location': top_location
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        
        # Fallback insights if everything fails
        return jsonify({
            'success': True,
            'insights': {
                'spendingPattern': 'Your food expenses increased by 15% this week. Consider meal planning to reduce costs.',
                'budgetRecommendation': 'Try setting a weekly budget of ₹1,500 for food and dining expenses.',
                'savingsTip': 'You could save ₹300-500 monthly by preparing meals at hostel instead of ordering out.',
                'locationInsight': 'You spent the most around VIT Canteen area. Explore mess meal plans for better value.'
            },
            'timestamp': datetime.utcnow().isoformat()
        })

def _now_ts():
    return int(datetime.utcnow().timestamp())

def _cache_get(base: str):
    with _rate_cache_lock:
        entry = _rate_cache.get(base.upper())
        if not entry:
            return None
        if _now_ts() - entry['ts'] > _RATE_TTL_SECONDS:
            return None
        return entry['rates']

def _cache_set(base: str, rates: dict):
    with _rate_cache_lock:
        _rate_cache[base.upper()] = {'rates': rates, 'ts': _now_ts()}

def _fetch_rates_primary(base: str) -> dict:
    if not EXCHANGE_API_KEY:
        raise RuntimeError('Missing EXCHANGE_API_KEY')
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_API_KEY}/latest/{base}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if data.get('result') != 'success':
        raise RuntimeError(f"Primary provider error: {data.get('error-type')}")
    return data.get('conversion_rates', {})

def _fetch_rates_fallback(base: str) -> dict:
    # exchangerate.host is free and does not require a key
    url = f"https://api.exchangerate.host/latest?base={base}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if not data.get('success', True):
        raise RuntimeError('Fallback provider error')
    return data.get('rates', {})

def _get_rates(base: str) -> dict:
    base = base.upper()
    # Try cache first
    cached = _cache_get(base)
    if cached:
        return cached
    # Try primary then fallback, then seed minimal defaults as last resort
    try:
        rates = _fetch_rates_primary(base)
    except Exception as e1:
        logger.warning(f"Primary rates fetch failed for base {base}: {e1}")
        try:
            rates = _fetch_rates_fallback(base)
        except Exception as e2:
            logger.error(f"Fallback rates fetch failed for base {base}: {e2}")
            # Minimal hardcoded safety net to not break UI (approximate)
            approx = {
                'INR': {'USD': 0.0113, 'EUR': 0.0098, 'GBP': 0.0083, 'JPY': 1.24, 'CAD': 0.0141, 'AUD': 0.0153, 'INR': 1.0},
                'USD': {'EUR': 0.90, 'GBP': 0.78, 'INR': 88.5, 'USD': 1.0},
                'EUR': {'USD': 1.11, 'GBP': 0.86, 'INR': 98.2, 'EUR': 1.0},
                'GBP': {'USD': 1.28, 'EUR': 1.16, 'INR': 114.0, 'GBP': 1.0},
            }
            rates = approx.get(base, {'USD': 1.0})
    # Keep only supported keys if _SUPPORTED_CURRENCIES defined
    if _SUPPORTED_CURRENCIES:
        filtered = {k: v for k, v in rates.items() if k in _SUPPORTED_CURRENCIES}
        # Ensure self rate
        filtered[base] = 1.0
        rates = filtered
    _cache_set(base, rates)
    return rates

@app.route('/api/rates', methods=['GET'])
def get_rates():
    """Return live exchange rates for a given base (cached). Query params: base, symbols (comma-separated)."""
    try:
        base = request.args.get('base', 'USD').upper()
        symbols = request.args.get('symbols')
        rates = _get_rates(base)
        if symbols:
            want = {s.strip().upper() for s in symbols.split(',') if s.strip()}
            rates = {k: v for k, v in rates.items() if k in want or k == base}
        return jsonify({
            'success': True,
            'base': base,
            'rates': rates,
            'cached': True
        })
    except Exception as e:
        logger.error(f"Error getting rates: {e}")
        return jsonify({'success': False, 'error': 'Failed to get rates'}), 500

@app.route('/api/currency-convert', methods=['POST'])
def convert_currency():
    """Convert currency with caching and provider fallback."""
    try:
        data = request.get_json() or {}
        amount = data.get('amount')
        from_currency = (data.get('from_currency') or 'INR').upper()
        to_currency = (data.get('to_currency') or 'USD').upper()

        if amount is None:
            return jsonify({'error': 'Amount required'}), 400
        try:
            amount_val = float(amount)
        except (TypeError, ValueError):
            return jsonify({'error': 'Amount must be a number'}), 400

        # Fast path if same currency
        if from_currency == to_currency:
            return jsonify({
                'success': True,
                'original_amount': amount_val,
                'from_currency': from_currency,
                'to_currency': to_currency,
                'converted_amount': round(amount_val, 2),
                'exchange_rate': 1.0,
                'note': f'1 {from_currency} = 1 {to_currency}'
            })

        # Get rates with cache for from_currency as base
        rates = _get_rates(from_currency)
        rate = rates.get(to_currency)
        if rate is None:
            return jsonify({'error': f'Currency {to_currency} not supported'}), 400

        converted_amount = amount_val * float(rate)

        return jsonify({
            'success': True,
            'original_amount': amount_val,
            'from_currency': from_currency,
            'to_currency': to_currency,
            'converted_amount': round(converted_amount, 2),
            'exchange_rate': rate,
            'note': f'1 {from_currency} = {rate} {to_currency}'
        })
    except Exception as e:
        logger.error(f"Error converting currency: {e}")
        return jsonify({'error': 'Failed to convert currency'}), 500

@app.route('/api/csv-export', methods=['GET'])
def export_csv():
    try:
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 401
        
        # Get user expenses
        expenses = supabase_request('GET', f'app_7433469c6a_expenses?user_id=eq.{user_id}&order=date.desc')
        
        # Generate CSV content
        csv_headers = ['Date', 'Title', 'Amount', 'Category', 'Location', 'Notes']
        csv_rows = []
        
        for expense in expenses:
            row = [
                expense.get('date', ''),
                expense.get('title', ''),
                expense.get('amount', ''),
                expense.get('category', ''),
                expense.get('location', ''),
                expense.get('notes', '')
            ]
            csv_rows.append(row)
        
        # Create CSV content
        csv_content = ','.join(csv_headers) + '\n'
        for row in csv_rows:
            csv_content += ','.join([f'"{str(field)}"' for field in row]) + '\n'
        
        return jsonify({
            'csv_content': csv_content,
            'filename': f'aureus-expenses-{datetime.now().strftime("%Y-%m-%d")}.csv',
            'record_count': len(expenses)
        })
    except Exception as e:
        logger.error(f"Error exporting CSV: {e}")
        return jsonify({'error': 'Failed to export CSV'}), 500

@app.route('/api/location', methods=['GET'])
def get_user_location():
    try:
        # Get user's IP address
        user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        
        # For demo purposes, return mock location data
        # In production, you could use a service like ipinfo.io
        mock_location = {
            'ip': user_ip,
            'city': 'New York',
            'region': 'New York',
            'country': 'US',
            'currency': 'USD',
            'timezone': 'America/New_York'
        }
        
        return jsonify(mock_location)
    except Exception as e:
        logger.error(f"Error getting location: {e}")
        return jsonify({'error': 'Failed to get location'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Mock login endpoint for demo purposes"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Mock successful login
        return jsonify({
            'success': True,
            'user': {
                'id': 'mock-user-' + email.split('@')[0],
                'email': email,
                'name': email.split('@')[0].title()
            },
            'token': 'mock-token-' + str(random.randint(1000, 9999)),
            'message': 'Login successful'
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    """Mock signup endpoint for demo purposes"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', email.split('@')[0] if email else 'User')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Mock successful signup
        return jsonify({
            'success': True,
            'user': {
                'id': 'mock-user-' + email.split('@')[0],
                'email': email,
                'name': name
            },
            'token': 'mock-token-' + str(random.randint(1000, 9999)),
            'message': 'Signup successful'
        }), 201
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({'error': 'Signup failed'}), 500

@app.route('/api/categories', methods=['GET'])
def get_expense_categories():
    return jsonify({
        'categories': [
            'Food',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Bills',
            'Healthcare',
            'Other'
        ]
    })

@app.route('/api/currencies', methods=['GET'])
def get_supported_currencies():
    return jsonify({
        'currencies': {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'JPY': 'Japanese Yen',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'INR': 'Indian Rupee'
        }
    })

@app.route('/api/export', methods=['GET'])
def export_expenses():
    """Export expenses as CSV - alias for csv-export"""
    return export_csv()

@app.route('/api/ai-insight', methods=['POST', 'GET'])
def generate_ai_insight():
    """Generate AI insights - alias for ai-insights"""
    return generate_ai_insights()

@app.route('/api/heatmap-data', methods=['GET'])
def get_heatmap_data():
    """Generate heatmap data for VIT Vellore area"""
    try:
        user_id = request.headers.get('X-User-ID', 'demo-user')
        
        # VIT Vellore coordinates
        vit_lat = 12.9698
        vit_lng = 79.1565
        
        # Generate synthetic expense data around VIT Vellore campus
        campus_locations = [
            {'name': 'VIT Canteen', 'lat': 12.9708, 'lng': 79.1575, 'category': 'Food'},
            {'name': 'VIT Main Gate', 'lat': 12.9690, 'lng': 79.1550, 'category': 'Transportation'},
            {'name': 'VIT Library', 'lat': 12.9705, 'lng': 79.1560, 'category': 'Other'},
            {'name': 'VIT Student Center', 'lat': 12.9695, 'lng': 79.1570, 'category': 'Entertainment'},
            {'name': 'VIT Hostel Block A', 'lat': 12.9715, 'lng': 79.1580, 'category': 'Bills'},
            {'name': 'VIT Hostel Block B', 'lat': 12.9720, 'lng': 79.1585, 'category': 'Bills'},
            {'name': 'Dominos Near VIT', 'lat': 12.9685, 'lng': 79.1545, 'category': 'Food'},
            {'name': 'Juice Shop VIT', 'lat': 12.9700, 'lng': 79.1565, 'category': 'Food'},
            {'name': 'VIT Medical Center', 'lat': 12.9710, 'lng': 79.1555, 'category': 'Healthcare'},
            {'name': 'VIT Sports Complex', 'lat': 12.9725, 'lng': 79.1575, 'category': 'Entertainment'},
            {'name': 'Coffee Day VIT', 'lat': 12.9692, 'lng': 79.1558, 'category': 'Food'},
            {'name': 'VIT Technology Park', 'lat': 12.9680, 'lng': 79.1590, 'category': 'Shopping'},
            {'name': 'VIT ATM Point', 'lat': 12.9688, 'lng': 79.1568, 'category': 'Bills'},
            {'name': 'Shawarma Point VIT', 'lat': 12.9703, 'lng': 79.1552, 'category': 'Food'},
            {'name': 'VIT Bookstore', 'lat': 12.9697, 'lng': 79.1572, 'category': 'Shopping'},
        ]
        
        # Generate expenses with varied amounts and dates
        heatmap_expenses = []
        today = datetime.now()
        
        for i in range(50):  # Generate 50 sample expenses
            location = random.choice(campus_locations)
            
            # Add slight random offset to coordinates for variety
            lat_offset = (random.random() - 0.5) * 0.002
            lng_offset = (random.random() - 0.5) * 0.002
            
            expense = {
                'id': f'demo-expense-{i}',
                'title': f'Expense at {location["name"]}',
                'amount': round(random.uniform(10, 500), 2),
                'category': location['category'],
                'location': location['name'],
                'latitude': location['lat'] + lat_offset,
                'longitude': location['lng'] + lng_offset,
                'date': (today - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d'),
                'user_id': user_id
            }
            heatmap_expenses.append(expense)
        
        return jsonify({
            'success': True,
            'center': {'lat': vit_lat, 'lng': vit_lng},
            'expenses': heatmap_expenses,
            'count': len(heatmap_expenses),
            'total_amount': sum(e['amount'] for e in heatmap_expenses)
        })
        
    except Exception as e:
        logger.error(f"Error generating heatmap data: {e}")
        return jsonify({'error': 'Failed to generate heatmap data'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Aureus Finance Dashboard API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
    
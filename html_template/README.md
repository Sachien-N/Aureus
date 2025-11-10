🚀 Aureus: AI-Driven Personalized Finance Dashboard
A comprehensive personal finance management application with AI-powered insights, built with HTML/CSS/JavaScript frontend and Flask backend, powered by Supabase database.

✨ Features
🎯 Core Functionality
User Authentication: Secure login/signup with Supabase Auth
Expense Tracking: Add, edit, delete, and categorize expenses
Real-time Dashboard: Interactive charts and financial statistics
AI Insights: Personalized financial advice powered by Google Gemini API
Currency Conversion: Multi-currency support with live exchange rates
Receipt Scanning: OCR-powered receipt processing with Tesseract.js
Map Visualization: Geographic expense tracking with Leaflet.js
Calendar View: Monthly expense calendar with reminders
CSV Export: Download expense data for external analysis
🎨 User Interface
Responsive Design: Works on desktop, tablet, and mobile
Light Color Scheme: Beautiful UI with Light Blue, Aqua, Peach, Mint Green, and Soft Yellow
Interactive Charts: Powered by Chart.js for expense analytics
Modern UX: Smooth animations and intuitive navigation
🔧 Technical Features
Real-time Updates: Live data synchronization
Offline Support: Local storage fallback
Security: Row Level Security (RLS) with Supabase
Performance: Optimized queries and caching
Scalability: Cloud-ready architecture
🏗️ Architecture
Frontend (HTML/CSS/JavaScript)
/frontend
├── index.html          # Main dashboard
├── login.html          # Authentication page
├── expenses.html       # Expense management
├── map.html           # Geographic visualization
├── calendar.html      # Calendar view
├── style.css          # Complete styling
├── script.js          # Main application logic
└── auth.js            # Authentication handling
Backend (Flask Python)
/backend
├── app.py             # Main Flask application
├── requirements.txt   # Python dependencies
└── README.md         # Documentation
Database (Supabase)
Users: Managed by Supabase Auth
Expenses: User expense records with RLS
Budgets: Budget tracking and limits
AI Insights: Generated financial insights
🚀 Quick Start
Prerequisites
Python 3.8+
Node.js (for development)
Supabase account
API keys for external services
Local Development
Clone the repository
git clone <repository-url>
cd aureus-finance-dashboard
Backend Setup
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export SUPABASE_URL="https://pqatgaqjvyzfohdrbrtb.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
export EXCHANGE_API_KEY="7de00d56058700d61d80ed2a"
export GEMINI_API_KEY="AIzaSyAR7uVLXc9HZIfNj-RWtD-J1LfNJLhqvKU"

# Run Flask development server
python app.py
Frontend Setup
# Open the frontend in a web browser
open index.html
# or serve with a local server
python -m http.server 8000
Access the Application
Frontend: http://localhost:8000
Backend API: http://localhost:5000
API Documentation: http://localhost:5000/api/health
Production Deployment
Backend (Render)
Connect your GitHub repository to Render
Set environment variables in Render dashboard
Deploy with automatic builds
Frontend (GitHub Pages)
Push frontend files to GitHub repository
Enable GitHub Pages in repository settings
Access via https://username.github.io/repository-name
🔑 API Configuration
Required API Keys
Supabase

Project URL: https://pqatgaqjvyzfohdrbrtb.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ExchangeRate API

API Key: 7de00d56058700d61d80ed2a
Endpoint: https://v6.exchangerate-api.com/v6/
Google Gemini API

API Key: AIzaSyAR7uVLXc9HZIfNj-RWtD-J1LfNJLhqvKU
📊 Database Schema
Expenses Table
CREATE TABLE app_7433469c6a_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date DATE NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Budgets Table
CREATE TABLE app_7433469c6a_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
AI Insights Table
CREATE TABLE app_7433469c6a_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    insight_text TEXT NOT NULL,
    insight_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
🔌 API Endpoints
Authentication
POST /api/auth/login - User login
POST /api/auth/signup - User registration
Expenses
GET /api/expenses - Get user expenses
POST /api/expenses - Create new expense
PUT /api/expenses/:id - Update expense
DELETE /api/expenses/:id - Delete expense
Dashboard
GET /api/dashboard - Get dashboard statistics
POST /api/ai-insights - Generate AI insights
GET /api/csv-export - Export expenses to CSV
Utilities
POST /api/currency-convert - Convert currencies
GET /api/location - Get user location
GET /api/categories - Get expense categories
GET /api/currencies - Get supported currencies
🎨 UI Components
Color Palette
Primary: Light Blue (#87CEEB)
Secondary: Mint Green (#98FB98)
Accent: Peach (#FFE4B5)
Highlight: Soft Yellow (#F0E68C)
Text: Steel Blue (#4682B4)
Typography
Font Family: ‘Segoe UI’, Tahoma, Geneva, Verdana, sans-serif
Headings: Bold, Steel Blue color
Body: Regular weight, dark gray
Layout
Grid System: CSS Grid and Flexbox
Breakpoints: Mobile-first responsive design
Spacing: Consistent 20px grid system
🔧 Development
Project Structure
aureus-finance-dashboard/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── expenses.html
│   ├── map.html
│   ├── calendar.html
│   ├── style.css
│   ├── script.js
│   └── auth.js
├── backend/
│   ├── app.py
│   └── requirements.txt
├── docs/
│   └── README.md
└── assets/
    ├── logo.png
    └── sample_receipt.jpg
Code Style
JavaScript: ES6+ features, async/await
Python: PEP 8 compliance, type hints
CSS: BEM methodology, CSS Grid/Flexbox
HTML: Semantic markup, accessibility
Testing
# Frontend testing (manual)
open index.html

# Backend testing
python -m pytest tests/

# API testing
curl http://localhost:5000/api/health
🚀 Deployment
Environment Variables
# Required for production
SUPABASE_URL=https://pqatgaqjvyzfohdrbrtb.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
EXCHANGE_API_KEY=7de00d56058700d61d80ed2a
GEMINI_API_KEY=AIzaSyAR7uVLXc9HZIfNj-RWtD-J1LfNJLhqvKU
FLASK_ENV=production
PORT=5000
Docker Deployment
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
📱 Features in Detail
🤖 AI Insights
Spending Pattern Analysis: Identifies top spending categories
Budget Recommendations: Suggests optimal budget allocations
Savings Tips: Personalized advice based on spending habits
Trend Analysis: Monthly and weekly spending trends
📊 Analytics
Category Breakdown: Doughnut chart showing expense distribution
Trend Analysis: Line chart showing daily spending patterns
Monthly Summary: Statistical overview of monthly expenses
Comparative Analysis: Month-over-month comparisons
🗺️ Map Features
Expense Locations: Visual representation of spending locations
Geographic Insights: Spending patterns by location
Interactive Markers: Detailed expense information on click
Filter Options: Filter by category, date range, amount
📅 Calendar Features
Monthly View: Calendar grid showing daily expenses
Expense Indicators: Visual indicators for spending days
Daily Details: Detailed breakdown of daily expenses
Reminders: Financial reminders and bill due dates
🔒 Security
Authentication
Supabase Auth: Secure user authentication
JWT Tokens: Stateless authentication
Row Level Security: Database-level access control
Data Protection
HTTPS: Encrypted data transmission
Input Validation: Server-side validation
SQL Injection Protection: Parameterized queries
XSS Protection: Content Security Policy
📈 Performance
Optimization
Lazy Loading: Load data on demand
Caching: Browser and server-side caching
Compression: Gzip compression for assets
CDN: Content delivery network for static assets
Monitoring
Error Tracking: Comprehensive error logging
Performance Metrics: Response time monitoring
User Analytics: Usage pattern analysis
🤝 Contributing
Fork the repository
Create a feature branch
Make your changes
Add tests
Submit a pull request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Supabase for backend infrastructure
Chart.js for data visualization
Leaflet.js for mapping functionality
Tesseract.js for OCR capabilities
ExchangeRate API for currency conversion
Google Gemini API for AI insights
📞 Support
For support, email support@aureus-finance.com or create an issue in the GitHub repository.

Built with ❤️ for better financial management
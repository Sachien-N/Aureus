# Aureus: AI-Driven Personalized Finance Dashboard

A complete full-stack personal finance management application with AI-powered insights, expense tracking, geographic visualization, and calendar integration.

## 🌟 Features

### ✅ Completed Features

1. **Authentication System**
   - Login/Signup with Supabase authentication
   - Mock authentication fallback for demo
   - Secure session management

2. **Expense Management**
   - Add, edit, and delete expenses
   - Category-based organization (Food, Transportation, Shopping, etc.)
   - Location tracking with geocoding
   - Date-based filtering
   - CSV export functionality

3. **AI-Powered Insights**
   - Smart spending pattern analysis
   - Budget recommendations
   - Savings tips
   - Location-based insights (VIT Vellore focused)
   - Real-time insight generation

4. **Interactive Map Visualization**
   - Expense heatmap centered on VIT Vellore campus
   - 50+ synthetic demo locations around campus
   - Interactive markers with expense details
   - Category-based filtering
   - Real-time expense plotting

5. **Financial Calendar**
   - Monthly expense calendar view
   - Daily spending totals
   - Monthly statistics and trends
   - Financial reminder system
   - Transaction history

6. **Receipt Scanner (OCR)**
   - Tesseract.js integration
   - Automatic expense extraction from receipts
   - Image upload and processing

7. **Currency Management**
   - Multi-currency support (USD, EUR, GBP, JPY, CAD, AUD, INR)
   - Real-time exchange rate conversion
   - ExchangeRate API integration
   - Tamil Rupee (₹) symbol for INR

8. **Dashboard Analytics**
   - Real-time expense charts (Chart.js)
   - Category breakdown (doughnut chart)
   - Weekly spending trends (line chart)
   - Summary statistics cards

## 🚀 Local Setup

### Prerequisites

- Python 3.8+
- Node.js 14+ (optional, for frontend dev)
- Supabase account (or use mock mode)

### Backend Setup

1. **Clone and navigate to project:**
   ```bash
   cd E:\Aureues\html_template
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update with your API keys (or use demo mode)

5. **Run Flask server:**
   ```bash
   python app.py
   ```
   
   Server will start at: `http://localhost:5000`

### Frontend Access

Open any HTML file directly in browser:
- Login: `http://localhost:5000/login.html`
- Dashboard: `http://localhost:5000/index.html`
- Expenses: `http://localhost:5000/expenses.html`
- Map: `http://localhost:5000/map.html`
- Calendar: `http://localhost:5000/calendar.html`

## 📁 Project Structure

```
html_template/
├── app.py                 # Flask backend with all API endpoints
├── requirements.txt       # Python dependencies
├── Procfile              # Render deployment config
├── .env.example          # Environment variables template
├── index.html            # Main dashboard
├── login.html            # Authentication page
├── expenses.html         # Expense management
├── map.html              # Geographic visualization (VIT Vellore)
├── calendar.html         # Financial calendar
├── style.css             # Complete styling
├── script.js             # Dashboard JavaScript
├── auth.js               # Authentication logic
├── package.json          # Node dependencies (optional)
└── README_DEPLOY.md      # This file
```

## 🎯 API Endpoints

### Authentication
- `POST /api/login` - User login (mock/Supabase)
- `POST /api/signup` - User registration

### Expenses
- `GET /api/expenses` - Fetch all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/csv-export` - Export expenses as CSV
- `GET /api/export` - Alias for CSV export

### AI & Analytics
- `GET /api/ai-insights` - Generate AI financial insights
- `POST /api/ai-insight` - Enhanced AI insights with data

### Map & Location
- `GET /api/heatmap-data` - VIT Vellore expense heatmap data
- `GET /api/location` - User location detection

### Utilities
- `GET /api/currencies` - Supported currencies
- `GET /api/categories` - Expense categories
- `POST /api/currency-convert` - Currency conversion
- `GET /api/health` - API health check

## 🌐 Deployment

### Deploy Backend to Render

1. **Create Render account** at [render.com](https://render.com)

2. **Create new Web Service:**
   - Connect your GitHub repository
   - Select `html_template` as root directory
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`

3. **Add environment variables:**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_key
   EXCHANGE_API_KEY=your_key
   GEMINI_API_KEY=your_key
   PORT=10000
   ```

4. **Deploy!** Render will auto-deploy on git push

### Deploy Frontend to GitHub Pages

1. **Update API URLs** in HTML/JS files:
   ```javascript
   // Replace localhost:5000 with your Render URL
   const API_BASE_URL = 'https://your-app.onrender.com';
   ```

2. **Create GitHub repository:**
   ```bash
   git init
   git add *.html *.css *.js
   git commit -m "Deploy frontend"
   git remote add origin https://github.com/yourusername/aureus.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Select `main` branch and `/root`
   - Save

4. **Access at:** `https://yourusername.github.io/aureus/`

## 🎨 Color Scheme (Soft Pastels)

- Light Blue: `#87CEEB` - Primary accent
- Aqua: `#98FB98` - Success states
- Peach: `#FFE4B5` - Warm highlights
- Mint Green: `#98FB98` - Positive indicators
- Soft Yellow: `#F0E68C` - Warnings
- Steel Blue: `#4682B4` - Primary text/buttons

## 🗺️ VIT Vellore Locations

The map includes 15 campus locations:
- VIT Canteen
- VIT Main Gate
- VIT Library
- VIT Student Center
- VIT Hostel Blocks A & B
- Dominos Near VIT
- Juice Shop VIT
- VIT Medical Center
- VIT Sports Complex
- Coffee Day VIT
- VIT Technology Park
- VIT ATM Point
- Shawarma Point VIT
- VIT Bookstore

## 🧪 Testing

### Test Credentials (Mock Mode)
- Email: `test@vit.edu`
- Password: `password123`

### Test Features Locally

1. **Start backend:**
   ```bash
   python app.py
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/heatmap-data
   ```

3. **Test frontend:**
   - Open `http://localhost:5000/login.html`
   - Sign up with any email
   - Explore dashboard, expenses, map, calendar

4. **Test CSV export:**
   - Add some expenses
   - Click "Export CSV" button
   - Check downloaded file

5. **Test OCR (Receipt Scanner):**
   - Click "Scan Receipt" on dashboard
   - Upload receipt image
   - Verify extracted data

## 📊 Demo Data

The application automatically generates:
- 50 sample expenses around VIT Vellore
- Varied categories and amounts (₹10-500)
- Last 30 days of transactions
- Multiple campus locations

## 🔧 Troubleshooting

### Backend Issues

**CORS errors:**
```python
# app.py already has CORS enabled
CORS(app)  # Allows all origins
```

**Supabase connection failed:**
- App automatically falls back to mock data
- Check console for "Supabase not available" message

**Port already in use:**
```bash
# Change port in app.py
port = int(os.environ.get('PORT', 5001))
```

### Frontend Issues

**API not loading:**
- Check backend is running on port 5000
- Verify URL in fetch requests
- Check browser console for errors

**Map not showing:**
- Ensure Leaflet CSS/JS loaded
- Check browser console for errors
- Verify heatmap data endpoint working

## 🎓 For VIT Students

This project is tailored for VIT Vellore students with:
- Campus-specific locations
- Indian Rupee (₹) as primary currency
- Hostel, canteen, and campus expense tracking
- Student-friendly budget recommendations

## 📝 License

MIT License - Free to use for educational purposes

## 👨‍💻 Author

Created for VIT Vellore students as a personal finance management tool.

## 🔗 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Chart.js Guide](https://www.chartjs.org/docs/)
- [Leaflet Maps](https://leafletjs.com/)
- [Tesseract.js OCR](https://tesseract.projectnaptha.com/)

---

**Ready for demo!** 🎉

Run `python app.py` and visit `http://localhost:5000/login.html` to get started!

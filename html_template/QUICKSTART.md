# 🚀 Aureus Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start the Backend (Terminal 1)

```bash
cd E:\Aureues\html_template

# Activate virtual environment
venv\Scripts\activate

# Run Flask server
python app.py
```

**Expected output:**
```
INFO:__main__:Starting Aureus Finance Dashboard API on port 5000
 * Running on http://127.0.0.1:5000
```

✅ Backend is now running!

### Step 2: Open in Browser

Open your browser and navigate to:
```
http://localhost:5000/login.html
```

### Step 3: Create Account

1. Click "Sign up here"
2. Enter any email (e.g., `student@vit.edu`)
3. Enter any password
4. Click "Create Account"

✅ You'll be redirected to the dashboard!

## 📱 Pages to Explore

### 1. Dashboard (index.html)
- View expense statistics
- See AI-powered insights
- Interactive charts
- Quick actions (Add Expense, Scan Receipt, Export CSV)

**URL:** `http://localhost:5000/index.html`

### 2. Expenses Manager (expenses.html)
- Add, edit, delete expenses
- Filter by category and date
- View all transactions

**URL:** `http://localhost:5000/expenses.html`

### 3. Expense Map (map.html)
- Interactive map centered on VIT Vellore
- Heatmap of expenses
- 50+ demo expenses around campus
- Click markers for details

**URL:** `http://localhost:5000/map.html`

### 4. Financial Calendar (calendar.html)
- Monthly expense calendar
- Daily spending totals
- Add financial reminders
- Export CSV

**URL:** `http://localhost:5000/calendar.html`

## 🎯 Features to Test

### ✅ Add Expense
1. Click "Add Expense" on dashboard
2. Fill in details (Title, Amount, Category, Date, Location)
3. Click "Add Expense"
4. Check expenses page to see it listed

### ✅ Scan Receipt (OCR)
1. Click "Scan Receipt" on dashboard
2. Click "Select Receipt Image"
3. Upload a receipt image
4. System will extract amount, merchant, date
5. Add as expense with pre-filled data

### ✅ View AI Insights
1. Dashboard shows 4 AI insights:
   - 💡 Spending Pattern
   - 💰 Budget Recommendation
   - 📈 Savings Tip
   - 📍 Location Insight
2. Click "Refresh Insights" for new insights

### ✅ Export CSV
1. Add some expenses
2. Click "Export CSV" button
3. Download CSV file with all expenses

### ✅ View Expense Map
1. Go to Map page
2. See VIT Vellore campus with 50+ demo expenses
3. Click markers to see expense details
4. Use category filter to filter expenses

### ✅ Change Currency
1. Click "Set Currency" on dashboard
2. Select currency (USD, EUR, GBP, INR, etc.)
3. All amounts will be converted

## 🧪 Test API Endpoints (Optional)

In a new terminal (keep Flask running):

```bash
cd E:\Aureues\html_template
venv\Scripts\activate
python test_api.py
```

This will test all API endpoints and show results.

## 📊 Demo Data

The app includes:
- **50 sample expenses** around VIT Vellore
- **15 campus locations** (Canteen, Library, Hostels, etc.)
- **Varied categories** (Food, Transport, Shopping, etc.)
- **Amounts:** ₹10 - ₹500
- **Date range:** Last 30 days

## 🎨 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ | Login/Signup with Supabase |
| Add Expenses | ✅ | Create, edit, delete expenses |
| Categories | ✅ | 7 expense categories |
| Location Tracking | ✅ | Geocoding with OpenStreetMap |
| AI Insights | ✅ | 4 types of financial insights |
| Expense Map | ✅ | Interactive heatmap (VIT Vellore) |
| Calendar View | ✅ | Monthly expense calendar |
| CSV Export | ✅ | Download all expenses |
| Receipt Scanner | ✅ | OCR with Tesseract.js |
| Currency Converter | ✅ | 7 currencies supported |
| Charts | ✅ | Doughnut & line charts |
| Responsive Design | ✅ | Mobile & desktop friendly |

## 🔧 Troubleshooting

### Problem: "Module not found" error
**Solution:**
```bash
pip install -r requirements.txt
```

### Problem: Port 5000 already in use
**Solution:** Kill the process or change port in `app.py`:
```python
port = int(os.environ.get('PORT', 5001))  # Change to 5001
```

### Problem: Map not loading
**Solution:** 
- Check browser console for errors
- Ensure Flask server is running
- Try accessing: `http://localhost:5000/api/heatmap-data`

### Problem: Can't access from other devices
**Solution:** Use your local IP instead of localhost:
```
http://172.16.202.98:5000/login.html
```
(Replace with your actual IP from Flask startup message)

## 📱 Mobile Testing

1. Find your computer's IP address (shown in Flask startup)
2. On mobile, connect to same WiFi
3. Open: `http://YOUR-IP:5000/login.html`

## 🎓 VIT Vellore Students

This project includes:
- ✅ VIT campus locations
- ✅ Indian Rupee (₹) currency
- ✅ Hostel & canteen expense tracking
- ✅ Student budget recommendations

## 🎉 You're All Set!

The app is fully functional with:
- ✅ All pages working
- ✅ AI insights generating
- ✅ Map showing VIT Vellore
- ✅ CSV export ready
- ✅ Receipt scanner enabled
- ✅ No errors in console

**Enjoy using Aureus!** 🌟

---

Need help? Check `README_DEPLOY.md` for detailed documentation.

# Aureues Currency System - INR Base

## 💰 Overview

The Aureues Finance Dashboard now uses **Indian Rupees (INR ₹)** as the base currency for all expense entries. The application automatically converts amounts to other currencies using real-time exchange rates.

## 🔄 How It Works

### 1. **Entering Expenses**
- All expenses are entered in **INR (₹)**
- The amount field clearly shows: "Amount (in ₹ INR)"
- Example: Enter `1000` for ₹1,000

### 2. **Storage**
- Amounts are stored in the database in **INR**
- Currency field stores "INR" for all new entries
- No conversion happens during storage

### 3. **Display & Conversion**
- View expenses in **any currency** using the currency selector
- Real-time conversion using ExchangeRate API
- Live exchange rates update automatically

## 📊 Currency Converter Widget

The dashboard includes a built-in currency converter:

### Location
Dashboard page → Currency Converter section (above AI Insights)

### Features
- **Input**: Enter amount in INR (₹)
- **Output**: See instant conversions to:
  - USD (US Dollar)
  - EUR (Euro)
  - GBP (British Pound)
- **Real-time**: Updates as you type
- **Live Rates**: Fetched from ExchangeRate API

### Example
```
Input: ₹1000
Output:
  USD: $11.28
  EUR: €9.84
  GBP: £8.30
```

## 🌍 Supported Currencies

### Display Currencies
You can view your expenses in any of these currencies:
- **INR** - Indian Rupee (₹) - Base currency
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **JPY** - Japanese Yen (¥)
- **CAD** - Canadian Dollar (CAD)
- **AUD** - Australian Dollar (AUD)

### More Currencies Available
The ExchangeRate API supports 88+ currencies. More can be added to the dropdown easily.

## 💡 Usage Examples

### Example 1: Add Expense in INR
1. Click "Add Expense"
2. Enter title: "Lunch at DC"
3. Enter amount: `350` (₹350)
4. Select category: "Food & Dining"
5. Save

**Result**: Stored as ₹350 in database

### Example 2: View in USD
1. Go to Dashboard
2. Click "Set Currency" button
3. Select "USD"
4. Click "Set Currency"

**Result**: All amounts displayed in USD
- ₹350 → $3.95 (using current exchange rate)

### Example 3: Use Currency Converter
1. On Dashboard, find "Currency Converter" section
2. Enter: `5000` in the input field
3. See instant conversions:
   - USD: $56.50
   - EUR: €49.25
   - GBP: £41.50

## 🔧 Technical Details

### Exchange Rate API
- **Provider**: ExchangeRate-API.com
- **Base Currency**: INR
- **Endpoint**: `https://v6.exchangerate-api.com/v6/API_KEY/latest/INR`
- **Update Frequency**: Daily (from API provider)
- **Fallback**: Local mock rates if API fails

### Conversion Formula
```javascript
// From INR to other currency
convertedAmount = amountInINR × exchangeRate[targetCurrency]

// Example: INR to USD
amountInUSD = 1000 × 0.0113 = $11.30
```

### Current Exchange Rates (as of last test)
```
1 INR = 0.0113 USD
1 INR = 0.0098 EUR
1 INR = 0.0083 GBP
1 INR = 1.24 JPY
1 INR = 0.0141 CAD
1 INR = 0.0153 AUD
```

## 📱 User Interface

### Form Labels
All expense forms now show:
```
Amount (in ₹ INR)
Enter amount in Indian Rupees (will convert to selected currency)
```

### Currency Display
- INR: Shows as "₹1,000.00"
- USD: Shows as "$11.28"
- EUR: Shows as "€9.84"
- GBP: Shows as "£8.30"

### Number Formatting
- Indian format for INR: ₹1,00,000.00
- International format for others: $1,000.00

## 🎯 Benefits

1. **Local Context**: Enter expenses naturally in INR
2. **Global View**: Compare with international currencies
3. **Real-time**: Always use current exchange rates
4. **Flexibility**: Switch display currency anytime
5. **Accuracy**: Professional-grade exchange rate data

## 🔄 API Integration

### Backend Endpoint
```python
POST /api/currency-convert
{
    "amount": 1000,
    "from_currency": "INR",  # Default
    "to_currency": "USD"
}

Response:
{
    "success": true,
    "original_amount": 1000,
    "from_currency": "INR",
    "to_currency": "USD",
    "converted_amount": 11.28,
    "exchange_rate": 0.0113,
    "note": "1 INR = 0.0113 USD"
}
```

### Frontend Function
```javascript
// Load exchange rates (base: INR)
await loadExchangeRates();

// Convert and format
const displayAmount = formatCurrency(1000, 'USD');
// Returns: "$11.28"
```

## 📈 Future Enhancements

Potential features:
- [ ] Historical exchange rates
- [ ] Currency trend charts
- [ ] Budget planning in multiple currencies
- [ ] Expense forecasting with currency impact
- [ ] Multi-currency expense reports

## 🛠️ Configuration

### Change Base Currency
To change from INR to another base currency:

1. Edit `script.js`:
```javascript
// Line 477: Change INR to your preferred base
const response = await fetch(`...latest/USD`);  // Instead of INR
```

2. Update form labels in HTML files
3. Update converter widget defaults

### Add New Currencies
To add more currencies to the dropdown:

1. Edit `index.html` currency modal:
```html
<option value="CHF">CHF - Swiss Franc</option>
```

2. Currency will work automatically with API

## ✅ Testing

Verify the currency system:
```powershell
cd E:\Aureues\html_template
python test_integration.py
```

Should show:
```
ExchangeRate API     ✅ PASS
```

## 📞 Support

For currency-related issues:
- Check browser console for exchange rate logs
- Verify API key in `.env` file
- Ensure internet connection for API access
- Check fallback rates are loading if API fails

---

**Status**: ✅ INR-based currency system fully operational!

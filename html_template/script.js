// Global variables
let currentUser = null;
let expenses = [];
let currentCurrency = 'INR';
let exchangeRates = {};

// API Configuration (do not expose secrets in frontend)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';
// Keep track of what base the rates use
let exchangeRatesBase = 'INR';

// Manual conversion rates (per 1 INR). No API calls.
// Update these values if you want to adjust conversion.
const MANUAL_RATES_INR_BASE = {
    INR: 1,
    USD: 0.0113, // 1 INR -> USD
    EUR: 0.0098, // 1 INR -> EUR
    GBP: 0.0083, // 1 INR -> GBP
    JPY: 1.24,   // 1 INR -> JPY
    CAD: 0.0141, // 1 INR -> CAD
    AUD: 0.0153  // 1 INR -> AUD
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize converter regardless of auth
        await loadExchangeRates();
        const converterInput = document.getElementById('converterAmount');
        if (converterInput) {
            converterInput.addEventListener('input', updateCurrencyConverter);
            updateCurrencyConverter();
        }

        // Initialize AI Insights regardless of auth
        const refreshInsightsBtn = document.getElementById('refreshInsights');
        if (refreshInsightsBtn) {
            refreshInsightsBtn.addEventListener('click', generateAIInsights);
        }
        // Render initial random insights
        await generateAIInsights();

        // Wire Quick Actions regardless of auth so buttons work on public dashboard
        setupEventListeners();

        // Auth-gated dashboard features
        currentUser = await checkAuthStatus();
        if (currentUser) {
            const savedCurrency = localStorage.getItem('aureus_currency');
            if (savedCurrency) {
                currentCurrency = savedCurrency;
            }
            await initializeDashboard();
            updateDashboardCurrencyDisplay();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

async function initializeDashboard() {
    try {
        // Load user preferences
        loadUserPreferences();
        
        // Load expenses and update dashboard
        await loadExpenses();
        await loadExchangeRates();
        
        // Initialize charts
        initializeCharts();
        
        // Generate AI insights
        await generateAIInsights();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

function setupEventListeners() {
    // Modal close functionality
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    // Window click to close modals
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Currency converter input
    const converterInput = document.getElementById('converterAmount');
    if (converterInput) {
        converterInput.addEventListener('input', updateCurrencyConverter);
    }
    
    // Add expense button
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', openAddExpenseModal);
    }
    
    // Scan receipt button
    const scanReceiptBtn = document.getElementById('scanReceiptBtn');
    if (scanReceiptBtn) {
        scanReceiptBtn.addEventListener('click', openScanModal);
    }
    
    // Export CSV button
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCsv);
    }
    
    // Set currency button
    const setCurrencyBtn = document.getElementById('setCurrencyBtn');
    if (setCurrencyBtn) {
        setCurrencyBtn.addEventListener('click', openCurrencyModal);
    }

    // Edit Budget & Goal button
    const editBudgetBtn = document.getElementById('editBudgetBtn');
    if (editBudgetBtn) {
        editBudgetBtn.addEventListener('click', openBudgetModal);
    }

    // Save Budget & Goal
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener('click', handleSaveBudgetGoal);
    }
    
    // Refresh insights button
    const refreshInsightsBtn = document.getElementById('refreshInsights');
    if (refreshInsightsBtn) {
        refreshInsightsBtn.addEventListener('click', generateAIInsights);
    }
    
    // Expense form submission
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Receipt file selection
    const receiptFile = document.getElementById('receiptFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    if (receiptFile && selectFileBtn) {
        selectFileBtn.addEventListener('click', () => receiptFile.click());
        receiptFile.addEventListener('change', handleReceiptUpload);
    }
    
    // Currency selection
    const setCurrencyModalBtn = document.getElementById('setCurrency');
    if (setCurrencyModalBtn) {
        setCurrencyModalBtn.addEventListener('click', handleCurrencyChange);
    }
}

async function loadExpenses() {
    try {
        const { data: expenseData, error } = await supabase
            .from('app_7433469c6a_expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        expenses = expenseData || [];
        
        // Update dashboard even if no expenses
        updateDashboardStats();
        updateCharts();
        
        if (expenses.length === 0) {
            console.log('No expenses found. Add your first expense to get started!');
        }
        
    } catch (error) {
        console.error('Error loading expenses:', error);
        showMessage('Failed to load expenses', 'error');
    }
}

async function createSampleData() {
    const sampleExpenses = [
        {
            title: 'Grocery Shopping',
            amount: 85.50,
            category: 'Food',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Whole Foods Market',
            notes: 'Weekly grocery shopping',
            user_id: currentUser.id
        },
        {
            title: 'Gas Station',
            amount: 45.20,
            category: 'Transportation',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Shell Gas Station',
            notes: 'Fuel for car',
            user_id: currentUser.id
        },
        {
            title: 'Coffee Shop',
            amount: 12.75,
            category: 'Food',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Starbucks',
            notes: 'Morning coffee and pastry',
            user_id: currentUser.id
        },
        {
            title: 'Movie Tickets',
            amount: 28.00,
            category: 'Entertainment',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'AMC Theater',
            notes: 'Date night movie',
            user_id: currentUser.id
        },
        {
            title: 'Online Shopping',
            amount: 156.99,
            category: 'Shopping',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Amazon',
            notes: 'Electronics and household items',
            user_id: currentUser.id
        }
    ];

    try {
        const { error } = await supabase
            .from('app_7433469c6a_expenses')
            .insert(sampleExpenses);

        if (error) throw error;
        
        showMessage('Sample data created successfully!', 'success');
    } catch (error) {
        console.error('Error creating sample data:', error);
    }
}

function updateDashboardStats() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Calculate monthly expenses
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }).reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Budget data from preferences (fallback defaults)
    const monthlyBudgetPref = parseFloat(localStorage.getItem('aureus_monthly_budget') || '2000');
    const monthlyBudget = isFinite(monthlyBudgetPref) ? monthlyBudgetPref : 2000;
    const remainingBudget = monthlyBudget - monthlyExpenses;
    const savingsGoalPref = parseFloat(localStorage.getItem('aureus_savings_goal') || '500');
    const savingsGoal = isFinite(savingsGoalPref) ? savingsGoalPref : 500;
    
    // Update UI
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('monthlyBudget').textContent = formatCurrency(monthlyBudget);
    document.getElementById('remainingBudget').textContent = formatCurrency(remainingBudget);
    document.getElementById('savingsGoal').textContent = formatCurrency(savingsGoal);
}

function initializeCharts() {
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        const categoryData = getCategoryData();
        
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#87CEEB', '#98FB98', '#FFE4B5', '#FFA07A', 
                        '#DDA0DD', '#F0E68C', '#87CEFA', '#FFB6C1'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    // Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        const trendData = getTrendData();
        
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Daily Expenses',
                    data: trendData.data,
                    borderColor: '#4682B4',
                    backgroundColor: 'rgba(70, 130, 180, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#87CEEB',
                    pointBorderColor: '#4682B4',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(135, 206, 235, 0.2)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(135, 206, 235, 0.2)'
                        }
                    }
                }
            }
        });
    }
}

function getCategoryData() {
    const categories = {};
    expenses.forEach(expense => {
        const category = expense.category;
        categories[category] = (categories[category] || 0) + parseFloat(expense.amount);
    });
    
    return {
        labels: Object.keys(categories),
        data: Object.values(categories)
    };
}

function getTrendData() {
    const last7Days = [];
    const dailyTotals = {};
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        dailyTotals[dateStr] = 0;
    }
    
    // Calculate daily totals
    expenses.forEach(expense => {
        if (dailyTotals.hasOwnProperty(expense.date)) {
            dailyTotals[expense.date] += parseFloat(expense.amount);
        }
    });
    
    return {
        labels: last7Days,
        data: Object.values(dailyTotals)
    };
}

function updateCharts() {
    // This would update existing charts with new data
    // For now, we'll reinitialize them
    initializeCharts();
}

async function generateAIInsights() {
    const insightsContainer = document.getElementById('aiInsights');
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = '<div class="loading">Generating personalized insights...</div>';
    
    try {
        const expensesSummary = prepareExpensesForAI();
        const insights = await getMockAIInsights(expensesSummary);
        
        insightsContainer.innerHTML = `
            <div class="insight-item">
                <h4>💡 Spending Pattern</h4>
                <p>${insights.spendingPattern}</p>
            </div>
            <div class="insight-item">
                <h4>💰 Budget Recommendation</h4>
                <p>${insights.budgetRecommendation}</p>
            </div>
            <div class="insight-item">
                <h4>📈 Savings Tip</h4>
                <p>${insights.savingsTip}</p>
            </div>
            ${insights.locationInsight ? `
            <div class="insight-item">
                <h4>📍 Location Insight</h4>
                <p>${insights.locationInsight}</p>
            </div>` : ''}
        `;
    } catch (error) {
        console.error('Error generating AI insights:', error);
        insightsContainer.innerHTML = '<div class="error">Failed to generate insights. Please try again.</div>';
    }
}

function prepareExpensesForAI() {
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth;
    });
    
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const categories = {};
    
    monthlyExpenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + parseFloat(expense.amount);
    });
    
    return {
        totalSpent,
        categories,
        transactionCount: monthlyExpenses.length,
        averageTransaction: totalSpent / monthlyExpenses.length || 0
    };
}

async function getMockAIInsights(expensesSummary) {
    const categories = Object.keys(expensesSummary.categories);
    const topCategory = categories.length > 0
        ? categories.reduce((a, b) => expensesSummary.categories[a] > expensesSummary.categories[b] ? a : b)
        : 'Food';
    const topAmount = expensesSummary.categories[topCategory] || 0;
    const totalSpent = expensesSummary.totalSpent || 0;
    const avgTxn = expensesSummary.averageTransaction || 0;
    const txnCount = expensesSummary.transactionCount || 0;

    const patterns = [
        {
            spendingPattern: `Your top spend is in ${topCategory} at ${formatCurrency(topAmount)}. Consider tracking this category more closely for a week.`,
            budgetRecommendation: `Set a weekly budget of ${formatCurrency(Math.max(totalSpent * 0.25, 1000))} to regain control while staying flexible.`,
            savingsTip: `Skipping two discretionary purchases could save about ${formatCurrency(Math.max(avgTxn * 2, 250))} this week.`
        },
        {
            spendingPattern: `Spending is steady across categories, with ${topCategory} slightly higher at ${formatCurrency(topAmount)}.`,
            budgetRecommendation: `Try envelope budgeting: allocate ${formatCurrency(Math.max(totalSpent * 0.3, 1500))} to high-variance categories.`,
            savingsTip: `Automate savings of ${formatCurrency(Math.max(totalSpent * 0.05, 500))} monthly to build a cushion.`
        },
        {
            spendingPattern: `You made ${txnCount} transactions. Average per transaction is ${formatCurrency(avgTxn)}.`,
            budgetRecommendation: `Cap daily variable spend to ${formatCurrency(Math.max(avgTxn * 2, 600))} on weekdays.`,
            savingsTip: `Batch small purchases to reduce impulse spends; aim to cut ${formatCurrency(Math.max(totalSpent * 0.08, 400))} this month.`
        },
        {
            spendingPattern: `This month’s peak category is ${topCategory}. A 10% trim there saves ~${formatCurrency(topAmount * 0.1)}.`,
            budgetRecommendation: `Create a category cap: ${formatCurrency(Math.max(topAmount * 0.9, 1200))} for ${topCategory}.`,
            savingsTip: `Use a 24-hour rule before non-essential buys; target ${formatCurrency(Math.max(totalSpent * 0.07, 350))} in avoided costs.`
        }
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
}

async function loadExchangeRates() {
    // Manual mode: use fixed rates, no network requests
    exchangeRates = { ...MANUAL_RATES_INR_BASE };
    exchangeRatesBase = 'INR';
    console.log('Exchange rates set manually (base: INR):', exchangeRates);
    updateCurrencyConverter();
}

function updateCurrencyConverter() {
    const amountInput = document.getElementById('converterAmount');
    const usdDisplay = document.getElementById('convertedUSD');
    const eurDisplay = document.getElementById('convertedEUR');
    const gbpDisplay = document.getElementById('convertedGBP');
    
    if (!amountInput || !usdDisplay || !eurDisplay || !gbpDisplay) return;
    
    const inrAmount = parseFloat(amountInput.value) || 0;
    // Ensure rates base is INR for this widget; if not, convert input INR -> base first then to targets via convertCurrency helper
    let usdAmount, eurAmount, gbpAmount;
    if (exchangeRatesBase === 'INR') {
        usdAmount = inrAmount * (exchangeRates.USD || 0.0113);
        eurAmount = inrAmount * (exchangeRates.EUR || 0.0098);
        gbpAmount = inrAmount * (exchangeRates.GBP || 0.0083);
    } else {
        usdAmount = convertCurrency(inrAmount, 'INR', 'USD');
        eurAmount = convertCurrency(inrAmount, 'INR', 'EUR');
        gbpAmount = convertCurrency(inrAmount, 'INR', 'GBP');
    }
    
    usdDisplay.textContent = '$' + (isFinite(usdAmount) ? usdAmount.toFixed(2) : '0.00');
    eurDisplay.textContent = '€' + (isFinite(eurAmount) ? eurAmount.toFixed(2) : '0.00');
    gbpDisplay.textContent = '£' + (isFinite(gbpAmount) ? gbpAmount.toFixed(2) : '0.00');
}

function formatCurrency(amount, currency = currentCurrency) {
    // Amount is stored in INR, convert to display currency
    const convertedAmount = convertCurrency(amount, 'INR', currency);
    
    // Use Indian Rupee symbol for INR
    if (currency === 'INR') {
        return 'ரூ' + new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(convertedAmount);
    }
    
    // Default currency formatting for other currencies
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(convertedAmount);
}

function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    // exchangeRates represent rates per 1 exchangeRatesBase -> X currency
    // Convert from source to base, then to target
    fromCurrency = (fromCurrency || exchangeRatesBase).toUpperCase();
    toCurrency = (toCurrency || exchangeRatesBase).toUpperCase();
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
        // As a safety net, assume 1 if missing
        if (!exchangeRates[fromCurrency]) exchangeRates[fromCurrency] = fromCurrency === exchangeRatesBase ? 1 : 0;
        if (!exchangeRates[toCurrency]) exchangeRates[toCurrency] = toCurrency === exchangeRatesBase ? 1 : 0;
    }
    // amount_in_base = amount / rate[fromCurrency]
    const amountInBase = amount / (exchangeRates[fromCurrency] || 1);
    return amountInBase * (exchangeRates[toCurrency] || 1);
}

function openAddExpenseModal() {
    const modal = document.getElementById('addExpenseModal');
    const form = document.getElementById('expenseForm');
    
    if (modal && form) {
        form.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        modal.style.display = 'block';
    }
}

function openScanModal() {
    const modal = document.getElementById('scanModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    const select = document.getElementById('currencySelect');
    
    if (modal && select) {
        select.value = currentCurrency;
        modal.style.display = 'block';
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    // Resolve user id if logged in, else use demo user
    let userId = 'demo-user';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
    } catch {}

    const expenseData = {
        title: document.getElementById('expenseTitle').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        location: document.getElementById('expenseLocation').value || null,
        latitude: document.getElementById('expenseLatitude').value || null,
        longitude: document.getElementById('expenseLongitude').value || null,
        notes: document.getElementById('expenseNotes').value || null,
        currency: currentCurrency,
        user_id: userId
    };
    
    try {
        const { error } = await supabase
            .from('app_7433469c6a_expenses')
            .insert([expenseData]);
        if (!error) {
            showMessage('Expense added successfully!', 'success');
            closeModals();
            await loadExpenses();
            return;
        }
        throw error;
    } catch (error) {
        // Fallback: save locally so Quick Action works without auth
        try {
            const localExpenses = JSON.parse(localStorage.getItem('aureus_expenses') || '[]');
            expenseData.id = 'local-' + Date.now();
            localExpenses.push(expenseData);
            localStorage.setItem('aureus_expenses', JSON.stringify(localExpenses));
            showMessage('Expense saved locally!', 'success');
            closeModals();
            // Refresh dashboard from local data
            expenses = localExpenses;
            updateDashboardStats();
            updateCharts();
        } catch (lsErr) {
            console.error('Error adding expense:', error, lsErr);
            showMessage('Failed to add expense', 'error');
        }
    }
}

async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const scanProgress = document.getElementById('scanProgress');
    const scanResults = document.getElementById('scanResults');
    
    scanProgress.style.display = 'block';
    scanResults.style.display = 'none';
    
    try {
        // Use Tesseract.js for OCR
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m)
        });
        
        // Parse receipt text (simplified)
        const receiptData = parseReceiptText(text);
        
        scanProgress.style.display = 'none';
        scanResults.style.display = 'block';
        scanResults.innerHTML = `
            <h4>Receipt Scanned Successfully!</h4>
            <p><strong>Amount:</strong> ${receiptData.amount || 'Not found'}</p>
            <p><strong>Merchant:</strong> ${receiptData.merchant || 'Not found'}</p>
            <p><strong>Date:</strong> ${receiptData.date || 'Not found'}</p>
            <button onclick="addScannedExpense('${receiptData.amount}', '${receiptData.merchant}', '${receiptData.date}')" class="btn-primary">Add as Expense</button>
        `;
        
    } catch (error) {
        console.error('OCR Error:', error);
        scanProgress.style.display = 'none';
        scanResults.style.display = 'block';
        scanResults.innerHTML = '<p class="error">Failed to scan receipt. Please try again.</p>';
    }
}

function parseReceiptText(text) {
    // Simplified receipt parsing
    const lines = text.split('\n');
    const receiptData = {
        amount: null,
        merchant: null,
        date: null
    };
    
    // Look for amount (pattern: $XX.XX or XX.XX)
    const amountRegex = /\$?(\d+\.\d{2})/g;
    const amounts = text.match(amountRegex);
    if (amounts && amounts.length > 0) {
        receiptData.amount = amounts[amounts.length - 1].replace('$', '');
    }
    
    // Look for merchant (usually first few lines)
    if (lines.length > 0) {
        receiptData.merchant = lines[0].trim();
    }
    
    // Look for date (simplified pattern)
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        receiptData.date = dateMatch[1];
    }
    
    return receiptData;
}

async function addScannedExpense(amount, merchant, date) {
    // Pre-fill the expense form with scanned data
    document.getElementById('expenseTitle').value = merchant || 'Scanned Receipt';
    document.getElementById('expenseAmount').value = amount || '';
    document.getElementById('expenseCategory').value = 'Other';
    
    if (date) {
        // Convert date format if needed
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
            document.getElementById('expenseDate').value = parsedDate.toISOString().split('T')[0];
        }
    }
    
    closeModals();
    openAddExpenseModal();
}

function updateDashboardCurrencyDisplay() {
    // This function will be called to refresh all currency displays on the dashboard
    // It will re-render elements like total expenses, monthly budget, remaining budget, and savings goal
    // using the newly selected currentCurrency.
    updateDashboardStats(); // This function already uses currentCurrency
    updateCharts(); // This function might need to be updated if it displays currency
}

function handleCurrencyChange() {
    const selectedCurrency = document.getElementById('currencySelect').value;
    currentCurrency = selectedCurrency;
    
    // Save preference
    localStorage.setItem('aureus_currency', currentCurrency);
    
    // Update dashboard
    updateDashboardCurrencyDisplay();
    
    showMessage(`Currency changed to ${currentCurrency}`, 'success');
    closeModals();
}

function loadUserPreferences() {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('aureus_currency');
    if (savedCurrency) {
        currentCurrency = savedCurrency;
    }

    // Prefill budget/goal in modal if available
    const mb = document.getElementById('monthlyBudgetInput');
    const sg = document.getElementById('savingsGoalInput');
    const storedMB = localStorage.getItem('aureus_monthly_budget');
    const storedSG = localStorage.getItem('aureus_savings_goal');
    if (mb && storedMB) mb.value = storedMB;
    if (sg && storedSG) sg.value = storedSG;
}

function openBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (!modal) return;
    const mb = document.getElementById('monthlyBudgetInput');
    const sg = document.getElementById('savingsGoalInput');
    const storedMB = localStorage.getItem('aureus_monthly_budget') || '2000';
    const storedSG = localStorage.getItem('aureus_savings_goal') || '500';
    if (mb) mb.value = storedMB;
    if (sg) sg.value = storedSG;
    modal.style.display = 'block';
}

function handleSaveBudgetGoal() {
    const mb = document.getElementById('monthlyBudgetInput');
    const sg = document.getElementById('savingsGoalInput');
    if (!mb || !sg) return;
    const mbVal = parseFloat(mb.value || '0');
    const sgVal = parseFloat(sg.value || '0');
    if (!isFinite(mbVal) || mbVal < 0) {
        showMessage('Enter a valid Monthly Budget', 'error');
        return;
    }
    if (!isFinite(sgVal) || sgVal < 0) {
        showMessage('Enter a valid Savings Goal', 'error');
        return;
    }
    localStorage.setItem('aureus_monthly_budget', String(mbVal));
    localStorage.setItem('aureus_savings_goal', String(sgVal));
    updateDashboardStats();
    showMessage('Budget & Goal saved', 'success');
    closeModals();
}

async function exportToCsv() {
    try {
        if (expenses.length === 0) {
            showMessage('No expenses to export', 'error');
            return;
        }

        const csvHeaders = ['Date', 'Title', 'Amount', 'Category', 'Location', 'Notes'];
        const csvRows = expenses.map(expense => [
            expense.date,
            expense.title,
            expense.amount,
            expense.category,
            expense.location || '',
            expense.notes || ''
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aureus-expenses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showMessage('CSV exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showMessage('Failed to export CSV', 'error');
    }
}

function showMessage(message, type) {
    // Create and show a temporary message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' : 'linear-gradient(45deg, #f44336, #ef5350)'};
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3000);
}

// Make functions globally available for onclick handlers
window.addScannedExpense = addScannedExpense;
window.showExpenseDetails = function(expenseId) {
    // This function is used in map.html
    console.log('Show expense details for:', expenseId);
};
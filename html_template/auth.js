// Supabase configuration
const supabaseUrl = 'https://pqatgaqjvyzfohdrbrtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxYXRnYXFqdnl6Zm9oZHJicnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDAzMDQsImV4cCI6MjA3MzYxNjMwNH0.kFybYq4ie5K-SNpDftGpQ68OL_njTajVZfDE9G_l95M';

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Authentication functions
window.signUp = async function(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            showMessage('Account created successfully! Please check your email for verification.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }

        return data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

window.signIn = async function(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        if (data.user) {
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }

        return data;
    } catch (error) {
        console.error('Signin error:', error);
        throw error;
    }
};

window.signOut = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showMessage('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Signout error:', error);
        showMessage('Error logging out', 'error');
    }
};

window.getCurrentUser = async function() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

window.checkAuthStatus = async function() {
    try {
        const user = await getCurrentUser();
        
        // If on login page and user is authenticated, redirect to dashboard
        if (user && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // If not on login page and user is not authenticated, redirect to login
        if (!user && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        
        // Update UI with user info if authenticated
        if (user) {
            updateUserUI(user);
        }
        
        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
};

function updateUserUI(user) {
    // Update user name in dashboard
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
        userNameElement.textContent = displayName;
    }
}

// Initialize logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', signOut);
    }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in');
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
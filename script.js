// 1. Initialize Supabase only if it hasn't been initialized yet
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';

// Create client only if it doesn't exist
if (typeof supabase === 'undefined') {
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
}

// 2. Navigation Logic
function showPage(pageId) {
    console.log("Navigating to:", pageId);
    const pages = ['dashboard', 'forum', 'certs', 'peers'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
        localStorage.setItem('lastPage', pageId);
    }
}

// 3. Page Load
window.onload = function() {
    console.log("Phantom Hub initialized.");
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    showPage(lastPage);
};
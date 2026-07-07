// Initialize Supabase
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Navigation Logic
function showPage(pageId) {
    ['dashboard', 'forum', 'certs', 'peers'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
    localStorage.setItem('lastPage', pageId);
}

// Chat Logic
async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value;
    if (!content) return;

    const { error } = await supabase
        .from('messages')
        .insert([{ user_name: 'Operator', content: content }]);
    
    if (error) console.error('Error:', error);
    else input.value = '';
}

window.onload = function() {
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    showPage(lastPage);
};
// Navigation Logic
window.showPage = function(pageId) {
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
};

// Set User Identity
let currentUser = localStorage.getItem('username') || prompt("Enter your Operator Call-sign:") || "Guest";
localStorage.setItem('username', currentUser);

// Chat: Send Message
window.sendMessage = async function() {
    const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
    const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
    const client = supabase.createClient(supabaseUrl, supabaseKey);
    
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    const { error } = await client
        .from('messages')
        .insert([{ user_name: currentUser, content: content }]);
    
    if (error) console.error('Supabase Error:', error);
    else {
        input.value = '';
        fetchMessages();
    }
};

// Chat: Fetch & Auto-scroll
async function fetchMessages() {
    const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
    const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
    const client = supabase.createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await client
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (!error && data) {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.innerHTML = data.map(m => `<div><strong>${m.user_name}:</strong> ${m.content}</div>`).join('');
            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
        }
    }
}

window.onload = function() {
    window.showPage(localStorage.getItem('lastPage') || 'dashboard');
    fetchMessages();
    setInterval(fetchMessages, 5000);

    // Enter key support
    document.getElementById('message-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') window.sendMessage();
    });
};
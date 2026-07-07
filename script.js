// Initialize Supabase
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Navigation Logic
function showPage(pageId) {
    ['dashboard', 'forum', 'certs', 'peers'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
        localStorage.setItem('lastPage', pageId);
    }
}

// CHAT: Send Message
async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content) return; // Don't send empty messages

    // Try to send to Supabase
    const { error } = await supabase
        .from('messages')
        .insert([{ user_name: 'Operator', content: content }]);
    
    if (error) {
        console.error('Supabase Error:', error);
        alert("Failed to send message. Check Console.");
    } else {
        input.value = ''; // Clear input on success
        fetchMessages(); // Refresh chat immediately
    }
}

// CHAT: Fetch messages
async function fetchMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (!error && data) {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = data.map(m => `<div><strong>${m.user_name}:</strong> ${m.content}</div>`).join('');
    }
}

window.onload = function() {
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    showPage(lastPage);
    fetchMessages();
    // Refresh chat every 5 seconds
    setInterval(fetchMessages, 5000);
};
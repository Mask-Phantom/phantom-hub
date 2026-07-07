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

// Chat: Send Message
async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value;
    if (!content) return;

    const { error } = await supabase
        .from('messages')
        .insert([{ user_name: 'Operator', content: content }]);
    
    if (error) console.error('Error sending:', error);
    else input.value = ''; // Clear input
}

// Chat: Fetch and display messages
async function fetchMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) console.error('Error fetching:', error);
    else {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = data.map(m => `<div><strong>${m.user_name}:</strong> ${m.content}</div>`).join('');
    }
}

// Reload chat every 3 seconds to keep it "live"
setInterval(fetchMessages, 3000);

window.onload = function() {
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    showPage(lastPage);
    fetchMessages();
};
// 1. Initialize Supabase
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
const client = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Navigation Logic
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

let currentUser = localStorage.getItem('username') || prompt("Enter your Operator Call-sign:") || "Guest";
localStorage.setItem('username', currentUser);

// 3. Chat: Send Message
window.sendMessage = async function() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    const { error } = await client.from('messages').insert([{ user_name: currentUser, content: content }]);
    if (error) console.error('Supabase Write Error:', error);
    else input.value = '';
};

// 4. Chat: Delete Message
window.deleteMessage = async function(messageId) {
    const { error } = await client.from('messages').delete().eq('id', messageId);
    if (error) console.error('Delete Error:', error);
};

// 5. Chat: Fetch messages
async function fetchMessages() {
    const { data, error } = await client.from('messages').select('*').order('created_at', { ascending: true });
    if (!error && data) {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.innerHTML = data.map(m => `
                <div style="margin-bottom: 10px; border-bottom: 1px solid #2d3748; padding-bottom: 5px; display: flex; justify-content: space-between;">
                    <span><strong>${m.user_name}:</strong> ${m.content}</span>
                    ${m.user_name === currentUser ? `<button onclick="deleteMessage(${m.id})" style="background:none; border:none; color:red; cursor:pointer;">×</button>` : ''}
                </div>
            `).join('');
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}

// 6. Real-time Subscription
function setupRealtime() {
    client.channel('messages_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
            fetchMessages(); 
        })
        .subscribe();
}

window.onload = function() {
    window.showPage(localStorage.getItem('lastPage') || 'dashboard');
    fetchMessages();
    setupRealtime();
    const input = document.getElementById('message-input');
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.sendMessage(); });
};
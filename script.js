// 1. Initialize Supabase ONCE at the top level
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

// Set User Identity
let currentUser = localStorage.getItem('username') || prompt("Enter your Operator Call-sign:") || "Guest";
localStorage.setItem('username', currentUser);

// 3. Chat: Send Message
window.sendMessage = async function() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    const { error } = await client
        .from('messages')
        .insert([{ user_name: currentUser, content: content }]);
    
    if (error) {
        console.error('Supabase Write Error:', error);
    } else {
        input.value = '';
    }
};

// 4. Chat: Fetch messages
async function fetchMessages() {
    const { data, error } = await client
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
        
    if (!error && data) {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.innerHTML = data.map(m => `
                <div style="margin-bottom: 10px; border-bottom: 1px solid #2d3748; padding-bottom: 5px;">
                    <strong>${m.user_name}:</strong> ${m.content}
                </div>
            `).join('');
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}

// 5. Hardened Real-time Subscription
function setupRealtime() {
    client
        .channel('messages_channel')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages' 
        }, payload => {
            console.log('Realtime update detected:', payload);
            fetchMessages(); 
        })
        .subscribe((status) => {
            console.log('Subscription status:', status);
        });
}

// 6. Page Load
window.onload = function() {
    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
    window.showPage(lastPage);
    fetchMessages();
    setupRealtime(); 

    const input = document.getElementById('message-input');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') window.sendMessage();
        });
    }
};
(function() {
    // 1. Initialize Supabase locally within this function
    const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
    const supabaseKey = 'sb_publishable_h6Z3Z9pd69v6gGYXAniWYw_51c1dPrH';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // 2. Navigation Logic - Attached to window so HTML can see it
    window.showPage = function(pageId) {
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
    };

    // 3. Chat: Send Message
    window.sendMessage = async function() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        if (!content) return;

        const { error } = await supabase
            .from('messages')
            .insert([{ user_name: 'Operator', content: content }]);
        
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            input.value = '';
            fetchMessages();
        }
    };

    // 4. Chat: Fetch
    async function fetchMessages() {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            const chatBox = document.getElementById('chat-box');
            if (chatBox) {
                chatBox.innerHTML = data.map(m => `<div><strong>${m.user_name}:</strong> ${m.content}</div>`).join('');
            }
        }
    }

    // 5. Page Load
    window.onload = function() {
        console.log("Phantom Hub initialized.");
        const lastPage = localStorage.getItem('lastPage') || 'dashboard';
        window.showPage(lastPage);
        fetchMessages();
        setInterval(fetchMessages, 5000);
    };
})();
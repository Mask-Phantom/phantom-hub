// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = ''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2Fsb2ttdndmaGRqc2xhc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTU4ODAsImV4cCI6MjA5ODk5MTg4MH0.ggtS6Sv8UTmB90ET8Nj8ZmpAMzM7nsz4Nb23FzEOwXI';

// 2. Initialize database instance (using 'db' to avoid naming conflicts)
let db;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase library not loaded. Check index.html script tag.");
    }
}

// 3. Render messages to the DOM
async function loadMessages() {
    if (!db) return;
    
    const { data, error } = await db
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }

    const list = document.getElementById('message-list');
    if (list) {
        list.innerHTML = data.map(msg => `<div>${msg.content}</div>`).join('');
    }
}

// 4. Global Send Function
window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !db) return;

    const { error } = await db.from('messages').insert([{ content: content }]);
    
    if (error) {
        console.error('Error saving message:', error);
    } else {
        input.value = '';
        loadMessages(); // Refresh view
    }
};

// 5. Execution
window.addEventListener('load', () => {
    initSupabase();
    if (db) {
        db.from('messages').select('*').limit(1).then(({error}) => {
            if (!error) console.log('Successfully connected to Supabase!');
        });
        loadMessages();
    }
});
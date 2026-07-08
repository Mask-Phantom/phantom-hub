// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2Fsb2ttdndmaGRqc2xhc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTU4ODAsImV4cCI6MjA5ODk5MTg4MH0.ggtS6Sv8UTmB90ET8Nj8ZmpAMzM7nsz4Nb23FzEOwXI';

// 2. Initialize using a different variable name ('db') to avoid global conflict
let db;

function initSupabase() {
    // The library loads into the global 'supabase' object
    if (typeof supabase !== 'undefined') {
        db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase library not found!");
    }
}

// 3. Robust Connection Test
async function testConnection() {
    if (!db) {
        console.error("Database client not initialized.");
        return;
    }
    try {
        const { data, error } = await db.from('profiles').select('id').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase!', data);
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

// 4. Global Handler
window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !db) return;

    try {
        console.log('Sending message:', content);
        input.value = '';
    } catch (err) {
        console.error('Error sending message:', err);
    }
};

// 5. Execution
window.addEventListener('load', () => {
    initSupabase();
    testConnection();
});
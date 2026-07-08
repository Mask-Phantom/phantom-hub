// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = 'YOUR_NEW_REGENERATED_API_KEY';

// 2. Client Initialization (using the global supabase object from CDN)
let supabase;

function initSupabase() {
    if (typeof supabasejs !== 'undefined') {
        supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else if (window.supabase) {
        // Fallback for different CDN loading behaviors
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
}

// 3. Robust Connection Test
async function testConnection() {
    if (!supabase) {
        console.error("Supabase client not initialized.");
        return;
    }
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
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
    if (!content || !supabase) return;

    try {
        // Prepare for Phase 2: Inserting into DB
        console.log('Sending message:', content);
        input.value = '';
    } catch (err) {
        console.error('Error sending message:', err);
    }
};

// 5. Execution Strategy: Wait for DOM and Library load
window.addEventListener('load', () => {
    initSupabase();
    testConnection();
});
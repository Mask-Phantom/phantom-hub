// Initialize Supabase
// Use your specific Project ID to form the URL
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'sb_publishable_zx9nSgamhm1967J0qUMOkA_btbE09Aa'; // Replace this after regenerating
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase!', data);
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

// Global sendMessage function for index.html
window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content) return;

    // For now, just logging to prove it works
    console.log('Attempting to send:', content);
    
    // We will hook this into the database in Phase 2
    input.value = '';
};

// Start connection test
testConnection();
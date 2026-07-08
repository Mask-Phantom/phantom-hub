// Initialize Supabase safely
const supabaseUrl = 'https://iisalokmvwfhdjslasyb.supabase.co';
const supabaseKey = 'YOUR_NEW_REGENERATED_API_KEY'; 

// Check if already initialized to avoid the redeclaration error
if (!window.supabase) {
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
}

// Test the connection
async function testConnection() {
    try {
        const { data, error } = await window.supabase.from('profiles').select('*').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase!', data);
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

// Global sendMessage function
window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content) return;

    console.log('Attempting to send:', content);
    input.value = '';
};

// Start connection test
testConnection();
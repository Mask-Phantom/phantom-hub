// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2Fsb2ttdndmaGRqc2xhc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTU4ODAsImV4cCI6MjA5ODk5MTg4MH0.ggtS6Sv8UTmB90ET8Nj8ZmpAMzM7nsz4Nb23FzEOwXI'; // Ensure your active key is here

// 2. State & Initialization
let db;
let currentUser = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase library not loaded. Check index.html script tag.");
    }
}

// 3. Authentication Logic
window.signUpUser = async (email, password, username, fullName, roleTag) => {
    if (!db) return;
    try {
        // Step A: Sign up user in Supabase Auth
        const { data: authData, error: authError } = await db.auth.signUp({
            email,
            password,
        });
        if (authError) throw authError;

        if (authData.user) {
            // Step B: Create corresponding record in public.profiles table
            const { error: profileError } = await db.from('profiles').insert([
                {
                    id: authData.user.id,
                    username: username,
                    full_name: fullName,
                    role_tag: roleTag,
                    is_pro: false,
                    updated_at: new Date().toISOString()
                }
            ]);
            if (profileError) throw profileError;
            console.log('User registered and profile created successfully!');
        }
    } catch (err) {
        console.error('Registration failed:', err.message);
    }
};

window.logInUser = async (email, password) => {
    if (!db) return;
    try {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        console.log('Logged in successfully!');
    } catch (err) {
        console.error('Login failed:', err.message);
    }
};

window.logOutUser = async () => {
    if (!db) return;
    try {
        const { error } = await db.auth.signOut();
        if (error) throw error;
        currentUser = null;
        console.log('Logged out successfully.');
        toggleUI(false);
    } catch (err) {
        console.error('Logout failed:', err.message);
    }
};

// Monitor Auth Session Changes
function setupAuthListener() {
    db.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            currentUser = session.user;
            toggleUI(true);
            loadMessages();
        } else {
            currentUser = null;
            toggleUI(false);
        }
    });
}

// UI Toggling depending on Auth State
function toggleUI(isLoggedIn) {
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('chat-container');
    
    if (isLoggedIn) {
        if (authContainer) authContainer.classList.add('hidden');
        if (chatContainer) chatContainer.classList.remove('hidden');
    } else {
        if (authContainer) authContainer.classList.remove('hidden');
        if (chatContainer) chatContainer.classList.add('hidden');
        const list = document.getElementById('message-list');
        if (list) list.innerHTML = ''; // Clear chat on logout
    }
}

// 4. Messaging Logic
async function loadMessages() {
    if (!db || !currentUser) return;
    
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
        list.innerHTML = data.map(msg => `<div><strong>${msg.user_id === currentUser.id ? 'You' : 'User'}:</strong> ${msg.content}</div>`).join('');
    }
}

window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !db || !currentUser) return;

    // Attaching the currentUser.id guarantees fulfillment of the RLS checks
    const { error } = await db.from('messages').insert([
        { 
            content: content,
            user_id: currentUser.id 
        }
    ]);
    
    if (error) {
        console.error('Error saving message:', error);
    } else {
        input.value = '';
        loadMessages();
    }
};

// 5. Execution Strategy
window.addEventListener('load', () => {
    initSupabase();
    if (db) {
        setupAuthListener();
    }
});
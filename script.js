// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = 'YOUR_NEW_REGENERATED_API_KEY'; // Ensure your active key is here

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
        // We pass the extra profile data into the user's metadata so the SQL Trigger can catch it
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName,
                    role_tag: roleTag
                }
            }
        });
        
        if (error) throw error;

        // Notify the user that they must verify their email
        alert("Registration successful! Please check your email to confirm your account before logging in.");
        
    } catch (err) {
        console.error('Registration failed:', err.message);
        alert('Registration failed: ' + err.message);
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
        alert('Login failed: ' + err.message);
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
        list.innerHTML = data.map(msg => {
            const isMe = msg.user_id === currentUser.id;
            const bubbleClass = isMe ? 'message-sent ml-auto text-right' : 'message-received mr-auto text-left';
            const sender = isMe ? 'You' : 'Agent';
            
            return `
            <div class="flex w-full mb-4">
                <div class="max-w-[75%] ${bubbleClass}">
                    <div class="text-xs text-[#59dcb5] mb-1 font-bold">${sender}</div>
                    <div class="text-white">${msg.content}</div>
                </div>
            </div>`;
        }).join('');
        
        // Auto-scroll to bottom
        list.scrollTop = list.scrollHeight;
    }
}

window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !db || !currentUser) return;

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
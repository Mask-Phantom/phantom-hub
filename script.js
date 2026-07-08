// 1. Configuration
const SUPABASE_URL = 'https://iisalokmvwfhdjslasyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2Fsb2ttdndmaGRqc2xhc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTU4ODAsImV4cCI6MjA5ODk5MTg4MH0.ggtS6Sv8UTmB90ET8Nj8ZmpAMzM7nsz4Nb23FzEOwXI'; // Insert your key here

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

// 3. Authentication & Profile Logic
window.signUpUser = async (email, password, username, fullName, roleTag) => {
    if (!db) return;
    try {
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username || 'phantom_user',
                    full_name: fullName,
                    role_tag: roleTag
                }
            }
        });
        if (error) throw error;
        alert("Registration successful! Please check your email to confirm your account.");
    } catch (err) {
        console.error('Registration failed:', err.message);
        alert('Registration failed: ' + err.message);
    }
};

window.logInUser = async (email, password) => {
    if (!db) return;
    try {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
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
        await db.auth.signOut();
        currentUser = null;
        toggleUI(false);
    } catch (err) {
        console.error('Logout failed:', err.message);
    }
};

// Handle Avatar Image Upload with Security Restrictions
window.uploadAvatar = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    // --- SECURITY CHECKS ---
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        alert('Invalid format. Please upload a JPEG, PNG, WEBP, or GIF.');
        // Reset the file input so they can try again
        event.target.value = ''; 
        return;
    }

    if (file.size > MAX_SIZE) {
        alert('File is too large. Please select an image under 2MB.');
        event.target.value = '';
        return;
    }
    // --- END SECURITY CHECKS ---

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;

        // 1. Upload to the 'avatars' bucket
        const { error: uploadError } = await db.storage
            .from('avatars')
            .upload(fileName, file);
            
        if (uploadError) throw uploadError;

        // 2. Get the public URL for the image
        const { data } = db.storage.from('avatars').getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        // 3. Update the user's profile table with the new URL
        const { error: updateError } = await db.from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // 4. Update the UI
        document.getElementById('sidebar-avatar').src = publicUrl;
        loadMessages(); 
        
    } catch (err) {
        console.error('Avatar upload failed:', err.message);
        alert('Failed to upload profile picture.');
    } finally {
        // Clear the input so the same file can be uploaded again if needed
        event.target.value = '';
    }
};

function setupAuthListener() {
    db.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            currentUser = session.user;
            toggleUI(true);
            
            const { data } = await db.from('profiles').select('avatar_url').eq('id', currentUser.id).single();
            if (data && data.avatar_url) {
                document.getElementById('sidebar-avatar').src = data.avatar_url;
            }
            
            loadMessages();
        } else {
            currentUser = null;
            toggleUI(false);
        }
    });
}

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
        if (list) list.innerHTML = '';
        document.getElementById('sidebar-avatar').src = "https://ui-avatars.com/api/?name=User&background=2c363d&color=59dcb5";
    }
}

// 4. Messaging Logic
async function loadMessages() {
    if (!db || !currentUser) return;
    
    const { data, error } = await db
        .from('messages')
        .select(`
            *,
            profiles (
                username,
                avatar_url
            )
        `)
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
            
            const senderName = msg.profiles?.username || 'Agent';
            const defaultAvatar = `https://ui-avatars.com/api/?name=${senderName}&background=2c363d&color=59dcb5`;
            const avatarImg = msg.profiles?.avatar_url || defaultAvatar;
            
            return `
            <div class="flex w-full mb-4 items-end ${isMe ? 'flex-row-reverse' : ''} gap-2">
                <img src="${avatarImg}" class="w-8 h-8 rounded-full border border-[#3f4945] object-cover flex-shrink-0">
                <div class="max-w-[75%] ${bubbleClass}">
                    <div class="text-xs text-[#59dcb5] mb-1 font-bold ${isMe ? 'hidden' : ''}">${senderName}</div>
                    <div class="text-white">${msg.content}</div>
                </div>
            </div>`;
        }).join('');
        
        list.scrollTop = list.scrollHeight;
    }
}

window.sendMessage = async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content || !db || !currentUser) return;

    const { error } = await db.from('messages').insert([{ content: content, user_id: currentUser.id }]);
    
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
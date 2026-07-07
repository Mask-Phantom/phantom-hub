// Function to show a page and save the state
function showPage(pageId) {
    const pages = ['dashboard', 'forum', 'certs', 'peers'];
    
    // Hide all pages
    pages.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    // Show the selected page
    document.getElementById(pageId).style.display = 'block';

    // Save to browser's memory
    localStorage.setItem('lastPage', pageId);
}

// Check memory when the page loads
window.onload = function() {
    const lastPage = localStorage.getItem('lastPage');
    if (lastPage) {
        showPage(lastPage);
    }
};
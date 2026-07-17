// Main App Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show page
            const page = link.dataset.page;
            
            if (page === 'logout') {
                handleLogout();
                return;
            }

            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`${page}-page`).classList.add('active');
            
            // Initialize page if needed
            if (page === 'scores') {
                initScoresPage();
            } else if (page === 'bracket') {
                initBracketPage();
            } else if (page === 'moments') {
                initMomentsPage();
            } else if (page === 'stats') {
                initStatsPage();
            } else if (page === 'forum') {
                initForumPage();
            } else if (page === 'draft') {
                initDraftPage();
            } else if (page === 'profile') {
                initProfilePage(currentUser ? currentUser.username : null);
            } else if (page === 'admin') {
                initAdminPage();
            }
        });
    });
    
    // Initialize Auth
    await initAuth();
    
    // Initialize scores page by default
    initScoresPage();
    initBracketPage();
    initMomentsPage();
    initStatsPage();
    initForumPage();
    initDraftPage();
    initProfilePage();
    initAdminPage();
});
// Main App Logic

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show page
            const page = link.dataset.page;
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`${page}-page`).classList.add('active');
            
            // Initialize page if needed
            if (page === 'scores') {
                initScoresPage();
            } else if (page === 'bracket') {
                initBracketPage();
            } else if (page === 'draft') {
                initDraftPage();
            }
        });
    });
    
    // Initialize scores page by default
    initScoresPage();
    initBracketPage();
    initDraftPage();
});
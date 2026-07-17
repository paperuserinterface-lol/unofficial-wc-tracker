// Authentication Frontend Logic

let currentUser = null;

async function readJsonResponse(response) {
    const responseText = await response.text();

    if (!responseText) {
        throw new Error(`The server returned an empty response for ${response.url}.`);
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        throw new Error(`The server did not return valid JSON for ${response.url} (status ${response.status}).`);
    }
}

async function initAuth() {
    await restoreSession();

    // Attach Form Listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Toggle Links
    const showSignup = document.getElementById('show-signup');
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('signup');
        });
    }

    const showLogin = document.getElementById('show-login');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('login');
        });
    }
}

function updateNavState() {
    const navLoginLink = document.getElementById('nav-login-link');
    const navAdminLink = document.getElementById('nav-admin-link');
    const navProfileLink = document.getElementById('nav-profile-link');
    if (!navLoginLink) return;

    if (currentUser) {
        navLoginLink.textContent = `${translate('nav.logout')} (${currentUser.username})`;
        navLoginLink.classList.add('logged-in');
        navLoginLink.dataset.page = 'logout';
    } else {
        navLoginLink.textContent = translate('nav.login');
        navLoginLink.classList.remove('logged-in');
        navLoginLink.dataset.page = 'login';
    }

    if (navProfileLink) {
        navProfileLink.style.display = currentUser ? 'inline-flex' : 'none';
    }

    if (navAdminLink) {
        navAdminLink.style.display = currentUser && currentUser.admin ? 'inline-flex' : 'none';
    }
}

// Utility to change pages programmatically
function switchPage(pageName) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Activate navbar link if it corresponds to a tab
    const navLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';

    const loginInput = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(apiUrl('/api/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ emailOrUser: loginInput, password })
        });

        const data = await readJsonResponse(response);

        if (response.ok && data.success) {
            currentUser = { username: data.username, email: data.email, admin: Boolean(data.admin), profileFlag: data.profileFlag || '🏳️' };
            localStorage.setItem('worldCupUser', JSON.stringify(currentUser));
            updateNavState();
            switchPage('scores');
            if (typeof initForumPage === 'function') {
                initForumPage();
            }
            if (typeof initDraftPage === 'function') {
                initDraftPage();
            }
            if (typeof initProfilePage === 'function') {
                initProfilePage();
            }
            if (typeof initAdminPage === 'function' && currentUser.admin) {
                initAdminPage();
            }
            document.getElementById('login-form').reset();
        } else {
            throw new Error(data.message || 'Invalid credentials');
        }
    } catch (err) {
        console.error('Auth login error:', err);
        loginError.textContent = err.message || 'Could not log in right now.';
        loginError.style.display = 'block';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const signupError = document.getElementById('signup-error');
    signupError.style.display = 'none';

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(apiUrl('/api/signup'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });

        const data = await readJsonResponse(response);

        if (response.ok && data.success) {
            alert('Account created! Please log in.');
            document.getElementById('signup-form').reset();
            switchPage('login');
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error('Auth signup error:', err);
        signupError.textContent = err.message || 'Could not create your account right now.';
        signupError.style.display = 'block';
    }
}

async function restoreSession() {
    const savedUser = localStorage.getItem('worldCupUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateNavState();
        } catch (error) {
            localStorage.removeItem('worldCupUser');
        }
    }

    try {
        const response = await fetch(apiUrl('/api/me'), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 401) {
                currentUser = null;
                localStorage.removeItem('worldCupUser');
                updateNavState();
            }
            return;
        }

        const data = await readJsonResponse(response);
        if (data.success) {
            currentUser = { username: data.username, email: data.email, admin: Boolean(data.admin), profileFlag: data.profileFlag || '🏳️' };
            localStorage.setItem('worldCupUser', JSON.stringify(currentUser));
            updateNavState();
            if (typeof initForumPage === 'function') {
                initForumPage();
            }
            if (typeof initDraftPage === 'function') {
                initDraftPage();
            }
            if (typeof initProfilePage === 'function') {
                initProfilePage();
            }
            if (typeof initAdminPage === 'function' && currentUser.admin) {
                initAdminPage();
            }
        }
    } catch (error) {
        console.error('Session restore error:', error);
    }
}

async function handleLogout() {
    try {
        await fetch(apiUrl('/api/logout'), {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    currentUser = null;
    localStorage.removeItem('worldCupUser');
    updateNavState();
    switchPage('scores');
    if (typeof initForumPage === 'function') {
        initForumPage();
    }
    if (typeof initDraftPage === 'function') {
        initDraftPage();
    }
    if (typeof initProfilePage === 'function') {
        initProfilePage();
    }
    if (typeof initAdminPage === 'function') {
        initAdminPage();
    }
}

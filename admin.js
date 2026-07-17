// Admin Panel Logic

let adminUsersCache = [];
let adminUsersLoaded = false;
let adminCommandLog = [];

function formatAdminDate(dateValue) {
    if (!dateValue) return '—';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString();
}

function setAdminState({ loading = false, message = '', type = 'info' } = {}) {
    const accessMessage = document.getElementById('admin-access-message');
    const dashboard = document.getElementById('admin-dashboard');

    if (!accessMessage || !dashboard) return;

    if (loading) {
        accessMessage.style.display = 'block';
        accessMessage.className = 'admin-access-message';
        accessMessage.textContent = 'Loading admin dashboard...';
        dashboard.style.display = 'none';
        return;
    }

    if (message) {
        accessMessage.style.display = 'block';
        accessMessage.className = `admin-access-message ${type}`;
        accessMessage.textContent = message;
        dashboard.style.display = 'none';
        return;
    }

    accessMessage.style.display = 'none';
    accessMessage.className = 'admin-access-message';
    accessMessage.textContent = '';
    dashboard.style.display = 'grid';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDraftSummary(team = {}) {
    const starters = Object.values(team.players || {}).filter(Boolean).length;
    const substitutes = Array.isArray(team.substitutes) ? team.substitutes.filter(Boolean).length : 0;
    return `${starters} starters • ${substitutes} subs`;
}

function renderAdminCommandOutput() {
    const output = document.getElementById('admin-command-output');
    if (!output) return;

    if (adminCommandLog.length === 0) {
        output.innerHTML = '<div class="admin-empty-state">Run <code>/help</code> to see available commands.</div>';
        return;
    }

    output.innerHTML = adminCommandLog.map((entry) => `
        <div class="admin-command-line ${entry.type || 'info'}">
            <div class="admin-command-prompt">&gt; ${escapeHtml(entry.command)}</div>
            <div class="admin-command-response">
                ${(entry.lines || []).map((line) => `<div>${escapeHtml(line)}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function pushAdminCommandLog(command, lines, type = 'info') {
    adminCommandLog.unshift({ command, lines, type });
    adminCommandLog = adminCommandLog.slice(0, 12);
    renderAdminCommandOutput();
}

function renderAdminOverview(data) {
    const statsContainer = document.getElementById('admin-stats-grid');
    const recentUsersContainer = document.getElementById('admin-recent-users');
    const latestJoiner = data.latestUsers && data.latestUsers.length > 0 ? data.latestUsers[0] : null;
    const totals = data.totals || {};

    if (!statsContainer || !recentUsersContainer) return;

    statsContainer.innerHTML = `
        <div class="admin-stat-card">
            <div class="admin-stat-label">Registered Users</div>
            <div class="admin-stat-value">${totals.users ?? 0}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Admin Accounts</div>
            <div class="admin-stat-value">${totals.admins ?? 0}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">New This Week</div>
            <div class="admin-stat-value">${totals.newThisWeek ?? 0}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Saved Drafts</div>
            <div class="admin-stat-value">${totals.draftsSaved ?? 0}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Forum Posts</div>
            <div class="admin-stat-value">${totals.forumPosts ?? 0}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Latest Joiner</div>
            <div class="admin-stat-value admin-stat-user">${latestJoiner ? escapeHtml(latestJoiner.username) : '—'}</div>
        </div>
    `;

    if (!data.latestUsers || data.latestUsers.length === 0) {
        recentUsersContainer.innerHTML = '<div class="admin-empty-state">No registered users found yet.</div>';
        return;
    }

    recentUsersContainer.innerHTML = `
        <div class="admin-users-table-wrap">
            <table class="admin-users-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Draft</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.latestUsers.map((user) => `
                        <tr>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.email)}</td>
                            <td><span class="admin-role-pill ${user.admin ? 'is-admin' : ''}">${user.admin ? 'Admin' : 'User'}</span></td>
                            <td>${formatAdminDate(user.created_at)}</td>
                            <td>${user.draft_updated_at ? `Saved ${formatAdminDate(user.draft_updated_at)}` : 'No draft yet'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminUsers(users) {
    const container = document.getElementById('admin-user-list');
    const countContainer = document.getElementById('admin-user-count');

    if (!container || !countContainer) return;

    countContainer.textContent = `${users.length} user${users.length === 1 ? '' : 's'} found`;

    if (users.length === 0) {
        container.innerHTML = '<div class="admin-empty-state">No users match the current search/filter.</div>';
        return;
    }

    container.innerHTML = `
        <div class="admin-users-table-wrap">
            <table class="admin-users-table admin-management-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Draft</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map((user) => `
                        <tr>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.email)}</td>
                            <td><span class="admin-role-pill ${user.admin ? 'is-admin' : ''}">${user.admin ? 'Admin' : 'User'}</span></td>
                            <td>${formatAdminDate(user.created_at)}</td>
                            <td>${user.has_draft ? `Saved ${formatAdminDate(user.draft_updated_at)}` : 'No draft yet'}</td>
                            <td>
                                <div class="admin-row-actions">
                                    <button class="btn btn-secondary admin-action-btn" data-action="toggle-admin" data-user-id="${user.id}" data-next-admin="${user.admin ? 'false' : 'true'}">${user.admin ? 'Demote' : 'Promote'}</button>
                                    <button class="btn btn-secondary admin-action-btn" data-action="view-draft" data-user-id="${user.id}" ${user.has_draft ? '' : 'disabled'}>View Draft</button>
                                    <button class="btn btn-danger admin-action-btn" data-action="delete-user" data-user-id="${user.id}" data-username="${escapeHtml(user.username)}">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderDraftViewer(payload) {
    const container = document.getElementById('admin-draft-viewer');
    if (!container) return;

    if (!payload || !payload.user) {
        container.innerHTML = '<div class="admin-empty-state">Select “View Draft” on a user to inspect their saved squad.</div>';
        return;
    }

    if (!payload.draft) {
        container.innerHTML = `
            <div class="admin-empty-state">
                ${escapeHtml(payload.user.username)} has not saved a draft yet.
            </div>
        `;
        return;
    }

    const players = payload.draft.team?.players || {};
    const substitutes = Array.isArray(payload.draft.team?.substitutes) ? payload.draft.team.substitutes : [];

    const startersMarkup = Object.entries(players)
        .map(([position, player]) => `
            <div class="admin-draft-player-row">
                <span class="admin-draft-position">${escapeHtml(position)}</span>
                <span class="admin-draft-player">${player ? `${escapeHtml(player.name)} (${escapeHtml(player.rating)})` : 'Empty'}</span>
            </div>
        `)
        .join('');

    const subsMarkup = substitutes.length > 0
        ? substitutes.map((player, index) => `
            <div class="admin-draft-player-row">
                <span class="admin-draft-position">Sub ${index + 1}</span>
                <span class="admin-draft-player">${player ? `${escapeHtml(player.name)} (${escapeHtml(player.rating)})` : 'Empty'}</span>
            </div>
        `).join('')
        : '<div class="admin-empty-state compact">No substitutes saved.</div>';

    container.innerHTML = `
        <div class="admin-draft-card">
            <div class="admin-draft-meta">
                <div>
                    <div class="admin-draft-user">${escapeHtml(payload.user.username)}</div>
                    <div class="admin-card-note">${escapeHtml(payload.user.email)}</div>
                </div>
                <div class="admin-draft-badges">
                    <span class="admin-draft-badge">Formation: ${escapeHtml(payload.draft.formation)}</span>
                    <span class="admin-draft-badge">Updated: ${formatAdminDate(payload.draft.updated_at)}</span>
                    <span class="admin-draft-badge">${getDraftSummary(payload.draft.team)}</span>
                </div>
            </div>

            <div class="admin-draft-columns">
                <div>
                    <h3 class="admin-draft-section-title">Starting XI</h3>
                    <div class="admin-draft-list">${startersMarkup || '<div class="admin-empty-state compact">No starters saved.</div>'}</div>
                </div>
                <div>
                    <h3 class="admin-draft-section-title">Substitutes</h3>
                    <div class="admin-draft-list">${subsMarkup}</div>
                </div>
            </div>
        </div>
    `;
}

async function loadAdminUsers() {
    const searchInput = document.getElementById('admin-user-search');
    const roleFilter = document.getElementById('admin-role-filter');

    const query = new URLSearchParams();
    if (searchInput && searchInput.value.trim()) {
        query.set('search', searchInput.value.trim());
    }
    if (roleFilter && roleFilter.value !== 'all') {
        query.set('role', roleFilter.value);
    }

    const url = `/api/admin/users${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    });

    const data = await readJsonResponse(response);
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not load users.');
    }

    adminUsersCache = Array.isArray(data.users) ? data.users : [];
    adminUsersLoaded = true;
    renderAdminUsers(adminUsersCache);
}

async function initAdminPage() {
    const page = document.getElementById('admin-page');
    if (!page) return;

    if (!currentUser) {
        setAdminState({ message: 'Log in with an admin account to access the admin panel.', type: 'warning' });
        return;
    }

    if (!currentUser.admin) {
        setAdminState({ message: 'This page is only available to admin accounts.', type: 'danger' });
        return;
    }

    setAdminState({ loading: true });

    try {
        const response = await fetch('/api/admin/overview', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load admin dashboard.');
        }

        setAdminState();
        renderAdminOverview(data);
        await loadAdminUsers();
    } catch (error) {
        console.error('Admin overview error:', error);
        setAdminState({ message: error.message || 'Could not load admin dashboard.', type: 'danger' });
    }
}

async function exportAdminUsersCsv() {
    if (!currentUser || !currentUser.admin) {
        alert('Only admins can export user data.');
        return;
    }

    try {
        const response = await fetch('/api/admin/users', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not export users.');
        }

        const users = Array.isArray(data.users) ? data.users : [];
        const header = ['id', 'username', 'email', 'admin', 'created_at', 'has_draft', 'draft_updated_at'];
        const rows = users.map((user) => [
            user.id,
            user.username,
            user.email,
            user.admin ? 'true' : 'false',
            user.created_at || '',
            user.has_draft ? 'true' : 'false',
            user.draft_updated_at || ''
        ]);

        const csvContent = [header, ...rows]
            .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'world-cup-users.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Admin export error:', error);
        alert(error.message || 'Could not export users.');
    }
}

async function viewAdminUserDraft(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/draft`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load the user draft.');
        }

        renderDraftViewer(data);
    } catch (error) {
        console.error('Admin draft view error:', error);
        alert(error.message || 'Could not load the user draft.');
    }
}

async function updateAdminRole(userId, nextAdminValue) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/admin`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ admin: nextAdminValue })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not update admin role.');
        }

        await initAdminPage();
    } catch (error) {
        console.error('Admin role update error:', error);
        alert(error.message || 'Could not update admin role.');
    }
}

async function runAdminCommand(commandText) {
    const trimmedCommand = commandText.trim();
    if (!trimmedCommand) {
        return;
    }

    try {
        const response = await fetch('/api/admin/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ command: trimmedCommand })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not execute command.');
        }

        pushAdminCommandLog(trimmedCommand, Array.isArray(data.output) ? data.output : ['Command executed.'], data.type || 'success');

        if (data.draftResult) {
            renderDraftViewer(data.draftResult);
        }

        await initAdminPage();
    } catch (error) {
        console.error('Admin command error:', error);
        pushAdminCommandLog(trimmedCommand, [error.message || 'Could not execute command.'], 'danger');
    }
}

async function deleteAdminUser(userId, username) {
    if (!confirm(`Delete user ${username}? This also removes their saved draft.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not delete user.');
        }

        renderDraftViewer(null);
        await initAdminPage();
    } catch (error) {
        console.error('Delete user error:', error);
        alert(error.message || 'Could not delete user.');
    }
}

function debounce(callback, delay) {
    let timeoutId = null;

    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    renderAdminCommandOutput();

    const commandForm = document.getElementById('admin-command-form');
    if (commandForm) {
        commandForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('admin-command-input');
            const command = input ? input.value.trim() : '';

            if (!command) {
                return;
            }

            if (input) {
                input.value = '';
            }

            runAdminCommand(command);
        });
    }

    const refreshButton = document.getElementById('admin-refresh-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            initAdminPage();
        });
    }

    const exportButton = document.getElementById('admin-export-btn');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportAdminUsersCsv();
        });
    }

    const searchInput = document.getElementById('admin-user-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            if (currentUser && currentUser.admin && adminUsersLoaded) {
                loadAdminUsers().catch((error) => {
                    console.error('Admin search error:', error);
                });
            }
        }, 250));
    }

    const roleFilter = document.getElementById('admin-role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', () => {
            if (currentUser && currentUser.admin) {
                loadAdminUsers().catch((error) => {
                    console.error('Admin filter error:', error);
                });
            }
        });
    }

    const userList = document.getElementById('admin-user-list');
    if (userList) {
        userList.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const userId = button.dataset.userId;

            if (action === 'view-draft') {
                viewAdminUserDraft(userId);
            } else if (action === 'toggle-admin') {
                updateAdminRole(userId, button.dataset.nextAdmin === 'true');
            } else if (action === 'delete-user') {
                deleteAdminUser(userId, button.dataset.username || 'this user');
            }
        });
    }
});

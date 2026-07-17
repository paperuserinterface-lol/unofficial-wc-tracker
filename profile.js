// Profile Page Logic

let profileInitialized = false;
let activeProfileUsername = null;
const WORLD_CUP_FLAGS = [
    { value: '🏳️', label: 'No Flag' },
    { value: '🇦🇷', label: 'Argentina' },
    { value: '🇧🇷', label: 'Brazil' },
    { value: '🇫🇷', label: 'France' },
    { value: '🇩🇪', label: 'Germany' },
    { value: '🇪🇸', label: 'Spain' },
    { value: '🇵🇹', label: 'Portugal' },
    { value: '🇳🇱', label: 'Netherlands' },
    { value: '🇮🇹', label: 'Italy' },
    { value: '🇧🇪', label: 'Belgium' },
    { value: '🇭🇷', label: 'Croatia' },
    { value: '🇲🇦', label: 'Morocco' },
    { value: '🇺🇸', label: 'United States' },
    { value: '🇲🇽', label: 'Mexico' },
    { value: '🇨🇦', label: 'Canada' },
    { value: '🇯🇵', label: 'Japan' },
    { value: '🇰🇷', label: 'South Korea' },
    { value: '🇸🇦', label: 'Saudi Arabia' },
    { value: '🇦🇺', label: 'Australia' },
    { value: '🇮🇷', label: 'Iran' },
    { value: '🇪🇨', label: 'Ecuador' },
    { value: '🇺🇾', label: 'Uruguay' },
    { value: '🇨🇴', label: 'Colombia' },
    { value: '🇨🇱', label: 'Chile' },
    { value: '🇵🇱', label: 'Poland' },
    { value: '🇷🇸', label: 'Serbia' },
    { value: '🇩🇰', label: 'Denmark' },
    { value: '🇨🇭', label: 'Switzerland' },
    { value: '🇸🇳', label: 'Senegal' },
    { value: '🇬🇭', label: 'Ghana' },
    { value: '🇳🇬', label: 'Nigeria' },
    { value: '🇨🇲', label: 'Cameroon' },
    { value: '🇪🇬', label: 'Egypt' },
    { value: '🇹🇳', label: 'Tunisia' }
];

function escapeProfileHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setProfileMessage(message = '', type = 'info') {
    const messageEl = document.getElementById('profile-message');
    if (!messageEl) return;

    if (!message) {
        messageEl.style.display = 'none';
        messageEl.className = 'profile-message';
        messageEl.textContent = '';
        return;
    }

    messageEl.style.display = 'block';
    messageEl.className = `profile-message ${type}`;
    messageEl.textContent = message;
}

function openProfilePage(username) {
    activeProfileUsername = username || (currentUser ? currentUser.username : null);
    switchPage('profile');
    initProfilePage(activeProfileUsername);
}

function renderProfileSkeleton() {
    const container = document.getElementById('profile-content');
    if (!container) return;
    container.innerHTML = '<div class="profile-empty-state">Loading profile...</div>';
}

function renderProfileData(data, notifications = null) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    const profile = data.profile;
    const isOwnProfile = Boolean(data.viewerIsOwner);
    const posts = Array.isArray(data.posts) ? data.posts : [];
    const flagOptions = WORLD_CUP_FLAGS.map((flag) => `
        <option value="${flag.value}" ${flag.value === profile.profile_flag ? 'selected' : ''}>${flag.value} ${flag.label}</option>
    `).join('');

    container.innerHTML = `
        <section class="profile-card profile-card-wide">
            <div class="profile-hero">
                <div>
                    <div class="profile-flag-display">${escapeProfileHtml(profile.profile_flag || '🏳️')}</div>
                    <h2 class="profile-username">${escapeProfileHtml(profile.username)} ${profile.admin ? '<span class="forum-role-tag">Admin</span>' : ''}</h2>
                    <p class="profile-meta">Joined ${formatForumDate(profile.created_at)}</p>
                </div>
                ${!isOwnProfile && currentUser ? `
                    <button id="profile-follow-btn" class="btn btn-secondary" data-username="${escapeProfileHtml(profile.username)}">
                        ${profile.followed_by_viewer ? 'Following' : 'Follow'}
                    </button>
                ` : ''}
            </div>

            <div class="profile-stats-grid">
                <div class="profile-stat-card">
                    <span class="profile-stat-value">${profile.posts_count}</span>
                    <span class="profile-stat-label">Posts</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-value">${profile.follower_count}</span>
                    <span class="profile-stat-label">Followers</span>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-value">${profile.following_count}</span>
                    <span class="profile-stat-label">Following</span>
                </div>
            </div>
        </section>

        ${isOwnProfile ? `
            <section class="profile-card">
                <h3 class="profile-section-title">World Cup Flag</h3>
                <p class="profile-section-note">Choose the flag that appears next to your name across the community.</p>
                <form id="profile-flag-form" class="profile-flag-form">
                    <select id="profile-flag-select" class="profile-flag-select">${flagOptions}</select>
                    <button type="submit" class="btn btn-primary">Save Flag</button>
                </form>
            </section>
        ` : ''}

        <section class="profile-card profile-card-wide">
            <h3 class="profile-section-title">Recent Forum Posts</h3>
            ${posts.length > 0 ? `
                <div class="profile-post-list">
                    ${posts.map((post) => `
                        <div class="profile-post-item">
                            <div class="profile-post-meta">${formatForumDate(post.created_at)} ${post.locked ? '• Locked' : ''}</div>
                            <div class="profile-post-content">${escapeProfileHtml(post.content).replace(/\n/g, '<br>')}</div>
                            <div class="profile-post-stats">❤️ ${post.like_count} · 💬 ${post.comment_count}</div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="profile-empty-state">No forum posts yet.</div>'}
        </section>

        ${isOwnProfile ? `
            <section class="profile-card profile-card-wide">
                <div class="profile-section-header">
                    <div>
                        <h3 class="profile-section-title">Notifications</h3>
                        <p class="profile-section-note">Likes, comments, follows, and moderation updates land here.</p>
                    </div>
                    <button id="profile-mark-read-btn" class="btn btn-secondary">Mark All Read</button>
                </div>
                ${notifications ? `
                    <div class="profile-notification-summary">Unread: ${notifications.unreadCount}</div>
                    <div class="profile-notifications-list">
                        ${notifications.notifications.length > 0 ? notifications.notifications.map((notification) => `
                            <div class="profile-notification-item ${notification.is_read ? '' : 'is-unread'}">
                                <div class="profile-notification-meta">
                                    <span>${escapeProfileHtml(notification.actor_profile_flag || '🏳️')} ${escapeProfileHtml(notification.actor_username || 'System')}</span>
                                    <span>${formatForumDate(notification.created_at)}</span>
                                </div>
                                <div class="profile-notification-message">${escapeProfileHtml(notification.message)}</div>
                            </div>
                        `).join('') : '<div class="profile-empty-state">No notifications yet.</div>'}
                    </div>
                ` : '<div class="profile-empty-state">Loading notifications...</div>'}
            </section>
        ` : ''}
    `;

    const followButton = document.getElementById('profile-follow-btn');
    if (followButton) {
        followButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/forum/users/${encodeURIComponent(followButton.dataset.username)}/follow`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await readJsonResponse(response);
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Could not update follow status.');
                }
                initProfilePage(activeProfileUsername);
                if (typeof initForumPage === 'function') {
                    initForumPage();
                }
            } catch (error) {
                setProfileMessage(error.message || 'Could not update follow status.', 'danger');
            }
        });
    }

    const flagForm = document.getElementById('profile-flag-form');
    if (flagForm) {
        flagForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const select = document.getElementById('profile-flag-select');
            const profileFlag = select ? select.value : '';

            try {
                const response = await fetch('/api/profile/flag', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ profileFlag })
                });
                const result = await readJsonResponse(response);
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Could not update profile flag.');
                }

                if (currentUser) {
                    currentUser.profileFlag = profileFlag;
                    localStorage.setItem('worldCupUser', JSON.stringify(currentUser));
                }

                setProfileMessage('Profile flag updated.', 'success');
                initProfilePage(activeProfileUsername);
                if (typeof initForumPage === 'function') {
                    initForumPage();
                }
            } catch (error) {
                setProfileMessage(error.message || 'Could not update profile flag.', 'danger');
            }
        });
    }

    const markReadButton = document.getElementById('profile-mark-read-btn');
    if (markReadButton) {
        markReadButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/notifications/read-all', {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await readJsonResponse(response);
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Could not mark notifications as read.');
                }
                initProfilePage(activeProfileUsername);
            } catch (error) {
                setProfileMessage(error.message || 'Could not mark notifications as read.', 'danger');
            }
        });
    }
}

async function loadNotifications() {
    if (!currentUser) {
        return null;
    }

    const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    });

    const data = await readJsonResponse(response);
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not load notifications.');
    }

    return data;
}

async function initProfilePage(username = null) {
    const page = document.getElementById('profile-page');
    if (!page) return;

    const targetUsername = username || activeProfileUsername || (currentUser ? currentUser.username : null);
    activeProfileUsername = targetUsername;

    if (!targetUsername) {
        const container = document.getElementById('profile-content');
        if (container) {
            container.innerHTML = '<div class="profile-empty-state">Log in to view your profile.</div>';
        }
        return;
    }

    renderProfileSkeleton();

    try {
        const response = await fetch(`/api/profile/${encodeURIComponent(targetUsername)}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load profile.');
        }

        let notifications = null;
        if (data.viewerIsOwner) {
            notifications = await loadNotifications();
        }

        setProfileMessage('');
        renderProfileData(data, notifications);
    } catch (error) {
        console.error('Profile init error:', error);
        const container = document.getElementById('profile-content');
        if (container) {
            container.innerHTML = `<div class="profile-empty-state">${escapeProfileHtml(error.message || 'Could not load profile.')}</div>`;
        }
    }

    if (!profileInitialized) {
        profileInitialized = true;
    }
}

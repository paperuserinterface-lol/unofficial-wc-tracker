// Forum Page Logic

let forumInitialized = false;
let forumPostsCache = [];
let forumCurrentFilter = 'all';
const forumOpenComments = new Set();
const forumCommentsCache = {};

function escapeForumHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatForumDate(dateValue) {
    if (!dateValue) return 'Just now';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Just now';

    return date.toLocaleString();
}

function setForumMessage(message = '', type = 'info') {
    const messageEl = document.getElementById('forum-message');
    if (!messageEl) return;

    if (!message) {
        messageEl.style.display = 'none';
        messageEl.className = 'forum-message';
        messageEl.textContent = '';
        return;
    }

    messageEl.style.display = 'block';
    messageEl.className = `forum-message ${type}`;
    messageEl.textContent = message;
}

function renderForumComposer() {
    const composer = document.getElementById('forum-composer');
    if (!composer) return;

    if (!currentUser) {
        composer.innerHTML = `
            <div class="forum-compose-card forum-compose-locked">
                <h3>Join the discussion</h3>
                <p>Log in to publish posts, like threads, follow creators, and comment.</p>
            </div>
        `;
        return;
    }

    composer.innerHTML = `
        <form id="forum-post-form" class="forum-compose-card forum-post-form">
            <div class="forum-compose-topline">
                <div>
                    <h3>Post as ${escapeForumHtml(currentUser.profileFlag || '🏳️')} ${escapeForumHtml(currentUser.username)}</h3>
                    <p>Share reactions, predictions, draft ideas, or football takes.</p>
                </div>
                <span class="forum-author-badge">Community Post</span>
            </div>
            <textarea id="forum-post-content" class="forum-compose-textarea" maxlength="500" placeholder="What do you think about the World Cup today?" required></textarea>
            <div class="forum-compose-actions">
                <span class="forum-compose-note">Max 500 characters</span>
                <button type="submit" class="btn btn-primary">Publish Post</button>
            </div>
        </form>
    `;

    const form = document.getElementById('forum-post-form');
    if (form) {
        form.addEventListener('submit', handleForumPostSubmit);
    }
}

function renderForumPosts() {
    const container = document.getElementById('forum-posts');
    if (!container) return;

    if (forumPostsCache.length === 0) {
        container.innerHTML = '<div class="forum-empty-state">No forum posts yet. Be the first to start the conversation.</div>';
        return;
    }

    container.innerHTML = forumPostsCache.map((post) => {
        const canFollow = currentUser && currentUser.username !== post.author_username;
        const commentsOpen = forumOpenComments.has(post.id);
        const comments = forumCommentsCache[post.id] || [];

        return `
            <article class="forum-post-card ${post.locked ? 'is-locked' : ''}">
                <div class="forum-post-header">
                    <div>
                        <div class="forum-post-author-row">
                            <button class="forum-profile-link" data-forum-action="view-profile" data-username="${escapeForumHtml(post.author_username)}">
                                ${escapeForumHtml(post.author_profile_flag || '🏳️')} ${escapeForumHtml(post.author_username)}
                            </button>
                            ${post.author_admin ? '<span class="forum-role-tag">Admin</span>' : ''}
                            <span class="forum-follower-count">${post.author_follower_count} follower${post.author_follower_count === 1 ? '' : 's'}</span>
                        </div>
                        <div class="forum-post-time">${formatForumDate(post.created_at)}${post.updated_at !== post.created_at ? ' · edited' : ''}</div>
                    </div>
                    <div class="forum-post-side-actions">
                        ${canFollow ? `
                            <button class="btn btn-secondary forum-follow-btn" data-forum-action="follow" data-username="${escapeForumHtml(post.author_username)}">
                                ${post.following_author ? 'Following' : 'Follow'}
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${post.locked ? '<div class="forum-locked-banner">🔒 Locked by admin — no new comments or regular edits.</div>' : ''}

                <div class="forum-post-content">${escapeForumHtml(post.content).replace(/\n/g, '<br>')}</div>

                <div class="forum-post-actions">
                    <button class="btn btn-secondary forum-action-btn ${post.liked_by_viewer ? 'is-active' : ''}" data-forum-action="like" data-post-id="${post.id}">
                        ❤️ ${post.like_count}
                    </button>
                    <button class="btn btn-secondary forum-action-btn ${commentsOpen ? 'is-active' : ''}" data-forum-action="toggle-comments" data-post-id="${post.id}">
                        💬 ${post.comment_count}
                    </button>
                    ${post.can_edit ? `
                        <button class="btn btn-secondary forum-action-btn" data-forum-action="edit-post" data-post-id="${post.id}">Edit</button>
                    ` : ''}
                    ${post.can_delete && !post.can_moderate ? `
                        <button class="btn btn-danger forum-action-btn" data-forum-action="delete-post" data-post-id="${post.id}">Delete</button>
                    ` : ''}
                    ${post.can_moderate ? `
                        <button class="btn btn-secondary forum-action-btn" data-forum-action="toggle-lock" data-post-id="${post.id}" data-next-locked="${post.locked ? 'false' : 'true'}">
                            ${post.locked ? 'Unlock' : 'Lock'}
                        </button>
                        <button class="btn btn-danger forum-action-btn" data-forum-action="admin-remove-post" data-post-id="${post.id}">Admin Remove</button>
                    ` : ''}
                </div>

                ${commentsOpen ? `
                    <div class="forum-comments-section" id="forum-comments-${post.id}">
                        <div class="forum-comments-list">
                            ${comments.length > 0 ? comments.map((comment) => `
                                <div class="forum-comment-card">
                                    <div class="forum-comment-meta">
                                        <button class="forum-profile-link small" data-forum-action="view-profile" data-username="${escapeForumHtml(comment.username)}">
                                            ${escapeForumHtml(comment.profile_flag || '🏳️')} ${escapeForumHtml(comment.username)}
                                        </button>
                                        ${comment.admin ? '<span class="forum-role-tag">Admin</span>' : ''}
                                        <span>${formatForumDate(comment.created_at)}</span>
                                    </div>
                                    <div class="forum-comment-content">${escapeForumHtml(comment.content).replace(/\n/g, '<br>')}</div>
                                </div>
                            `).join('') : '<div class="forum-empty-comments">No comments yet.</div>'}
                        </div>
                        ${currentUser ? (post.locked ? '<div class="forum-comment-login-note">Comments are locked for this post.</div>' : `
                            <form class="forum-comment-form" data-post-id="${post.id}">
                                <textarea class="forum-comment-input" maxlength="300" placeholder="Write a comment..." required></textarea>
                                <button type="submit" class="btn btn-primary">Comment</button>
                            </form>
                        `) : '<div class="forum-comment-login-note">Log in to comment on this post.</div>'}
                    </div>
                ` : ''}
            </article>
        `;
    }).join('');
}

async function loadForumPosts() {
    const postsContainer = document.getElementById('forum-posts');
    if (postsContainer) {
        postsContainer.innerHTML = '<div class="forum-empty-state">Loading forum posts...</div>';
    }

    try {
        const response = await fetch(apiUrl(`/api/forum/posts?filter=${encodeURIComponent(forumCurrentFilter)}`), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load forum posts.');
        }

        forumPostsCache = Array.isArray(data.posts) ? data.posts : [];
        setForumMessage('');
        renderForumPosts();

        const openIds = Array.from(forumOpenComments);
        await Promise.all(openIds.map((postId) => loadForumComments(postId, false)));
        renderForumPosts();
    } catch (error) {
        console.error('Forum posts error:', error);
        forumPostsCache = [];
        renderForumPosts();
        setForumMessage(error.message || 'Could not load forum posts.', 'danger');
    }
}

async function loadForumComments(postId, rerender = true) {
    try {
        const response = await fetch(apiUrl(`/api/forum/posts/${postId}/comments`), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not load comments.');
        }

        forumCommentsCache[postId] = Array.isArray(data.comments) ? data.comments : [];
        if (rerender) {
            renderForumPosts();
        }
    } catch (error) {
        console.error('Forum comments error:', error);
        setForumMessage(error.message || 'Could not load comments.', 'danger');
    }
}

async function handleForumPostSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
        setForumMessage('Log in to publish a forum post.', 'warning');
        return;
    }

    const textarea = document.getElementById('forum-post-content');
    const content = textarea ? textarea.value.trim() : '';

    if (!content) {
        setForumMessage('Write something before posting.', 'warning');
        return;
    }

    try {
        const response = await fetch(apiUrl('/api/forum/posts'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not publish post.');
        }

        if (textarea) {
            textarea.value = '';
        }

        setForumMessage('Post published.', 'success');
        await loadForumPosts();
    } catch (error) {
        console.error('Forum post submit error:', error);
        setForumMessage(error.message || 'Could not publish post.', 'danger');
    }
}

async function toggleForumLike(postId) {
    if (!currentUser) {
        setForumMessage('Log in to like posts.', 'warning');
        return;
    }

    try {
        const response = await fetch(apiUrl(`/api/forum/posts/${postId}/like`), {
            method: 'POST',
            credentials: 'include'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not update like.');
        }

        await loadForumPosts();
    } catch (error) {
        console.error('Forum like error:', error);
        setForumMessage(error.message || 'Could not update like.', 'danger');
    }
}

async function toggleForumFollow(username) {
    if (!currentUser) {
        setForumMessage('Log in to follow users.', 'warning');
        return;
    }

    try {
        const response = await fetch(apiUrl(`/api/forum/users/${encodeURIComponent(username)}/follow`), {
            method: 'POST',
            credentials: 'include'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not update follow status.');
        }

        await loadForumPosts();
    } catch (error) {
        console.error('Forum follow error:', error);
        setForumMessage(error.message || 'Could not update follow status.', 'danger');
    }
}

async function toggleForumComments(postId) {
    if (forumOpenComments.has(postId)) {
        forumOpenComments.delete(postId);
        renderForumPosts();
        return;
    }

    forumOpenComments.add(postId);
    renderForumPosts();
    await loadForumComments(postId);
}

async function submitForumComment(postId, content) {
    if (!currentUser) {
        setForumMessage('Log in to comment.', 'warning');
        return;
    }

    try {
        const response = await fetch(apiUrl(`/api/forum/posts/${postId}/comments`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not add comment.');
        }

        await loadForumComments(postId, false);
        await loadForumPosts();
    } catch (error) {
        console.error('Forum comment error:', error);
        setForumMessage(error.message || 'Could not add comment.', 'danger');
    }
}

async function editForumPost(postId) {
    const post = forumPostsCache.find((item) => item.id === postId);
    if (!post) {
        return;
    }

    const nextContent = window.prompt('Edit your post:', post.content);
    if (nextContent === null) {
        return;
    }

    const trimmed = nextContent.trim();
    if (!trimmed) {
        setForumMessage('Post content cannot be empty.', 'warning');
        return;
    }

    try {
        const response = await fetch(apiUrl(`/api/forum/posts/${postId}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content: trimmed })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not update post.');
        }

        setForumMessage('Post updated.', 'success');
        await loadForumPosts();
    } catch (error) {
        console.error('Forum edit error:', error);
        setForumMessage(error.message || 'Could not update post.', 'danger');
    }
}

async function deleteForumPost(postId, adminMode = false) {
    const confirmation = adminMode
        ? 'Remove this post as admin? This cannot be undone.'
        : 'Delete this post? This cannot be undone.';

    if (!confirm(confirmation)) {
        return;
    }

    try {
        const endpoint = adminMode ? `/api/admin/forum/posts/${postId}` : `/api/forum/posts/${postId}`;
        const response = await fetch(apiUrl(endpoint), {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not delete post.');
        }

        forumOpenComments.delete(postId);
        delete forumCommentsCache[postId];
        setForumMessage(adminMode ? 'Post removed by admin.' : 'Post deleted.', 'success');
        await loadForumPosts();
    } catch (error) {
        console.error('Forum delete error:', error);
        setForumMessage(error.message || 'Could not delete post.', 'danger');
    }
}

async function toggleForumPostLock(postId, nextLocked) {
    try {
        const response = await fetch(apiUrl(`/api/admin/forum/posts/${postId}/lock`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ locked: nextLocked })
        });

        const data = await readJsonResponse(response);
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Could not update lock status.');
        }

        setForumMessage(nextLocked ? 'Post locked.' : 'Post unlocked.', 'success');
        await loadForumPosts();
    } catch (error) {
        console.error('Forum lock error:', error);
        setForumMessage(error.message || 'Could not update lock status.', 'danger');
    }
}

function initForumPage() {
    renderForumComposer();

    if (!forumInitialized) {
        const tabs = document.querySelectorAll('.forum-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.forum-tab').forEach((button) => button.classList.remove('active'));
                tab.classList.add('active');
                forumCurrentFilter = tab.dataset.forumFilter;
                setForumMessage('');
                loadForumPosts();
            });
        });

        const postsContainer = document.getElementById('forum-posts');
        if (postsContainer) {
            postsContainer.addEventListener('click', (event) => {
                const actionButton = event.target.closest('[data-forum-action]');
                if (!actionButton) return;

                const action = actionButton.dataset.forumAction;
                const postId = Number.parseInt(actionButton.dataset.postId, 10);
                const username = actionButton.dataset.username;

                if (action === 'like' && Number.isInteger(postId)) {
                    toggleForumLike(postId);
                } else if (action === 'toggle-comments' && Number.isInteger(postId)) {
                    toggleForumComments(postId);
                } else if (action === 'follow' && username) {
                    toggleForumFollow(username);
                } else if (action === 'view-profile' && username && typeof openProfilePage === 'function') {
                    openProfilePage(username);
                } else if (action === 'edit-post' && Number.isInteger(postId)) {
                    editForumPost(postId);
                } else if (action === 'delete-post' && Number.isInteger(postId)) {
                    deleteForumPost(postId, false);
                } else if (action === 'toggle-lock' && Number.isInteger(postId)) {
                    toggleForumPostLock(postId, actionButton.dataset.nextLocked === 'true');
                } else if (action === 'admin-remove-post' && Number.isInteger(postId)) {
                    deleteForumPost(postId, true);
                }
            });

            postsContainer.addEventListener('submit', (event) => {
                const form = event.target.closest('.forum-comment-form');
                if (!form) return;

                event.preventDefault();
                const postId = Number.parseInt(form.dataset.postId, 10);
                const input = form.querySelector('.forum-comment-input');
                const content = input ? input.value.trim() : '';

                if (!Number.isInteger(postId) || !content) {
                    return;
                }

                input.value = '';
                submitForumComment(postId, content);
            });
        }

        forumInitialized = true;
    }

    loadForumPosts();
}

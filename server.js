require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_PROFILE_FLAG = '🏳️';
const ALLOWED_PROFILE_FLAGS = new Set([
  '🏳️', '🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇵🇹', '🇳🇱', '🇮🇹', '🇧🇪', '🇭🇷', '🇲🇦',
  '🇺🇸', '🇲🇽', '🇨🇦', '🇯🇵', '🇰🇷', '🇸🇦', '🇦🇺', '🇮🇷', '🇪🇨', '🇺🇾', '🇨🇴', '🇨🇱',
  '🇵🇱', '🇷🇸', '🇩🇰', '🇨🇭', '🇸🇳', '🇬🇭', '🇳🇬', '🇨🇲', '🇪🇬', '🇹🇳'
]);

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('railway.app') || DATABASE_URL.includes('proxy.rlwy.net')
    ? { rejectUnauthorized: false }
    : false,
});

app.set('trust proxy', 1);

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://unofficial-wc-tracker-production.up.railway.app'
  ]);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(session({
  name: 'football.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

function sanitizeUser(user) {
  return {
    username: user.username,
    email: user.email,
    admin: Boolean(user.admin),
    profileFlag: user.profile_flag || DEFAULT_PROFILE_FLAG,
  };
}

async function getSessionUserRecord(req) {
  if (!req.session.user || !req.session.user.username) {
    return null;
  }

  const result = await pool.query(
    'SELECT id, username, email, admin, profile_flag FROM users WHERE username = $1 LIMIT 1',
    [req.session.user.username]
  );

  return result.rows[0] || null;
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Log in first.' });
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Log in first.' });
  }

  if (!req.session.user.admin) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }

  return next();
}

function normalizeDraftPayload(body = {}) {
  const formation = typeof body.formation === 'string' ? body.formation.trim() : '';
  const team = body.team;

  const isValidTeam = Boolean(team)
    && typeof team === 'object'
    && !Array.isArray(team)
    && typeof team.players === 'object'
    && !Array.isArray(team.players)
    && Array.isArray(team.substitutes);

  if (!formation || !isValidTeam) {
    return null;
  }

  return {
    formation,
    team,
  };
}

function parsePositiveId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeProfileFlag(flag) {
  if (typeof flag !== 'string') {
    return null;
  }

  const trimmed = flag.trim();
  if (!ALLOWED_PROFILE_FLAGS.has(trimmed)) {
    return null;
  }

  return trimmed;
}

async function findUserByUsername(username) {
  const result = await pool.query(
    'SELECT id, username, email, admin, profile_flag, created_at FROM users WHERE username = $1 LIMIT 1',
    [username]
  );

  return result.rows[0] || null;
}

async function createNotification({ userId, actorUserId = null, type, message, postId = null, commentId = null }) {
  if (!userId || !type || !message) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications (user_id, actor_user_id, type, message, post_id, comment_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, actorUserId, type, message, postId, commentId]
  );
}

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_flag VARCHAR(16) NOT NULL DEFAULT '${DEFAULT_PROFILE_FLAG}'
  `);
}

async function ensureDraftsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drafts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      formation VARCHAR(20) NOT NULL,
      team JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function ensureForumTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE forum_posts
    ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_post_likes (
      post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_follows (
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (follower_id, followed_id),
      CONSTRAINT user_follows_not_self CHECK (follower_id <> followed_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
      comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body || {};

  const trimmedUsername = typeof username === 'string' ? username.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const rawPassword = typeof password === 'string' ? password : '';

  if (!trimmedUsername || !trimmedEmail || !rawPassword) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
    return res.status(400).json({ success: false, message: 'Username must be between 3 and 50 characters.' });
  }

  if (rawPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  try {
    const duplicateCheck = await pool.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [trimmedUsername, trimmedEmail]
    );

    if (duplicateCheck.rows.length > 0) {
      const existingUser = duplicateCheck.rows[0];
      if (existingUser.username === trimmedUsername) {
        return res.status(409).json({ success: false, message: 'That username is already taken.' });
      }

      return res.status(409).json({ success: false, message: 'That email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    await pool.query(
      'INSERT INTO users (username, email, password, admin) VALUES ($1, $2, $3, FALSE)',
      [trimmedUsername, trimmedEmail, passwordHash]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Could not create account right now.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { emailOrUser, password } = req.body || {};

  const loginValue = typeof emailOrUser === 'string' ? emailOrUser.trim() : '';
  const rawPassword = typeof password === 'string' ? password : '';

  if (!loginValue || !rawPassword) {
    return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password, admin, profile_flag FROM users WHERE LOWER(email) = LOWER($1) OR username = $1 LIMIT 1',
      [loginValue]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(rawPassword, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    req.session.user = sanitizeUser(user);

    return res.json({
      success: true,
      username: user.username,
      email: user.email,
      admin: Boolean(user.admin),
      profileFlag: user.profile_flag || DEFAULT_PROFILE_FLAG,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Could not log in right now.' });
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  return res.json({ success: true, ...req.session.user });
});

app.get('/api/profile/:username', async (req, res) => {
  const username = typeof req.params.username === 'string' ? req.params.username.trim() : '';
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    const viewerId = viewer ? viewer.id : 0;

    const profileResult = await pool.query(
      `SELECT u.username,
              u.admin,
              u.profile_flag,
              u.created_at,
              COALESCE(posts.posts_count, 0)::int AS posts_count,
              COALESCE(followers.follower_count, 0)::int AS follower_count,
              COALESCE(following.following_count, 0)::int AS following_count,
              CASE WHEN uf.follower_id IS NULL THEN FALSE ELSE TRUE END AS followed_by_viewer
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*)::int AS posts_count
         FROM forum_posts
         GROUP BY user_id
       ) posts ON posts.user_id = u.id
       LEFT JOIN (
         SELECT followed_id, COUNT(*)::int AS follower_count
         FROM user_follows
         GROUP BY followed_id
       ) followers ON followers.followed_id = u.id
       LEFT JOIN (
         SELECT follower_id, COUNT(*)::int AS following_count
         FROM user_follows
         GROUP BY follower_id
       ) following ON following.follower_id = u.id
       LEFT JOIN user_follows uf ON uf.followed_id = u.id AND uf.follower_id = $1
       WHERE u.username = $2
       LIMIT 1`,
      [viewerId, username]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const postsResult = await pool.query(
      `SELECT p.id,
              p.content,
              p.created_at,
              p.updated_at,
              p.locked,
              COALESCE(lc.like_count, 0)::int AS like_count,
              COALESCE(cc.comment_count, 0)::int AS comment_count
       FROM forum_posts p
       INNER JOIN users u ON u.id = p.user_id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS like_count
         FROM forum_post_likes
         GROUP BY post_id
       ) lc ON lc.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS comment_count
         FROM forum_comments
         GROUP BY post_id
       ) cc ON cc.post_id = p.id
       WHERE u.username = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [username]
    );

    return res.json({
      success: true,
      profile: {
        ...profileResult.rows[0],
        profile_flag: profileResult.rows[0].profile_flag || DEFAULT_PROFILE_FLAG,
      },
      posts: postsResult.rows,
      viewerIsOwner: Boolean(viewer && viewer.username === username),
    });
  } catch (error) {
    console.error('Profile load error:', error);
    return res.status(500).json({ success: false, message: 'Could not load profile.' });
  }
});

app.patch('/api/profile/flag', requireAuth, async (req, res) => {
  const profileFlag = normalizeProfileFlag(req.body?.profileFlag);

  if (!profileFlag) {
    return res.status(400).json({ success: false, message: 'Choose a valid World Cup flag.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const result = await pool.query(
      'UPDATE users SET profile_flag = $1 WHERE id = $2 RETURNING username, email, admin, profile_flag',
      [profileFlag, viewer.id]
    );

    req.session.user = sanitizeUser(result.rows[0]);

    return res.json({ success: true, profileFlag });
  } catch (error) {
    console.error('Profile flag update error:', error);
    return res.status(500).json({ success: false, message: 'Could not update profile flag.' });
  }
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const [notificationsResult, unreadResult] = await Promise.all([
      pool.query(
        `SELECT n.id,
                n.type,
                n.message,
                n.is_read,
                n.created_at,
                n.post_id,
                actor.username AS actor_username,
                actor.profile_flag AS actor_profile_flag
         FROM notifications n
         LEFT JOIN users actor ON actor.id = n.actor_user_id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT 25`,
        [viewer.id]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [viewer.id]
      )
    ]);

    return res.json({
      success: true,
      notifications: notificationsResult.rows,
      unreadCount: unreadResult.rows[0].count,
    });
  } catch (error) {
    console.error('Notifications load error:', error);
    return res.status(500).json({ success: false, message: 'Could not load notifications.' });
  }
});

app.post('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [viewer.id]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Notifications mark read error:', error);
    return res.status(500).json({ success: false, message: 'Could not mark notifications as read.' });
  }
});

app.get('/api/forum/posts', async (req, res) => {
  const filter = req.query.filter === 'following' ? 'following' : 'all';

  try {
    const viewer = await getSessionUserRecord(req);
    const viewerId = viewer ? viewer.id : 0;
    const viewerIsAdmin = viewer ? Boolean(viewer.admin) : false;

    if (filter === 'following' && !viewer) {
      return res.status(401).json({ success: false, message: 'Log in to view posts from people you follow.' });
    }

    const followJoin = filter === 'following'
      ? 'INNER JOIN user_follows uf_filter ON uf_filter.followed_id = u.id AND uf_filter.follower_id = $1'
      : '';

    const result = await pool.query(
      `SELECT p.id,
              p.content,
              p.created_at,
              p.updated_at,
              p.locked,
              u.username AS author_username,
              u.admin AS author_admin,
              u.profile_flag AS author_profile_flag,
              COALESCE(lc.like_count, 0)::int AS like_count,
              COALESCE(cc.comment_count, 0)::int AS comment_count,
              CASE WHEN pll.user_id IS NULL THEN FALSE ELSE TRUE END AS liked_by_viewer,
              CASE WHEN uf.follower_id IS NULL THEN FALSE ELSE TRUE END AS following_author,
              COALESCE(fc.follower_count, 0)::int AS author_follower_count,
              CASE WHEN p.user_id = $1 OR $2::boolean THEN TRUE ELSE FALSE END AS can_edit,
              CASE WHEN p.user_id = $1 OR $2::boolean THEN TRUE ELSE FALSE END AS can_delete,
              $2::boolean AS can_moderate
       FROM forum_posts p
       INNER JOIN users u ON u.id = p.user_id
       ${followJoin}
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS like_count
         FROM forum_post_likes
         GROUP BY post_id
       ) lc ON lc.post_id = p.id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS comment_count
         FROM forum_comments
         GROUP BY post_id
       ) cc ON cc.post_id = p.id
       LEFT JOIN forum_post_likes pll ON pll.post_id = p.id AND pll.user_id = $1
       LEFT JOIN user_follows uf ON uf.followed_id = u.id AND uf.follower_id = $1
       LEFT JOIN (
         SELECT followed_id, COUNT(*)::int AS follower_count
         FROM user_follows
         GROUP BY followed_id
       ) fc ON fc.followed_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [viewerId, viewerIsAdmin]
    );

    return res.json({ success: true, posts: result.rows });
  } catch (error) {
    console.error('Forum posts error:', error);
    return res.status(500).json({ success: false, message: 'Could not load forum posts.' });
  }
});

app.post('/api/forum/posts', requireAuth, async (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    return res.status(400).json({ success: false, message: 'Post content is required.' });
  }

  if (content.length > 500) {
    return res.status(400).json({ success: false, message: 'Posts must be 500 characters or fewer.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const result = await pool.query(
      `INSERT INTO forum_posts (user_id, content, updated_at)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [viewer.id, content]
    );

    return res.status(201).json({ success: true, postId: result.rows[0].id });
  } catch (error) {
    console.error('Create forum post error:', error);
    return res.status(500).json({ success: false, message: 'Could not publish post.' });
  }
});

app.patch('/api/forum/posts/:id', requireAuth, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!postId || !content) {
    return res.status(400).json({ success: false, message: 'Valid post content is required.' });
  }

  if (content.length > 500) {
    return res.status(400).json({ success: false, message: 'Posts must be 500 characters or fewer.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const postResult = await pool.query(
      'SELECT id, user_id, locked FROM forum_posts WHERE id = $1 LIMIT 1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postResult.rows[0];
    const isOwner = post.user_id === viewer.id;
    const isAdmin = Boolean(viewer.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You cannot edit this post.' });
    }

    if (post.locked && !isAdmin) {
      return res.status(400).json({ success: false, message: 'This post is locked by an admin.' });
    }

    await pool.query(
      'UPDATE forum_posts SET content = $1, updated_at = NOW() WHERE id = $2',
      [content, postId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Edit forum post error:', error);
    return res.status(500).json({ success: false, message: 'Could not update post.' });
  }
});

app.delete('/api/forum/posts/:id', requireAuth, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  if (!postId) {
    return res.status(400).json({ success: false, message: 'Invalid post id.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const postResult = await pool.query(
      'SELECT id, user_id FROM forum_posts WHERE id = $1 LIMIT 1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postResult.rows[0];
    const isOwner = post.user_id === viewer.id;
    const isAdmin = Boolean(viewer.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You cannot delete this post.' });
    }

    await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete forum post error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete post.' });
  }
});

app.get('/api/forum/posts/:id/comments', async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  if (!postId) {
    return res.status(400).json({ success: false, message: 'Invalid post id.' });
  }

  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.username, u.admin, u.profile_flag
       FROM forum_comments c
       INNER JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    return res.json({ success: true, comments: result.rows });
  } catch (error) {
    console.error('Forum comments error:', error);
    return res.status(500).json({ success: false, message: 'Could not load comments.' });
  }
});

app.post('/api/forum/posts/:id/comments', requireAuth, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!postId) {
    return res.status(400).json({ success: false, message: 'Invalid post id.' });
  }

  if (!content) {
    return res.status(400).json({ success: false, message: 'Comment content is required.' });
  }

  if (content.length > 300) {
    return res.status(400).json({ success: false, message: 'Comments must be 300 characters or fewer.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const postResult = await pool.query(
      'SELECT id, user_id, locked FROM forum_posts WHERE id = $1 LIMIT 1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postResult.rows[0];
    if (post.locked) {
      return res.status(400).json({ success: false, message: 'Comments are locked for this post.' });
    }

    const insertResult = await pool.query(
      'INSERT INTO forum_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
      [postId, viewer.id, content]
    );

    if (post.user_id !== viewer.id) {
      await createNotification({
        userId: post.user_id,
        actorUserId: viewer.id,
        type: 'comment',
        message: `${viewer.username} commented on your post`,
        postId,
        commentId: insertResult.rows[0].id,
      });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Create forum comment error:', error);
    return res.status(500).json({ success: false, message: 'Could not add comment.' });
  }
});

app.post('/api/forum/posts/:id/like', requireAuth, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  if (!postId) {
    return res.status(400).json({ success: false, message: 'Invalid post id.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    const postResult = await pool.query(
      'SELECT id, user_id FROM forum_posts WHERE id = $1 LIMIT 1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const postOwnerId = postResult.rows[0].user_id;
    const insertResult = await pool.query(
      `INSERT INTO forum_post_likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [postId, viewer.id]
    );

    let liked = true;
    if (insertResult.rowCount === 0) {
      await pool.query(
        'DELETE FROM forum_post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, viewer.id]
      );
      liked = false;
    } else if (postOwnerId !== viewer.id) {
      await createNotification({
        userId: postOwnerId,
        actorUserId: viewer.id,
        type: 'like',
        message: `${viewer.username} liked your post`,
        postId,
      });
    }

    return res.json({ success: true, liked });
  } catch (error) {
    console.error('Toggle forum like error:', error);
    return res.status(500).json({ success: false, message: 'Could not update like.' });
  }
});

app.post('/api/forum/users/:username/follow', requireAuth, async (req, res) => {
  const username = typeof req.params.username === 'string' ? req.params.username.trim() : '';

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    const viewer = await getSessionUserRecord(req);
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Log in first.' });
    }

    if (viewer.username === username) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetResult = await pool.query(
      'SELECT id FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetId = targetResult.rows[0].id;
    const insertResult = await pool.query(
      `INSERT INTO user_follows (follower_id, followed_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [viewer.id, targetId]
    );

    let following = true;
    if (insertResult.rowCount === 0) {
      await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND followed_id = $2',
        [viewer.id, targetId]
      );
      following = false;
    } else {
      await createNotification({
        userId: targetId,
        actorUserId: viewer.id,
        type: 'follow',
        message: `${viewer.username} followed your profile`,
      });
    }

    return res.json({ success: true, following });
  } catch (error) {
    console.error('Toggle forum follow error:', error);
    return res.status(500).json({ success: false, message: 'Could not update follow status.' });
  }
});

app.get('/api/drafts/latest', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.formation, d.team, d.updated_at
       FROM drafts d
       INNER JOIN users u ON u.id = d.user_id
       WHERE u.username = $1
       LIMIT 1`,
      [req.session.user.username]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, draft: null });
    }

    return res.json({ success: true, draft: result.rows[0] });
  } catch (error) {
    console.error('Load draft error:', error);
    return res.status(500).json({ success: false, message: 'Could not load draft.' });
  }
});

app.put('/api/drafts/latest', requireAuth, async (req, res) => {
  const draft = normalizeDraftPayload(req.body);

  if (!draft) {
    return res.status(400).json({ success: false, message: 'Invalid draft payload.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1 LIMIT 1',
      [req.session.user.username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await pool.query(
      `INSERT INTO drafts (user_id, formation, team, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET formation = EXCLUDED.formation, team = EXCLUDED.team, updated_at = NOW()`,
      [userResult.rows[0].id, draft.formation, JSON.stringify(draft.team)]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Save draft error:', error);
    return res.status(500).json({ success: false, message: 'Could not save draft.' });
  }
});

app.delete('/api/drafts/latest', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM drafts
       WHERE user_id = (SELECT id FROM users WHERE username = $1 LIMIT 1)`,
      [req.session.user.username]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete draft error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete draft.' });
  }
});

app.get('/api/admin/overview', requireAdmin, async (req, res) => {
  try {
    const [userCountResult, adminCountResult, newThisWeekResult, draftsSavedResult, latestUsersResult, forumPostsResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM users WHERE admin = TRUE'),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"),
      pool.query('SELECT COUNT(*)::int AS count FROM drafts'),
      pool.query(`
        SELECT u.id, u.username, u.email, u.admin, u.created_at, d.updated_at AS draft_updated_at
        FROM users u
        LEFT JOIN drafts d ON d.user_id = u.id
        ORDER BY u.created_at DESC
        LIMIT 8
      `),
      pool.query('SELECT COUNT(*)::int AS count FROM forum_posts')
    ]);

    return res.json({
      success: true,
      totals: {
        users: userCountResult.rows[0].count,
        admins: adminCountResult.rows[0].count,
        newThisWeek: newThisWeekResult.rows[0].count,
        draftsSaved: draftsSavedResult.rows[0].count,
        forumPosts: forumPostsResult.rows[0].count,
      },
      latestUsers: latestUsersResult.rows,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, message: 'Could not load admin overview.' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const role = typeof req.query.role === 'string' ? req.query.role.trim().toLowerCase() : 'all';
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.username ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }

  if (role === 'admin') {
    conditions.push('u.admin = TRUE');
  } else if (role === 'user') {
    conditions.push('u.admin = FALSE');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.admin, u.created_at, d.updated_at AS draft_updated_at,
              CASE WHEN d.id IS NULL THEN FALSE ELSE TRUE END AS has_draft
       FROM users u
       LEFT JOIN drafts d ON d.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC`,
      params
    );

    return res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, message: 'Could not load users.' });
  }
});

app.get('/api/admin/users/:id/draft', requireAdmin, async (req, res) => {
  const userId = parsePositiveId(req.params.id);
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Invalid user id.' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, d.formation, d.team, d.updated_at
       FROM users u
       LEFT JOIN drafts d ON d.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const row = result.rows[0];

    if (!row.team) {
      return res.json({
        success: true,
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
        },
        draft: null,
      });
    }

    return res.json({
      success: true,
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
      },
      draft: {
        formation: row.formation,
        team: row.team,
        updated_at: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Admin user draft error:', error);
    return res.status(500).json({ success: false, message: 'Could not load user draft.' });
  }
});

app.patch('/api/admin/users/:id/admin', requireAdmin, async (req, res) => {
  const userId = parsePositiveId(req.params.id);
  const nextAdminValue = req.body && typeof req.body.admin === 'boolean' ? req.body.admin : null;

  if (!userId || nextAdminValue === null) {
    return res.status(400).json({ success: false, message: 'Invalid admin update request.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, username, email, admin, created_at FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.username === req.session.user.username && !nextAdminValue) {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin access.' });
    }

    const updatedResult = await pool.query(
      'UPDATE users SET admin = $1 WHERE id = $2 RETURNING id, username, email, admin, created_at',
      [nextAdminValue, userId]
    );

    return res.json({ success: true, user: updatedResult.rows[0] });
  } catch (error) {
    console.error('Admin role update error:', error);
    return res.status(500).json({ success: false, message: 'Could not update admin role.' });
  }
});

app.post('/api/admin/command', requireAdmin, async (req, res) => {
  const rawCommand = typeof req.body?.command === 'string' ? req.body.command.trim() : '';

  if (!rawCommand) {
    return res.status(400).json({ success: false, message: 'Enter a command.' });
  }

  const normalized = rawCommand.startsWith('/') ? rawCommand.slice(1) : rawCommand;
  const parts = normalized.split(/\s+/).filter(Boolean);
  const commandName = (parts.shift() || '').toLowerCase();
  const adminUser = await getSessionUserRecord(req);

  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Log in first.' });
  }

  try {
    if (commandName === 'help') {
      return res.json({
        success: true,
        output: [
          '/help',
          '/admin username on|off',
          '/deleteuser username',
          '/viewdraft username',
          '/lockpost postId',
          '/unlockpost postId',
          '/deletepost postId',
          '/profileflag username flag',
          '/finduser query'
        ],
        type: 'info'
      });
    }

    if (commandName === 'finduser') {
      const query = parts.join(' ').trim();
      if (!query) {
        return res.status(400).json({ success: false, message: 'Usage: /finduser query' });
      }

      const result = await pool.query(
        `SELECT username, email, admin
         FROM users
         WHERE username ILIKE $1 OR email ILIKE $1
         ORDER BY username ASC
         LIMIT 10`,
        [`%${query}%`]
      );

      return res.json({
        success: true,
        output: result.rows.length > 0
          ? result.rows.map((user) => `${user.username} · ${user.email} · ${user.admin ? 'Admin' : 'User'}`)
          : ['No matching users found.'],
        type: 'info'
      });
    }

    if (commandName === 'admin') {
      const [username, state] = parts;
      if (!username || !state || !['on', 'off'].includes(state.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Usage: /admin username on|off' });
      }

      const targetUser = await findUserByUsername(username);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const nextAdminValue = state.toLowerCase() === 'on';
      if (targetUser.username === adminUser.username && !nextAdminValue) {
        return res.status(400).json({ success: false, message: 'You cannot remove your own admin access.' });
      }

      await pool.query('UPDATE users SET admin = $1 WHERE id = $2', [nextAdminValue, targetUser.id]);
      return res.json({
        success: true,
        output: [`${targetUser.username} is now ${nextAdminValue ? 'an admin' : 'a regular user'}.`],
        type: 'success'
      });
    }

    if (commandName === 'deleteuser') {
      const [username] = parts;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Usage: /deleteuser username' });
      }

      const targetUser = await findUserByUsername(username);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (targetUser.username === adminUser.username) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own account from the admin panel.' });
      }

      await pool.query('DELETE FROM users WHERE id = $1', [targetUser.id]);
      return res.json({
        success: true,
        output: [`Deleted user ${targetUser.username}.`],
        type: 'success'
      });
    }

    if (commandName === 'viewdraft') {
      const [username] = parts;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Usage: /viewdraft username' });
      }

      const result = await pool.query(
        `SELECT u.id, u.username, u.email, d.formation, d.team, d.updated_at
         FROM users u
         LEFT JOIN drafts d ON d.user_id = u.id
         WHERE u.username = $1
         LIMIT 1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const row = result.rows[0];
      return res.json({
        success: true,
        output: [row.team ? `Loaded draft for ${row.username}.` : `${row.username} has no saved draft.`],
        type: 'success',
        draftResult: {
          user: {
            id: row.id,
            username: row.username,
            email: row.email,
          },
          draft: row.team ? {
            formation: row.formation,
            team: row.team,
            updated_at: row.updated_at,
          } : null,
        }
      });
    }

    if (commandName === 'lockpost' || commandName === 'unlockpost' || commandName === 'deletepost') {
      const [postIdRaw] = parts;
      const postId = parsePositiveId(postIdRaw);
      if (!postId) {
        return res.status(400).json({ success: false, message: `Usage: /${commandName} postId` });
      }

      const postResult = await pool.query(
        `SELECT p.id, p.user_id, u.username
         FROM forum_posts p
         INNER JOIN users u ON u.id = p.user_id
         WHERE p.id = $1
         LIMIT 1`,
        [postId]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Post not found.' });
      }

      const post = postResult.rows[0];

      if (commandName === 'deletepost') {
        await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);
        if (post.user_id !== adminUser.id) {
          await createNotification({
            userId: post.user_id,
            actorUserId: adminUser.id,
            type: 'post_removed',
            message: `${adminUser.username} removed one of your forum posts`,
          });
        }
        return res.json({
          success: true,
          output: [`Deleted post ${postId} by ${post.username}.`],
          type: 'success'
        });
      }

      const nextLocked = commandName === 'lockpost';
      await pool.query('UPDATE forum_posts SET locked = $1 WHERE id = $2', [nextLocked, postId]);
      if (post.user_id !== adminUser.id) {
        await createNotification({
          userId: post.user_id,
          actorUserId: adminUser.id,
          type: nextLocked ? 'post_locked' : 'post_unlocked',
          message: nextLocked ? `${adminUser.username} locked your forum post` : `${adminUser.username} unlocked your forum post`,
          postId,
        });
      }

      return res.json({
        success: true,
        output: [`${nextLocked ? 'Locked' : 'Unlocked'} post ${postId}.`],
        type: 'success'
      });
    }

    if (commandName === 'profileflag') {
      const [username, flagRaw] = parts;
      const profileFlag = normalizeProfileFlag(flagRaw || '');
      if (!username || !profileFlag) {
        return res.status(400).json({ success: false, message: 'Usage: /profileflag username flag' });
      }

      const targetUser = await findUserByUsername(username);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      await pool.query('UPDATE users SET profile_flag = $1 WHERE id = $2', [profileFlag, targetUser.id]);
      return res.json({
        success: true,
        output: [`Updated ${targetUser.username}'s profile flag to ${profileFlag}.`],
        type: 'success'
      });
    }

    return res.status(400).json({ success: false, message: `Unknown command: /${commandName}` });
  } catch (error) {
    console.error('Admin command error:', error);
    return res.status(500).json({ success: false, message: 'Could not execute admin command.' });
  }
});

app.patch('/api/admin/forum/posts/:id/lock', requireAdmin, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  const locked = typeof req.body?.locked === 'boolean' ? req.body.locked : null;

  if (!postId || locked === null) {
    return res.status(400).json({ success: false, message: 'Invalid moderation request.' });
  }

  try {
    const adminUser = await getSessionUserRecord(req);
    const postResult = await pool.query(
      `SELECT p.id, p.user_id, u.username
       FROM forum_posts p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.id = $1
       LIMIT 1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postResult.rows[0];
    await pool.query('UPDATE forum_posts SET locked = $1 WHERE id = $2', [locked, postId]);

    if (adminUser && post.user_id !== adminUser.id) {
      await createNotification({
        userId: post.user_id,
        actorUserId: adminUser.id,
        type: locked ? 'post_locked' : 'post_unlocked',
        message: locked ? `${adminUser.username} locked your forum post` : `${adminUser.username} unlocked your forum post`,
        postId,
      });
    }

    return res.json({ success: true, locked });
  } catch (error) {
    console.error('Admin lock post error:', error);
    return res.status(500).json({ success: false, message: 'Could not update lock status.' });
  }
});

app.delete('/api/admin/forum/posts/:id', requireAdmin, async (req, res) => {
  const postId = parsePositiveId(req.params.id);
  if (!postId) {
    return res.status(400).json({ success: false, message: 'Invalid post id.' });
  }

  try {
    const adminUser = await getSessionUserRecord(req);
    const postResult = await pool.query(
      'SELECT id, user_id FROM forum_posts WHERE id = $1 LIMIT 1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = postResult.rows[0];
    await pool.query('DELETE FROM forum_posts WHERE id = $1', [postId]);

    if (adminUser && post.user_id !== adminUser.id) {
      await createNotification({
        userId: post.user_id,
        actorUserId: adminUser.id,
        type: 'post_removed',
        message: `${adminUser.username} removed one of your forum posts`,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Admin delete post error:', error);
    return res.status(500).json({ success: false, message: 'Could not remove post.' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const userId = parsePositiveId(req.params.id);
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Invalid user id.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, username FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userResult.rows[0];

    if (targetUser.username === req.session.user.username) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account from the admin panel.' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete user.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ success: false, message: 'Could not log out right now.' });
    }

    res.clearCookie('football.sid');
    return res.json({ success: true });
  });
});

app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

Promise.all([ensureUsersTable(), ensureDraftsTable(), ensureForumTables()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Football app running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// server.js
// Nord - a minimal, working Instagram-like app.
// Built with zero external dependencies (pure Node.js) so it runs
// anywhere `node` is installed, no `npm install` required.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const querystring = require('querystring');

const store = require('./lib/store');
const auth = require('./lib/auth');
const { parseContentType, parseMultipart } = require('./lib/multipart');
const views = require('./views/templates');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Defensive: on a fresh clone/deploy these folders may not exist yet
// (e.g. an empty git checkout on a hosting platform).
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });

const MIME = {
  '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp',
};

// ---------- helpers ----------
function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const [k, ...v] = pair.trim().split('=');
    cookies[k] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

function getCurrentUser(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies.nord_session;
  if (!sessionId) return null;
  const userId = auth.getUserIdBySession(sessionId);
  if (!userId) return null;
  return store.findUserById(userId);
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}
function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { sendHtml(res, 404, 'Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------- route handlers ----------
async function handleRegister(req, res) {
  const body = querystring.parse((await readBody(req)).toString());
  const username = (body.username || '').trim();
  const password = body.password || '';

  if (username.length < 3 || password.length < 4) {
    return sendHtml(res, 400, views.layout({
      title: 'Sign up - Nord',
      body: views.authForm({ mode: 'register', error: 'Username min 3 chars, password min 4 chars.' }),
    }));
  }
  if (store.findUserByUsername(username)) {
    return sendHtml(res, 400, views.layout({
      title: 'Sign up - Nord',
      body: views.authForm({ mode: 'register', error: 'Username already taken.' }),
    }));
  }
  const { hash, salt } = auth.hashPassword(password);
  const user = store.createUser({ username, passwordHash: hash, salt });
  const sessionId = auth.createSession(user.id);
  res.setHeader('Set-Cookie', `nord_session=${sessionId}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}`);
  redirect(res, '/');
}

async function handleLogin(req, res) {
  const body = querystring.parse((await readBody(req)).toString());
  const username = (body.username || '').trim();
  const password = body.password || '';
  const user = store.findUserByUsername(username);

  if (!user || !auth.verifyPassword(password, user.salt, user.passwordHash)) {
    return sendHtml(res, 400, views.layout({
      title: 'Log in - Nord',
      body: views.authForm({ mode: 'login', error: 'Invalid username or password.' }),
    }));
  }
  const sessionId = auth.createSession(user.id);
  res.setHeader('Set-Cookie', `nord_session=${sessionId}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}`);
  redirect(res, '/');
}

function handleLogout(req, res) {
  const cookies = parseCookies(req);
  if (cookies.nord_session) auth.destroySession(cookies.nord_session);
  res.setHeader('Set-Cookie', 'nord_session=; HttpOnly; Path=/; Max-Age=0');
  redirect(res, '/login');
}

async function handleUpload(req, res, currentUser) {
  const contentType = req.headers['content-type'] || '';
  const boundary = parseContentType(contentType);
  if (!boundary) return sendHtml(res, 400, 'Bad request: expected multipart/form-data');

  const raw = await readBody(req);
  const { fields, files } = parseMultipart(raw, boundary);
  const image = files.image;
  const caption = (fields.caption || '').trim();

  if (!image || image.data.length === 0) {
    return sendHtml(res, 400, views.layout({
      title: 'New post - Nord', currentUser,
      body: views.uploadPage({ error: 'Please choose an image.' }),
    }));
  }
  const ext = path.extname(image.filename) || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), image.data);

  store.createPost({ userId: currentUser.id, imagePath: filename, caption });
  redirect(res, '/');
}

async function handleLike(req, res, currentUser, postId) {
  if (!store.findPostById(postId)) return sendHtml(res, 404, 'Post not found');
  store.toggleLike(postId, currentUser.id);
  redirect(res, req.headers.referer || '/');
}

async function handleComment(req, res, currentUser, postId) {
  const body = querystring.parse((await readBody(req)).toString());
  const text = (body.text || '').trim();
  if (!store.findPostById(postId)) return sendHtml(res, 404, 'Post not found');
  if (text) store.addComment(postId, currentUser.id, text);
  redirect(res, req.headers.referer || '/');
}

async function handleStoryUpload(req, res, currentUser) {
  const contentType = req.headers['content-type'] || '';
  const boundary = parseContentType(contentType);
  if (!boundary) return sendHtml(res, 400, 'Bad request: expected multipart/form-data');

  const raw = await readBody(req);
  const { files } = parseMultipart(raw, boundary);
  const image = files.image;

  if (!image || image.data.length === 0) {
    return sendHtml(res, 400, views.layout({
      title: 'New story - Nord', currentUser,
      body: views.storyUploadPage({ error: 'Please choose an image.' }),
    }));
  }
  const ext = path.extname(image.filename) || '.jpg';
  const filename = `story-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), image.data);

  store.createStory({ userId: currentUser.id, imagePath: filename });
  redirect(res, '/');
}

// ---------- router ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const currentUser = getCurrentUser(req);

    // static assets
    if (pathname.startsWith('/public/')) {
      return serveStaticFile(res, path.join(PUBLIC_DIR, pathname.replace('/public/', '')));
    }
    if (pathname.startsWith('/uploads/')) {
      return serveStaticFile(res, path.join(UPLOAD_DIR, pathname.replace('/uploads/', '')));
    }

    // auth-required guard for everything except auth pages
    const publicPaths = ['/login', '/register'];
    if (!currentUser && !publicPaths.includes(pathname) && req.method !== 'GET') {
      // POST to a protected route without auth
      if (!['/login', '/register'].includes(pathname)) return redirect(res, '/login');
    }

    if (pathname === '/' && req.method === 'GET') {
      if (!currentUser) return redirect(res, '/login');
      const posts = store.allPostsWithMeta(currentUser.id);
      const storyAuthors = store.activeStoryAuthors(currentUser.id);
      return sendHtml(res, 200, views.layout({
        title: 'Nord', currentUser,
        body: views.storyBar({ storyAuthors, currentUser }) + views.feedPage(posts),
      }));
    }

    if (pathname === '/login' && req.method === 'GET') {
      if (currentUser) return redirect(res, '/');
      return sendHtml(res, 200, views.layout({ title: 'Log in - Nord', body: views.authForm({ mode: 'login' }) }));
    }
    if (pathname === '/login' && req.method === 'POST') return handleLogin(req, res);

    if (pathname === '/register' && req.method === 'GET') {
      if (currentUser) return redirect(res, '/');
      return sendHtml(res, 200, views.layout({ title: 'Sign up - Nord', body: views.authForm({ mode: 'register' }) }));
    }
    if (pathname === '/register' && req.method === 'POST') return handleRegister(req, res);

    if (pathname === '/logout' && req.method === 'POST') return handleLogout(req, res);

    // everything below requires login
    if (!currentUser) return redirect(res, '/login');

    if (pathname === '/upload' && req.method === 'GET') {
      return sendHtml(res, 200, views.layout({ title: 'New post - Nord', currentUser, body: views.uploadPage() }));
    }
    if (pathname === '/upload' && req.method === 'POST') return handleUpload(req, res, currentUser);

    if (pathname === '/story/new' && req.method === 'GET') {
      return sendHtml(res, 200, views.layout({ title: 'New story - Nord', currentUser, body: views.storyUploadPage() }));
    }
    if (pathname === '/story/new' && req.method === 'POST') return handleStoryUpload(req, res, currentUser);

    if (pathname === '/search' && req.method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const results = q ? store.searchUsers(q, currentUser.id) : [];
      return sendHtml(res, 200, views.layout({
        title: 'Search - Nord', currentUser,
        body: views.searchPage({ query: q, results }),
      }));
    }

    const storyViewMatch = pathname.match(/^\/story\/user\/(\d+)$/);
    if (storyViewMatch && req.method === 'GET') {
      const author = store.findUserById(storyViewMatch[1]);
      if (!author) return sendHtml(res, 404, 'User not found');
      const stories = store.activeStoriesByUser(author.id);
      return sendHtml(res, 200, views.layout({
        title: `${author.username}'s story - Nord`, currentUser,
        body: views.storyViewerPage({ author, stories }),
      }));
    }

    const likeMatch = pathname.match(/^\/like\/(\d+)$/);
    if (likeMatch && req.method === 'POST') return handleLike(req, res, currentUser, likeMatch[1]);

    const commentMatch = pathname.match(/^\/comment\/(\d+)$/);
    if (commentMatch && req.method === 'POST') return handleComment(req, res, currentUser, commentMatch[1]);

    const profileMatch = pathname.match(/^\/profile\/(\d+)$/);
    if (profileMatch && req.method === 'GET') {
      const profileUser = store.findUserById(profileMatch[1]);
      if (!profileUser) return sendHtml(res, 404, 'User not found');
      const posts = store.postsByUser(profileUser.id, currentUser.id);
      return sendHtml(res, 200, views.layout({
        title: `${profileUser.username} - Nord`, currentUser,
        body: views.profilePage({ profileUser, posts, currentUser }),
      }));
    }

    sendHtml(res, 404, views.layout({ title: 'Not found - Nord', currentUser, body: '<p class="empty-state">Page not found.</p>' }));
  } catch (err) {
    console.error(err);
    sendHtml(res, 500, 'Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`Nord running at http://localhost:${PORT}`);
});

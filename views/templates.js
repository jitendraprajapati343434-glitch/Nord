// views/templates.js
// Plain template-literal "views". No templating engine dependency needed.

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function layout({ title = 'Nord', body, currentUser }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/public/css/style.css">
<link rel="manifest" href="/public/manifest.json">
<link rel="icon" href="/public/icons/icon-192.png">
<meta name="theme-color" content="#0095f6">
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/public/sw.js'));
}
</script>
</head>
<body>
<header class="topbar">
  <a href="/" class="brand">Nord</a>
  ${currentUser ? `
  <nav>
    <a href="/">Feed</a>
    <a href="/upload">New Post</a>
    <a href="/profile/${currentUser.id}">${escapeHtml(currentUser.username)}</a>
    <form action="/logout" method="POST" class="inline-form"><button class="link-btn">Logout</button></form>
  </nav>` : `
  <nav>
    <a href="/login">Login</a>
    <a href="/register">Sign up</a>
  </nav>`}
</header>
<main class="container">
${body}
</main>
</body>
</html>`;
}

function authForm({ mode, error }) {
  const isLogin = mode === 'login';
  return `
  <div class="auth-box">
    <h1>${isLogin ? 'Log in to Nord' : 'Create your Nord account'}</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST" action="/${isLogin ? 'login' : 'register'}">
      <input type="text" name="username" placeholder="Username" required minlength="3" maxlength="20" autofocus>
      <input type="password" name="password" placeholder="Password" required minlength="4">
      <button type="submit">${isLogin ? 'Log in' : 'Sign up'}</button>
    </form>
    <p class="switch">
      ${isLogin
        ? `Don't have an account? <a href="/register">Sign up</a>`
        : `Already have an account? <a href="/login">Log in</a>`}
    </p>
  </div>`;
}

function postCard(post) {
  return `
  <article class="post" id="post-${post.id}">
    <div class="post-header">
      <a href="/profile/${post.author.id}" class="post-author">${escapeHtml(post.author.username)}</a>
      <span class="post-time">${timeAgo(post.createdAt)}</span>
    </div>
    <img class="post-image" src="/uploads/${post.imagePath}" alt="post image" loading="lazy">
    <div class="post-actions">
      <form action="/like/${post.id}" method="POST" class="inline-form">
        <button class="like-btn ${post.likedByMe ? 'liked' : ''}">
          ${post.likedByMe ? '♥' : '♡'} ${post.likeCount}
        </button>
      </form>
    </div>
    ${post.caption ? `<p class="post-caption"><a href="/profile/${post.author.id}">${escapeHtml(post.author.username)}</a> ${escapeHtml(post.caption)}</p>` : ''}
    <div class="comments">
      ${post.comments.map((c) => `<p class="comment"><a href="/profile/${c.author.id}">${escapeHtml(c.author.username)}</a> ${escapeHtml(c.text)}</p>`).join('')}
    </div>
    <form action="/comment/${post.id}" method="POST" class="comment-form">
      <input type="text" name="text" placeholder="Add a comment..." maxlength="300" required>
      <button type="submit">Post</button>
    </form>
  </article>`;
}

function feedPage(posts) {
  if (posts.length === 0) {
    return `<p class="empty-state">No posts yet. <a href="/upload">Be the first to post</a>.</p>`;
  }
  return posts.map(postCard).join('\n');
}

function uploadPage({ error } = {}) {
  return `
  <div class="upload-box">
    <h1>New post</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required>
      <textarea name="caption" placeholder="Write a caption..." maxlength="500"></textarea>
      <button type="submit">Share</button>
    </form>
  </div>`;
}

function profilePage({ profileUser, posts, currentUser }) {
  return `
  <div class="profile-header">
    <div class="avatar-placeholder">${escapeHtml(profileUser.username[0].toUpperCase())}</div>
    <div>
      <h1>${escapeHtml(profileUser.username)}</h1>
      <p class="profile-stats">${posts.length} post${posts.length === 1 ? '' : 's'}</p>
      ${profileUser.bio ? `<p class="bio">${escapeHtml(profileUser.bio)}</p>` : ''}
    </div>
  </div>
  <div class="grid">
    ${posts.length === 0
      ? `<p class="empty-state">No posts yet.</p>`
      : posts.map((p) => `<a class="grid-item" href="/#post-${p.id}"><img src="/uploads/${p.imagePath}" alt=""></a>`).join('')}
  </div>`;
}

module.exports = { layout, authForm, feedPage, postCard, uploadPage, profilePage };

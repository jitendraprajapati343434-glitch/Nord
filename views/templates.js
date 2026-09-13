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

const ICON = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>`,
  heartOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  heartFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

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
<meta name="theme-color" content="#ffffff">
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
  <div class="header-icons">
    <a href="#" class="icon-btn" aria-label="Activity">${ICON.heartOutline}</a>
    <form action="/logout" method="POST" class="inline-form">
      <button class="icon-btn" aria-label="Logout">${ICON.logout}</button>
    </form>
  </div>` : ''}
</header>
<main class="container">
${body}
</main>
${currentUser ? `
<nav class="bottom-nav">
  <a href="/" class="nav-icon" aria-label="Home">${ICON.home}</a>
  <a href="/search" class="nav-icon" aria-label="Search">${ICON.search}</a>
  <a href="/upload" class="nav-icon" aria-label="New post">${ICON.plus}</a>
  <a href="/profile/${currentUser.id}" class="nav-icon" aria-label="Profile">${ICON.user}</a>
</nav>` : ''}
</body>
</html>`;
}

function authForm({ mode, error }) {
  const isLogin = mode === 'login';
  return `
  <div class="auth-box">
    <h1 class="auth-logo">Nord</h1>
    <p class="auth-sub">${isLogin ? 'Welcome back.' : 'Sign up to see photos from your friends.'}</p>
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
      <div class="post-header-left">
        <div class="avatar-ring"><span>${escapeHtml(post.author.username[0].toUpperCase())}</span></div>
        <a href="/profile/${post.author.id}" class="post-author">${escapeHtml(post.author.username)}</a>
      </div>
      <span class="post-time">${timeAgo(post.createdAt)}</span>
    </div>
    <img class="post-image" src="/uploads/${post.imagePath}" alt="post image" loading="lazy">
    <div class="post-actions-row">
      <div class="action-icons-left">
        <form action="/like/${post.id}" method="POST" class="inline-form">
          <button class="icon-btn ${post.likedByMe ? 'liked' : ''}" aria-label="Like">
            ${post.likedByMe ? ICON.heartFilled : ICON.heartOutline}
          </button>
        </form>
        <a href="#comment-${post.id}" class="icon-btn" aria-label="Comment">${ICON.comment}</a>
        <a href="#" class="icon-btn" aria-label="Share">${ICON.send}</a>
      </div>
      <a href="#" class="icon-btn" aria-label="Save">${ICON.bookmark}</a>
    </div>
    ${post.likeCount > 0 ? `<p class="like-count">${post.likeCount} like${post.likeCount === 1 ? '' : 's'}</p>` : ''}
    ${post.caption ? `<p class="post-caption"><a href="/profile/${post.author.id}">${escapeHtml(post.author.username)}</a> ${escapeHtml(post.caption)}</p>` : ''}
    <div class="comments">
      ${post.comments.map((c) => `<p class="comment"><a href="/profile/${c.author.id}">${escapeHtml(c.author.username)}</a> ${escapeHtml(c.text)}</p>`).join('')}
    </div>
    <form action="/comment/${post.id}" method="POST" class="comment-form" id="comment-${post.id}">
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
    <div class="upload-icon">${ICON.plus}</div>
    <h1>Create new post</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST" action="/upload" enctype="multipart/form-data" id="uploadForm">
      <input type="file" name="image" id="photoInput" accept="image/*" required style="display:none">
      <img id="photoPreview" class="photo-preview" style="display:none" alt="preview">
      <div class="photo-picker-buttons" id="pickerButtons">
        <button type="button" class="picker-btn" id="cameraBtn">${ICON.camera}<span>Camera</span></button>
        <button type="button" class="picker-btn" id="galleryBtn">${ICON.image}<span>Gallery</span></button>
      </div>
      <p class="file-chosen" id="fileChosenText"></p>
      <textarea name="caption" placeholder="Write a caption..." maxlength="500"></textarea>
      <button type="submit">Share</button>
    </form>
    <script>
      (function () {
        var input = document.getElementById('photoInput');
        var cameraBtn = document.getElementById('cameraBtn');
        var galleryBtn = document.getElementById('galleryBtn');
        var chosenText = document.getElementById('fileChosenText');
        var preview = document.getElementById('photoPreview');

        cameraBtn.addEventListener('click', function () {
          input.setAttribute('capture', 'environment');
          input.click();
        });
        galleryBtn.addEventListener('click', function () {
          input.removeAttribute('capture');
          input.click();
        });
        input.addEventListener('change', function () {
          if (input.files && input.files[0]) {
            chosenText.textContent = input.files[0].name;
            var reader = new FileReader();
            reader.onload = function (e) {
              preview.src = e.target.result;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
          }
        });
      })();
    </script>
  </div>`;
}

function profilePage({ profileUser, posts, currentUser }) {
  return `
  <div class="profile-header">
    <div class="avatar-placeholder">${escapeHtml(profileUser.username[0].toUpperCase())}</div>
    <div>
      <h1>${escapeHtml(profileUser.username)}</h1>
      <p class="profile-stats"><strong>${posts.length}</strong> post${posts.length === 1 ? '' : 's'}</p>
      ${profileUser.bio ? `<p class="bio">${escapeHtml(profileUser.bio)}</p>` : ''}
    </div>
  </div>
  <div class="grid">
    ${posts.length === 0
      ? `<p class="empty-state">No posts yet.</p>`
      : posts.map((p) => `<a class="grid-item" href="/#post-${p.id}"><img src="/uploads/${p.imagePath}" alt=""></a>`).join('')}
  </div>`;
}

function storyBar({ storyAuthors, currentUser }) {
  const others = storyAuthors.filter((a) => a.author.id !== currentUser.id);
  const ownHasStory = storyAuthors.some((a) => a.author.id === currentUser.id);
  return `
  <div class="story-bar">
    <a href="${ownHasStory ? '/story/user/' + currentUser.id : '/story/new'}" class="story-item">
      <div class="story-avatar own-avatar">
        <span>${escapeHtml(currentUser.username[0].toUpperCase())}</span>
        ${!ownHasStory ? '<span class="add-story-badge">+</span>' : ''}
      </div>
      <span class="story-label">Your story</span>
    </a>
    ${others.map((a) => `
    <a href="/story/user/${a.author.id}" class="story-item">
      <div class="story-avatar">
        <span>${escapeHtml(a.author.username[0].toUpperCase())}</span>
      </div>
      <span class="story-label">${escapeHtml(a.author.username)}</span>
    </a>`).join('')}
  </div>`;
}

function storyUploadPage({ error } = {}) {
  return `
  <div class="upload-box">
    <div class="upload-icon">${ICON.camera}</div>
    <h1>Add to your story</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form method="POST" action="/story/new" enctype="multipart/form-data" id="storyForm">
      <input type="file" name="image" id="storyPhotoInput" accept="image/*" required style="display:none">
      <img id="storyPhotoPreview" class="photo-preview" style="display:none" alt="preview">
      <div class="photo-picker-buttons">
        <button type="button" class="picker-btn" id="storyCameraBtn">${ICON.camera}<span>Camera</span></button>
        <button type="button" class="picker-btn" id="storyGalleryBtn">${ICON.image}<span>Gallery</span></button>
      </div>
      <p class="file-chosen" id="storyFileChosenText"></p>
      <button type="submit">Share to story</button>
    </form>
    <p class="switch"><a href="/">Cancel</a></p>
    <script>
      (function () {
        var input = document.getElementById('storyPhotoInput');
        var cameraBtn = document.getElementById('storyCameraBtn');
        var galleryBtn = document.getElementById('storyGalleryBtn');
        var chosenText = document.getElementById('storyFileChosenText');
        var preview = document.getElementById('storyPhotoPreview');
        cameraBtn.addEventListener('click', function () {
          input.setAttribute('capture', 'environment');
          input.click();
        });
        galleryBtn.addEventListener('click', function () {
          input.removeAttribute('capture');
          input.click();
        });
        input.addEventListener('change', function () {
          if (input.files && input.files[0]) {
            chosenText.textContent = input.files[0].name;
            var reader = new FileReader();
            reader.onload = function (e) {
              preview.src = e.target.result;
              preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
          }
        });
      })();
    </script>
  </div>`;
}

function storyViewerPage({ author, stories }) {
  if (stories.length === 0) {
    return `<p class="empty-state">This story has expired.</p>`;
  }
  return `
  <div class="story-viewer">
    <div class="story-viewer-header">
      <div class="story-viewer-author">
        <div class="story-avatar small"><span>${escapeHtml(author.username[0].toUpperCase())}</span></div>
        <span>${escapeHtml(author.username)}</span>
      </div>
      <a href="/" class="icon-btn" aria-label="Close">${ICON.x}</a>
    </div>
    <div class="story-viewer-images">
      ${stories.map((s) => `<img src="/uploads/${s.imagePath}" class="story-viewer-image" alt="story">`).join('')}
    </div>
  </div>`;
}

function searchPage({ query, results }) {
  return `
  <div class="search-page">
    <form method="GET" action="/search" class="search-form">
      <div class="search-input-wrap">
        ${ICON.search}
        <input type="text" name="q" value="${escapeHtml(query)}" placeholder="Search" autocomplete="off" autofocus id="searchInput">
      </div>
    </form>
    <div class="search-results">
      ${!query ? `<p class="empty-state">Search for people by username.</p>` : ''}
      ${query && results.length === 0 ? `<p class="empty-state">No users found for "${escapeHtml(query)}".</p>` : ''}
      ${results.map((u) => `
      <a href="/profile/${u.id}" class="search-result">
        <div class="avatar-ring"><span>${escapeHtml(u.username[0].toUpperCase())}</span></div>
        <span class="search-result-name">${escapeHtml(u.username)}</span>
      </a>`).join('')}
    </div>
    <script>
      (function () {
        var input = document.getElementById('searchInput');
        var form = input.closest('form');
        var timer;
        input.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () { form.submit(); }, 450);
        });
      })();
    </script>
  </div>`;
}

module.exports = {
  layout, authForm, feedPage, postCard, uploadPage, profilePage,
  storyBar, storyUploadPage, storyViewerPage, searchPage,
};

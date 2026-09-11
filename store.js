// lib/store.js
// Tiny JSON-file "database". Good enough for a prototype; swap for
// SQLite/Postgres later (see README "What to extend").

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'db');
const FILES = {
  users: path.join(DB_DIR, 'users.json'),
  posts: path.join(DB_DIR, 'posts.json'),
  likes: path.join(DB_DIR, 'likes.json'),
  comments: path.join(DB_DIR, 'comments.json'),
};

function ensureFile(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
}
// Create db/ itself first — on a fresh clone/deploy this directory
// won't exist yet, so writing straight to a file inside it would fail.
fs.mkdirSync(DB_DIR, { recursive: true });
Object.values(FILES).forEach(ensureFile);

function load(name) {
  return JSON.parse(fs.readFileSync(FILES[name], 'utf8'));
}
function save(name, data) {
  fs.writeFileSync(FILES[name], JSON.stringify(data, null, 2));
}
function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

// ---------- Users ----------
function findUserByUsername(username) {
  return load('users').find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}
function findUserById(id) {
  return load('users').find((u) => u.id === Number(id));
}
function createUser({ username, passwordHash, salt, bio = '' }) {
  const users = load('users');
  const user = {
    id: nextId(users),
    username,
    passwordHash,
    salt,
    bio,
    createdAt: Date.now(),
  };
  users.push(user);
  save('users', users);
  return user;
}

// ---------- Posts ----------
function createPost({ userId, imagePath, caption }) {
  const posts = load('posts');
  const post = {
    id: nextId(posts),
    userId,
    imagePath,
    caption,
    createdAt: Date.now(),
  };
  posts.push(post);
  save('posts', posts);
  return post;
}
function allPostsWithMeta(currentUserId) {
  const posts = load('posts').sort((a, b) => b.createdAt - a.createdAt);
  const users = load('users');
  const likes = load('likes');
  const comments = load('comments');
  return posts.map((p) => enrichPost(p, users, likes, comments, currentUserId));
}
function postsByUser(userId, currentUserId) {
  const posts = load('posts')
    .filter((p) => p.userId === Number(userId))
    .sort((a, b) => b.createdAt - a.createdAt);
  const users = load('users');
  const likes = load('likes');
  const comments = load('comments');
  return posts.map((p) => enrichPost(p, users, likes, comments, currentUserId));
}
function findPostById(id) {
  return load('posts').find((p) => p.id === Number(id));
}
function enrichPost(post, users, likes, comments, currentUserId) {
  const author = users.find((u) => u.id === post.userId);
  const postLikes = likes.filter((l) => l.postId === post.id);
  const postComments = comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c) => ({
      ...c,
      author: users.find((u) => u.id === c.userId),
    }));
  return {
    ...post,
    author,
    likeCount: postLikes.length,
    likedByMe: postLikes.some((l) => l.userId === Number(currentUserId)),
    comments: postComments,
  };
}

// ---------- Likes ----------
function toggleLike(postId, userId) {
  const likes = load('likes');
  const idx = likes.findIndex(
    (l) => l.postId === Number(postId) && l.userId === Number(userId)
  );
  if (idx >= 0) {
    likes.splice(idx, 1);
    save('likes', likes);
    return false; // now unliked
  } else {
    likes.push({ postId: Number(postId), userId: Number(userId) });
    save('likes', likes);
    return true; // now liked
  }
}

// ---------- Comments ----------
function addComment(postId, userId, text) {
  const comments = load('comments');
  const comment = {
    id: nextId(comments),
    postId: Number(postId),
    userId: Number(userId),
    text,
    createdAt: Date.now(),
  };
  comments.push(comment);
  save('comments', comments);
  return comment;
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  createPost,
  allPostsWithMeta,
  postsByUser,
  findPostById,
  toggleLike,
  addComment,
};

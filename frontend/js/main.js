// Capture token from URL after OAuth callback
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
if (tokenFromUrl) {
  Auth.setToken(tokenFromUrl);
  history.replaceState({}, document.title, '/');
}

// Redirect to login if not authenticated
if (!Auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Load and display player profile
async function loadProfile() {
  const response = await Auth.fetchWithAuth(`${Auth.getBackendUrl()}/api/players/me`);
  if (!response) return;

  const player = await response.json();

  const header = document.getElementById('game-header');
  const avatarHtml = player.avatar_url
    ? `<img src="${player.avatar_url}" alt="avatar" class="player-avatar" />`
    : `<div class="player-avatar player-initials">${player.name.charAt(0).toUpperCase()}</div>`;

  header.innerHTML = `
    <h1 class="game-title">Hexagon</h1>
    <div class="player-info">
      ${avatarHtml}
      <span class="player-name">${player.name}</span>
      <button class="btn-logout" onclick="Auth.logout()">Sair</button>
    </div>
  `;
}

loadProfile();

console.log('Hexagon initialized');

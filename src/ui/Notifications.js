/**
 * Notifications.js — Toast notification system
 */

const ICONS = {
  info:    'info',
  success: 'check_circle',
  warning: 'warning',
  error:   'error',
};

export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="material-icons-round">${ICONS[type] || ICONS.info}</span>
    ${message}
  `;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('exit');
    toast.addEventListener('animationend', () => toast.remove());
  };
  setTimeout(remove, duration);
  toast.addEventListener('click', remove);
}

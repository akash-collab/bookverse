document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const body = document.body;

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggleBtn.textContent = '☀️ Light Mode';
  }

  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    const isDark = body.classList.contains('dark-mode');
    toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});
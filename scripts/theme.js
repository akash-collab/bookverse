// theme.js
const toggleBtn = document.getElementById("theme-toggle-btn");

// scripts/theme.js
function applyTheme(theme) {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle-btn");

  if (theme === "dark") {
    body.classList.add("dark-mode");
    toggleBtn && (toggleBtn.textContent = "☀️ Light Mode");
  } else {
    body.classList.remove("dark-mode");
    toggleBtn && (toggleBtn.textContent = "🌙 Dark Mode");
  }
  localStorage.setItem("theme", theme);
}

// On load: read theme from storage
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }
});
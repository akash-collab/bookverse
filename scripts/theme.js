document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle-btn");

  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    body.classList.add("dark-mode");
    if (toggleBtn) toggleBtn.textContent = "☀️ Light Mode";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const isDark = body.classList.contains("dark-mode");
      toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
});
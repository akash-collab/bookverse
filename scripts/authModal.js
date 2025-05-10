document.addEventListener("DOMContentLoaded", () => {
    const loginModal = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const loginBtn = document.getElementById("loginBtn");
    const switchToRegister = document.getElementById("switch-to-register");
    const switchToLogin = document.getElementById("switch-to-login");

  
    registerModal.classList.remove("modal-hidden");

  
    loginBtn.addEventListener("click", () => {
        loginModal.classList.remove("modal-hidden");
        registerModal.classList.add("modal-hidden");
    });


    switchToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.classList.add("modal-hidden");
        registerModal.classList.remove("modal-hidden");
    });


    switchToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        registerModal.classList.add("modal-hidden");
        loginModal.classList.remove("modal-hidden");
    });


    document.getElementById("close-login-modal").addEventListener("click", () => {
        loginModal.classList.add("modal-hidden");
    });
    document.getElementById("close-register-modal").addEventListener("click", () => {
        registerModal.classList.add("modal-hidden");
    });


    document.addEventListener("show-login-modal", () => {
        loginModal.classList.remove("modal-hidden");
        registerModal.classList.add("modal-hidden");
    });

document.addEventListener("show-register-modal", () => {
    loginModal.classList.add("modal-hidden");
    registerModal.classList.remove("modal-hidden");
});
});
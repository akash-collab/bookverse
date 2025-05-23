import { auth } from "../firebase/config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db } from "../firebase/config.js";
import { collection, addDoc, getDocs, serverTimestamp, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const userInfo = document.getElementById("user-info");
    const userEmail = document.getElementById("user-email");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginBtn = document.getElementById("loginBtn");
    const modal = document.getElementById("auth-modal");
    const suggestionSection = document.getElementById("suggestion-section");
    const registerMessage = document.createElement("p");
    registerMessage.className = "form-message";
    registerForm.appendChild(registerMessage);
    const uploadForm = document.getElementById("upload-book-form");
    const uploadMessage = document.getElementById("upload-message");
    const uploadSection = document.getElementById("upload-book-section");
    const loginMessage = document.createElement("p");
    loginMessage.className = "form-message";
    loginForm.appendChild(loginMessage);

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const name = document.getElementById("register-name").value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                name,
                email,
                createdAt: serverTimestamp()
            });
            registerMessage.textContent = "Registered successfully. Redirecting to login...";
            registerMessage.style.color = "green";

            setTimeout(() => {
                registerForm.reset();
                registerMessage.textContent = "";
                const showLoginEvent = new Event("show-login-modal");
                document.dispatchEvent(showLoginEvent);
            }, 1500);
        } catch (error) {
            registerMessage.textContent = "Registration failed: " + error.message;
            registerMessage.style.color = "red";
        }
    });


    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginForm.reset();
            loginMessage.textContent = "";

            document.getElementById("login-modal").classList.add("modal-hidden");
        } catch (error) {
            loginMessage.textContent = "Login failed: " + error.message;
            loginMessage.style.color = "red";
        }
    });

    async function fetchAndRenderBooks() {
        const querySnapshot = await getDocs(collection(db, "bookSuggestions"));
        suggestionSection.innerHTML = "<h2>Book Suggestions</h2>";
        const books = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            books.push({
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0)
            });
        });
        books.sort((a, b) => b.timestamp - a.timestamp);
        books.forEach((book) => {
            const bookDiv = document.createElement("div");
            bookDiv.className = "book-card";
            bookDiv.innerHTML = `
            <h3>${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-description">${book.description}</p>
        `;
            suggestionSection.appendChild(bookDiv);
        });
    }

    onAuthStateChanged(auth, (user) => {
        const loadingScreen = document.getElementById("loading-screen");
        const loginModal = document.getElementById("login-modal");
        const registerModal = document.getElementById("register-modal");

        if (user) {

            userEmail.textContent = user.email;
            userInfo.classList.remove("hidden");
            loginBtn.classList.add("modal-hidden");

            uploadSection.classList.remove("hidden");

            if (loginModal) loginModal.classList.add("modal-hidden");
            if (registerModal) registerModal.classList.add("modal-hidden");
        } else {

            const showRegisterEvent = new Event("show-register-modal");
            document.dispatchEvent(showRegisterEvent);

            userInfo.classList.add("hidden");
            loginBtn.classList.remove("hidden");
            userEmail.textContent = "";
            suggestionSection.classList.add("hidden");
            uploadSection.classList.add("hidden");
        }

        if (loadingScreen) loadingScreen.style.display = "none";
    });
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);

            loginForm.reset();
            registerForm.reset();


            const showLoginEvent = new Event("show-login-modal");
            document.dispatchEvent(showLoginEvent);
        } catch (error) {
            console.log("Logout error:", error.message);
        }
    });

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("book-title").value;
        const author = document.getElementById("book-author").value;
        const description = document.getElementById("book-description").value;
        const genre = document.getElementById("bookGenre").value;
        try {
            await addDoc(collection(db, "bookSuggestions"), {
                title,
                author,
                description,
                genre,
                timestamp: serverTimestamp(),
                votes: 0,
                voters: [],
                userId: auth.currentUser.uid,
                username: auth.currentUser.displayName || auth.currentUser.email
            });
            uploadMessage.textContent = "Book Suggested Successfully!";
            uploadMessage.style.color = "green";
            uploadForm.reset();
        } catch (error) {
            uploadMessage.textContent = "Error: " + error.message;
            uploadMessage.style.color = "red";
        }
    });
});
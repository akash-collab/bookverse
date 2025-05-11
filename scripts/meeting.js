import { auth, db } from '../firebase/config.js';
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-bookverse-meeting-btn");
  const overlay = document.getElementById("bookverse-meeting-overlay");
  const form = document.getElementById("bookverse-meeting-form");
  const list = document.getElementById("bookverse-meeting-list");

  let currentUser = null;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) loadMeetings(user.uid);
  });

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      overlay.classList.add("active");
      document.body.classList.add("modal-open");
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("bookverse-meeting-title").value.trim();
    const datetime = document.getElementById("bookverse-meeting-datetime").value;
    const link = document.getElementById("bookverse-meeting-link").value.trim();

    if (!currentUser) return alert("You must be logged in to schedule meetings.");

    try {
      await addDoc(collection(db, "bookverseMeetings"), {
        uid: currentUser.uid,
        title,
        datetime,
        link,
        createdAt: new Date(),
        createdByName: currentUser.displayName || "Unknown User"
      });

      form.reset();
      overlay.classList.remove("active");
      document.body.classList.remove("modal-open");
    } catch (error) {
      console.error("Error saving meeting:", error);
    }
  });

  function loadMeetings(uid) {
    const q = query(
      collection(db, "bookverseMeetings"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      list.innerHTML = "";

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.uid === uid) {
          const item = document.createElement("div");
          item.innerHTML = `
            <strong>${data.title}</strong><br>
            ${new Date(data.datetime).toLocaleString()}<br>
            <a href="${data.link}" target="_blank">${data.link}</a>`;
          list.appendChild(item);
        }
      });
    });
  }
});
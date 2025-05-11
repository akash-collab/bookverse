import { db, auth } from "../firebase/config.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// DOM elements
const discussionForm = document.getElementById("discussion-form");
const bookDropdown = document.getElementById("discussion-book");
const message = document.getElementById("discussion-message");
const discussionBtn = document.getElementById("discussionBtn");
const discussionSection = document.getElementById("discussion-section");
const threadView = document.getElementById("thread-view");
const threadTitle = document.getElementById("thread-title");
const threadComments = document.getElementById("thread-comments");
const commentForm = document.getElementById("comment-form");

let currentThreadId = null;
let quill = null;

// Show Discussion Section
discussionBtn.addEventListener("click", () => {
  discussionSection.classList.remove("hidden");
  document.getElementById("upload-book-section").classList.add("hidden");
  document.getElementById("suggestion-section").classList.add("hidden");
});

// Load books into dropdown
async function loadBooksForDiscussion() {
  const snapshot = await getDocs(collection(db, "bookSuggestions"));
  snapshot.forEach(doc => {
    const book = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = book.title;
    bookDropdown.appendChild(option);
  });
}

loadBooksForDiscussion();

// Create new discussion
discussionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("discussion-title").value.trim();
  const bookId = bookDropdown.value;
  const user = auth.currentUser;

  if (!user || !bookId || !title) return;

  try {
    await addDoc(collection(db, "discussions"), {
      bookId,
      title,
      createdAt: serverTimestamp(),
      createdBy: {
        userId: user.uid,
        username: user.email
      }
    });
    message.textContent = "Discussion created!";
    message.style.color = "green";
    discussionForm.reset();
    await renderDiscussions();
  } catch (err) {
    message.textContent = "Error creating discussion.";
    message.style.color = "red";
  }
});

// Render discussions
async function renderDiscussions() {
  const list = document.getElementById("discussion-list");
  list.innerHTML = "";

  const discussionQuery = query(
    collection(db, "discussions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(discussionQuery);
  for (const docSnap of snapshot.docs) {
    const discussion = docSnap.data();
    const bookRef = doc(db, "bookSuggestions", discussion.bookId);
    const bookSnap = await getDoc(bookRef);
    const bookTitle = bookSnap.exists() ? bookSnap.data().title : "Unknown Book";

    const card = document.createElement("div");
    card.className = "discussion-card";
    card.innerHTML = `
      <h3>${discussion.title}</h3>
      <p><strong>Book:</strong> ${bookTitle}</p>
      <p><strong>By:</strong> ${discussion.createdBy.username}</p>
      <button class="view-thread-btn" data-id="${docSnap.id}">View Thread</button>
    `;
    list.appendChild(card);
  }
}
document.getElementById("discussion-section").classList.remove("hidden");
// Initialize Quill only once
function initializeQuill() {
  if (typeof window.Quill === 'undefined') {
    console.error('Quill library not loaded!');
    return;
  }

  if (!quill) {
    quill = new window.Quill("#quill-editor", {
      theme: "snow",
      placeholder: "Write a comment...",
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['clean']
        ]
      }
    });
  }
}

// Load comments and listen to updates
function loadComments(discussionId) {
  const commentsRef = collection(db, "discussions", discussionId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    threadComments.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.innerHTML = `<strong>${data.user}</strong>: ${data.text}`;
      threadComments.appendChild(commentDiv);
    });
  });
}

// Handle comment submission
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user || !currentThreadId || !quill) return;

  try {
    await addDoc(collection(db, "discussions", currentThreadId, "comments"), {
      user: user.displayName || user.email,
      text: quill.root.innerHTML,
      createdAt: serverTimestamp()
    });
    quill.setContents([]);
  } catch (error) {
    console.error("Error posting comment:", error);
  }
});

// Handle View Thread button
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-thread-btn")) {
    const discussionId = e.target.dataset.id;
    currentThreadId = discussionId;

    try {
      const docSnap = await getDoc(doc(db, "discussions", discussionId));
      const data = docSnap.data();
      threadTitle.textContent = `Discussion: ${data.title}`;
      threadView.classList.remove("hidden");

      initializeQuill();
      loadComments(discussionId);
    } catch (err) {
      console.error("Failed to load discussion thread:", err);
    }
  }
});

renderDiscussions();
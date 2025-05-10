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
  onSnapshot,
  limit
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const discussionForm = document.getElementById("discussion-form");
const bookDropdown = document.getElementById("discussion-book");
const message = document.getElementById("discussion-message");

const discussionBtn = document.getElementById("discussionBtn");
const discussionSection = document.getElementById("discussion-section");

discussionBtn.addEventListener("click", () => {
  discussionSection.classList.remove("hidden");

  document.getElementById("upload-book-section").classList.add("hidden");
  document.getElementById("suggestion-section").classList.add("hidden");
});

// Fetch books and populate dropdown
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

// Handle discussion creation
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

// Render discussions with pagination
let lastVisible = null;
let discussionsPerPage = 5; // You can change this to load more or fewer discussions at a time

async function renderDiscussions() {
  const list = document.getElementById("discussion-list");
  list.innerHTML = "";

  let discussionQuery = collection(db, "discussions");
  if (lastVisible) {
    discussionQuery = query(discussionQuery, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(discussionsPerPage));
  } else {
    discussionQuery = query(discussionQuery, orderBy("createdAt", "desc"), limit(discussionsPerPage));
  }

  const snapshot = await getDocs(discussionQuery);
  for (const docSnap of snapshot.docs) {
    const discussion = docSnap.data();
    const bookRef = doc(db, "bookSuggestions", discussion.bookId);
    
    // Make sure to await the book snapshot asynchronously
    const bookSnap = await getDoc(bookRef);  // Awaiting this here
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

  if (snapshot.docs.length > 0) {
    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.textContent = "Load More Discussions";
    loadMoreBtn.addEventListener("click", renderDiscussions);
    list.appendChild(loadMoreBtn);
  }
}

// Initialize Quill for rich text editor
let quill;
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#quill-editor", {
    theme: "snow",
    placeholder: "Write a comment...",
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
      ]
    }
  });
});

const toolbarButtons = document.querySelectorAll('.ql-toolbar button');

toolbarButtons.forEach(button => {
  button.addEventListener('click', () => {
    toolbarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

const threadView = document.getElementById("thread-view");
const threadTitle = document.getElementById("thread-title");
const threadComments = document.getElementById("thread-comments");
const commentForm = document.getElementById("comment-form");
const commentText = document.getElementById("comment-text");

let currentThreadId = null;

// Attach click handlers to all "View Thread" buttons
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-thread-btn")) {
    const discussionId = e.target.dataset.id;
    currentThreadId = discussionId;
    const docSnap = await getDoc(doc(db, "discussions", discussionId));
    const data = docSnap.data();
    threadTitle.textContent = `Discussion: ${data.title}`;
    threadView.classList.remove("hidden");
    loadComments(discussionId);
  }
});

// Load and render comments in real-time
function loadComments(discussionId) {
  const commentsRef = collection(db, "discussions", discussionId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    threadComments.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.innerHTML = `
        <strong>${data.user}</strong>: ${data.text}
      `;
      threadComments.appendChild(commentDiv);
    });
  });
}

// Handle comment submission
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user || !currentThreadId) return;

  await addDoc(collection(db, "discussions", currentThreadId, "comments"), {
    user: user.displayName || "Anonymous",
    text: quill.root.innerHTML,
    createdAt: serverTimestamp()
  });

  quill.setContents([]);
});

renderDiscussions();
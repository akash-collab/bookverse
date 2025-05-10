import { db } from '../firebase/config.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const calculateAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length || 0;

async function loadDashboardData() {
  const discussionsRef = collection(db, 'discussions');
  const snapshot = await getDocs(discussionsRef);

  const bookTitles = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    const title = data.title || "Untitled";
    bookTitles.add(title);
  });

  const keyPointsList = document.getElementById('monthly-key-points');
  keyPointsList.innerHTML = '';

  [...bookTitles].forEach(title => {
    const li = document.createElement('li');
    li.textContent = `Discussions on "${title}"`;
    keyPointsList.appendChild(li);
  });
}
loadDashboardData();


const openBtn = document.getElementById("open-monthly-recap-btn");
const modal = document.getElementById("monthly-recap-modal");
const closeBtn = document.getElementById("close-monthly-recap-btn");

openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  loadDashboardData();
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});
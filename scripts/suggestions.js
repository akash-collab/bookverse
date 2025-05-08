import { db, auth } from "../firebase/config.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const suggestionList = document.getElementById("suggestion-list");
const voteChartSection = document.getElementById("vote-chart-section");
const voteChartCanvas = document.getElementById("voteChart");

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderSuggestions(user.uid);
  }
});

function renderSuggestions(userId) {
  const q = query(collection(db, "bookSuggestions"), orderBy("votes", "desc"));

  onSnapshot(q, (snapshot) => {
    suggestionList.innerHTML = "";
    const chartLabels = [];
const chartData = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const bookId = docSnap.id;
      const hasVoted = data.voters?.includes(userId);
      chartLabels.push(data.title);
chartData.push(data.votes || 0);

      const suggestion = document.createElement("div");
      suggestion.classList.add("book-suggestion");

      suggestion.innerHTML = `
        <h3>${data.title}</h3>
        <p>by ${data.author}</p>
        <p>${data.description}</p>
        <p><strong>Votes:</strong> <span class="vote-count">${data.votes || 0}</span></p>
        <button class="vote-btn" data-id="${bookId}" ${hasVoted ? 'disabled' : ''}>
          ${hasVoted ? "Voted" : "Upvote"}
        </button>
      `;

      suggestionList.appendChild(suggestion);
    });
    attachVoteListeners();
    updateChart(chartLabels, chartData);
  });
}

function attachVoteListeners() {
  const voteButtons = document.querySelectorAll(".vote-btn");

  voteButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const bookId = button.getAttribute("data-id");
      const user = auth.currentUser;
      if (!user) return;

      const bookRef = doc(db, "bookSuggestions", bookId);
      const bookSnap = await getDoc(bookRef);
      const bookData = bookSnap.data();

      if (bookData.voters?.includes(user.uid)) return;

      const voteCountElement = button.parentElement.querySelector(".vote-count");
      const newVoteCount = (bookData.votes || 0) + 1;
      voteCountElement.textContent = newVoteCount;
      button.disabled = true;
      button.innerText = "Voted";

      await updateDoc(bookRef, {
        votes: newVoteCount,
        voters: arrayUnion(user.uid)
      });
    });
  });
}
let voteChart; // global chart instance

function updateChart(labels, data) {
  if (!voteChart) {
    voteChart = new Chart(voteChartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Votes',
          data,
          backgroundColor: '#19747E'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  } else {
    voteChart.data.labels = labels;
    voteChart.data.datasets[0].data = data;
    voteChart.update();
  }

  voteChartSection.classList.remove('hidden');
}
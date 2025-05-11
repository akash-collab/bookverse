import { db } from '../firebase/config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const openBtn = document.getElementById("open-upcoming-meetings-btn");
const closeBtn = document.getElementById("close-meeting-modal-btn");
const modal = document.getElementById("meeting-schedule-modal");
const listContainer = document.getElementById("meeting-list-container");

// Show modal
openBtn.addEventListener("click", async () => {
    modal.style.display = "flex";
    await renderMeetings();
});

// Close modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Render meetings in modal
async function renderMeetings() {
    listContainer.innerHTML = ""; // Clear previous

    try {
        const querySnapshot = await getDocs(collection(db, "bookverseMeetings"));
        querySnapshot.forEach((doc) => {
            const meeting = doc.data();
            const div = document.createElement("div");
            div.className = "meeting-item";
            div.innerHTML = `
                <h3>${meeting.title}</h3>
                <p><strong>Date:</strong> ${new Date(meeting.datetime).toLocaleString()}</p>
                <p class="scheduled-by"><strong>Scheduled by:</strong> ${meeting.createdBy || 'Unknown'}</p>
                <a href="${meeting.link}" target="_blank" class="btn accept-btn">Join Meeting</a>
            `;
            listContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Error fetching meetings: ", error);
    }
}
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
// // scripts/reading.js
// import { db, auth } from '../firebase/config.js';
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   query,
//   where
// } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('progress-form');
//   const list = document.getElementById('reading-list');
//   const message = document.getElementById('progress-message');
//   const trackProgressButton = document.getElementById('track-progress'); // Targeting the button

//   auth.onAuthStateChanged(user => {
//     if (!user) {
//       message.textContent = 'Please login to track reading progress.';
//       form.style.display = 'none';
//       return;
//     }

//     const userId = user.uid;

//     // Check if the button is available before attaching the event listener
//     if (trackProgressButton) {
//       trackProgressButton.addEventListener('click', async (e) => {
//         e.preventDefault();

//         const bookName = document.getElementById('book-name').value.trim();
//         const totalPages = parseInt(document.getElementById('total-pages').value);
//         const pagesRead = parseInt(document.getElementById('pages-read').value);

//         if (!bookName || isNaN(totalPages) || isNaN(pagesRead)) {
//           message.textContent = 'All fields are required.';
//           return;
//         }

//         if (pagesRead > totalPages) {
//           message.textContent = 'Pages read cannot be more than total pages.';
//           return;
//         }

//         try {
//           await addDoc(collection(db, 'readingProgress'), {
//             uid: userId,
//             bookName,
//             totalPages,
//             pagesRead,
//             timestamp: new Date()
//           });

//           message.textContent = 'Progress saved!';
//           form.reset();
//         } catch (error) {
//           console.error('Error adding document:', error);
//           message.textContent = 'Error saving progress.';
//         }
//       });
//     } else {
//       console.error('Track progress button not found!');
//     }

//     // Fetching reading progress and updating the list
//     const q = query(collection(db, 'readingProgress'), where('uid', '==', userId));
//     onSnapshot(q, (snapshot) => {
//       list.innerHTML = '';
//       snapshot.forEach(doc => {
//         const data = doc.data();
//         const percent = Math.round((data.pagesRead / data.totalPages) * 100);

//         const bookCard = document.createElement('div');
//         bookCard.className = 'book-progress-card';
//         bookCard.innerHTML = `
//           <h3>${data.bookName}</h3>
//           <p>${data.pagesRead} / ${data.totalPages} pages read</p>
//           <div class="progress-bar">
//             <div class="progress-fill" style="width: ${percent}%">${percent}%</div>
//           </div>
//         `;
//         list.appendChild(bookCard);
//       });
//     });
//   });
// });
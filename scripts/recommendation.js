import { db, auth } from '../firebase/config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
const API_KEY = 'Bearer Mq8XyWHaBS2A7TQVTtCvp5pxMWYzdaYo';
let currentUser = null;

document.addEventListener('DOMContentLoaded', initRecommendationSystem);

function initRecommendationSystem() {
    function loadGenresToDropdown() {
        const dropdown = $('#ai-recommender-select');

        dropdown.select2({
            placeholder: 'Select a genre',
            width: '100%',
            dropdownParent: $('#ai-recommender-modal')
        });

        fetch('../data/genres.json')
            .then(response => response.json())
            .then(genres => {
                genres.forEach(genre => {
                    const option = new Option(genre, genre, false, false);
                    dropdown.append(option);
                });
                dropdown.trigger('change');
            })
            .catch(err => {
                console.error("Error loading genres:", err);
            });
    }
    loadGenresToDropdown();
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
    });

    const openBtn = document.getElementById('ai-recommender-open-btn');
    const closeBtn = document.getElementById('ai-recommender-dismiss-btn');

    if (!openBtn || !closeBtn) {
        console.error('Modal elements not found!');
        return;
    }

    openBtn.addEventListener('click', () => {
        document.getElementById('ai-recommender-modal').classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        document.getElementById('ai-recommender-modal').classList.add('hidden');
        resetRecommenderModal();
    });

    window.addEventListener('click', (event) => {
    const modal = document.getElementById('ai-recommender-modal');
    if (event.target === modal) {
        modal.classList.add('hidden');
        resetRecommenderModal();
    }
});

    document.getElementById('ai-recommender-fetch-btn').addEventListener('click', getRecommendations);
}

async function getRecommendations() {
    const selectInput = document.getElementById('ai-recommender-select');
    const feedbackEl = document.getElementById('ai-recommender-feedback');
    const query = selectInput.value.trim();

    if (!query) {
        feedbackEl.textContent = "Please enter a genre or author";
        feedbackEl.style.color = 'red';
        return;
    }

    feedbackEl.textContent = "Fetching recommendations...";
    feedbackEl.style.color = 'green';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                messages: [{
                    role: 'user',
                    content: `Suggest 5 books based on: "${query}". Respond only with a strict JSON array like:
                    [
                        {
                            "title": "Book Title",
                            "author": "Author Name",
                            "genre": "Genre",
                            "description": "Brief description"
                        }
                    ]`
                }],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonString = content.match(/\[.*\]/s)?.[0] || '[]';

        const books = JSON.parse(jsonString);
        if (!books.length) throw new Error('No books found in response');

        displayBooks(books, query);
        feedbackEl.textContent = `Found ${books.length} recommendations!`;
    } catch (error) {
        console.error('Recommendation Error:', error);
        feedbackEl.textContent = `Error: ${error.message}`;
        feedbackEl.style.color = 'red';
    }
}

function displayBooks(books, userGenre) {
    const tbody = document.getElementById('ai-recommender-tbody');
    tbody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title || 'N/A'}</td>
            <td>${book.author || 'Unknown Author'}</td>
            <td>${userGenre || 'General'}</td>
            <td>${book.description || 'No description available'}</td>
            <td><button class="ai-recommender-submit-btn">Submit</button></td>
        `;

        row.querySelector('button').addEventListener('click', () => submitBook(book));
        tbody.appendChild(row);
    });
}

async function submitBook(book) {
    if (!currentUser) {
        alert('Please login to submit books');
        return;
    }

    try {
        await addDoc(collection(db, 'bookSuggestions'), {
            title: book.title,
            author: book.author,
            genre: book.genre,
            description: book.description,
            userEmail: currentUser.email,
            createdAt: serverTimestamp(),
            votes: 0,
            voters: []
        });

        document.getElementById('ai-recommender-feedback').textContent =
            `${book.title} submitted successfully!`;
    } catch (error) {
        console.error('Submission Error:', error);
        alert('Failed to submit book. Please try again.');
    }
}
function resetRecommenderModal() {
    // Clear Select2 selection
    $('#ai-recommender-select').val(null).trigger('change');

    // Clear recommendation table
    const tbody = document.getElementById('ai-recommender-tbody');
    if (tbody) tbody.innerHTML = '';

    // Clear feedback message
    const feedbackEl = document.getElementById('ai-recommender-feedback');
    if (feedbackEl) feedbackEl.textContent = '';
}
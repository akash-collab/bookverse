document.addEventListener("DOMContentLoaded", function () {
  function setupGenreDropdown(selector, jsonPath) {
    const $dropdown = $(selector);

    $dropdown.select2({
      placeholder: 'Select a genre',
      width: '100%',
    });

    // Load genres immediately on page load
    fetch('data/genres.json')
      .then(response => response.json())
      .then(genres => {
        genres.forEach(genre => {
          const option = new Option(genre, genre, false, false);
          $dropdown.append(option);
        });
        $dropdown.trigger('change'); // refresh select2
      })
      .catch(err => {
        console.error("Error loading genres:", err);
      });
  }

  // Call the function for both dropdowns
  setupGenreDropdown('#bookGenre', '../data/genres.json');
  setupGenreDropdown('#genre-filter', '../data/genres.json');
});
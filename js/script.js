// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
const API_KEY = 'Tzwq6NDDkQmPPgwFrmnJLpTHfT977NWDkNWjWPgd';

// API key used for NASA API requests

// Find the button and the gallery on the page
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Build the APOD URL using the start and end dates the user picked
function buildUrl(startDate, endDate) {
  return `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
}

// Show a card for each image NASA sends back
function showGallery(items) {
  // Clear out the placeholder or any old images
  gallery.innerHTML = '';

  items.forEach((item) => {
    // Some days are videos instead of images, so we skip those for now
    if (item.media_type !== 'image') {
      return;
    }

    // Use the HD image if there is one, otherwise use the regular one
    const imageUrl = item.hdurl || item.url;

    // Create a card and fill it with the image, title, and date
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.innerHTML = `
      <img src="${imageUrl}" alt="${item.title}" />
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;

    gallery.appendChild(card);
  });
}

// When the button is clicked, get the images from NASA
button.addEventListener('click', async () => {
  // Let the user know something is happening
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;

  try {
    // Ask NASA for the images in the chosen date range
    const response = await fetch(buildUrl(startInput.value, endInput.value));

    // If NASA sends back an error, stop and show it
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }

    // Turn the response into a list of objects
    const items = await response.json();
    showGallery(items);
  } catch (error) {
    // Show a friendly message if something went wrong
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Something went wrong: ${error.message}</p>
      </div>
    `;
  }
});

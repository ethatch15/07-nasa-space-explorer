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

// A list of fun space facts for the "Did You Know?" section
const spaceFacts = [
  'A day on Venus is longer than its year. Venus takes 243 Earth days to spin once, but only 225 to orbit the Sun.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'Olympus Mons on Mars is the tallest volcano in the solar system, about 2.5 times taller than Mount Everest.',
  'Saturn is so light for its size that it would float in water, if you could find a bathtub big enough.',
  'The International Space Station circles Earth about every 90 minutes, so astronauts see around 16 sunrises a day.',
  'Jupiter\'s Great Red Spot is a giant storm that is wider than the entire Earth.',
  'About 1.3 million Earths could fit inside the Sun.',
  'Space is completely silent because there is no air to carry sound waves.',
  'A year on Mercury is just 88 Earth days long.',
  'Neutron stars can spin hundreds of times every second.',
  'The Andromeda Galaxy is about 2.5 million light-years away, yet you can see it without a telescope on a dark night.',
  'The footprints left by Apollo astronauts on the Moon could last for millions of years because there is no wind to blow them away.'
];

// Pick one fact at random and show it on the page
const randomIndex = Math.floor(Math.random() * spaceFacts.length);
document.getElementById('spaceFact').textContent = spaceFacts[randomIndex];

// Find the button and the gallery on the page
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Build the APOD URL using the start and end dates the user picked
function buildUrl(startDate, endDate) {
  // thumbs=true asks NASA for a preview image (thumbnail_url) for video entries
  return `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
}

// Check if a video link can be played inside our page (YouTube or Vimeo embeds)
function isEmbeddable(url) {
  return url.includes('youtube.com/embed') || url.includes('player.vimeo.com');
}

// Find the modal and the parts inside it
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.getElementById('modalClose');

// Fill the modal with one item's details and show it
function openModal(item) {
  if (item.media_type === 'video') {
    // Videos: play it right in the modal if we can, and always give a link
    const player = isEmbeddable(item.url)
      ? `<iframe src="${item.url}" title="${item.title}" allowfullscreen></iframe>`
      : '';
    modalMedia.innerHTML = `
      ${player}
      <a class="video-link" href="${item.url}" target="_blank" rel="noopener">▶ Watch video</a>
    `;
  } else {
    // Images: show the HD version if there is one
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}" />`;
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

// Hide the modal
function closeModal() {
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');

  // Clear the media so a video stops playing when the modal closes
  modalMedia.innerHTML = '';
}

// Close the modal with the X button
modalClose.addEventListener('click', closeModal);

// Close the modal when clicking the dark area outside the white box
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close the modal with the Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Show a card for each image or video NASA sends back
function showGallery(items) {
  // Clear out the placeholder or any old images
  gallery.innerHTML = '';

  items.forEach((item) => {
    // Create a card to hold this entry
    const card = document.createElement('div');
    card.className = 'gallery-item';

    if (item.media_type === 'video') {
      // Videos: show the thumbnail if NASA sent one, otherwise a play icon
      const preview = item.thumbnail_url
        ? `<img src="${item.thumbnail_url}" alt="${item.title}" />`
        : `<div class="video-placeholder">▶</div>`;

      card.innerHTML = `
        ${preview}
        <p><strong>${item.title}</strong></p>
        <p>${item.date} · 🎬 Video</p>
        <a class="video-link" href="${item.url}" target="_blank" rel="noopener">▶ Watch video</a>
      `;
    } else {
      // Images: use the HD image if there is one, otherwise the regular one
      const imageUrl = item.hdurl || item.url;

      card.innerHTML = `
        <img src="${imageUrl}" alt="${item.title}" />
        <p><strong>${item.title}</strong></p>
        <p>${item.date}</p>
      `;
    }

    // Open the modal with this item's details when the card is clicked
    card.addEventListener('click', (event) => {
      // Let the "Watch video" link open on its own without opening the modal
      if (event.target.closest('a')) {
        return;
      }
      openModal(item);
    });

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


// local storage
const STORAGE_KEY = 'My_events';
// Main array to hold all event objects in memory
let events = [];

// Get references to all necessary HTML elements
const eventForm = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const noEventsMessage = document.getElementById('no-events-message');
const filterType = document.getElementById('filter-type');
const filterDate = document.getElementById('filter-date');


// --- Data Handling Functions (CRUD) ---

/**
 * Loads the events from local storage when the page starts.
 */
function loadEvents() {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    // If data exists, parse the JSON string back into a JavaScript array.
    events = storedEvents ? JSON.parse(storedEvents) : [];
}

/**
 * Saves the current 'events' array to local storage.
 */
function saveEvents() {
    // Convert the JavaScript array into a JSON string for storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * Adds a new event object to the list (Create operation).
 */
function addEvent(newEvent) {
    // Give the new event a unique ID (timestamp is a simple way)
    newEvent.id = Date.now().toString();
    events.push(newEvent);
    saveEvents();
}

/**
 * Finds and updates an existing event by its ID (Update operation).
 */
function updateEvent(id, updatedEvent) {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
        // Replace the old event object with the new data
        events[index] = { id: events[index].id, ...updatedEvent };
        saveEvents();
    }
}

/**
 * Removes an event by its ID (Delete operation).
 */
function deleteEvent(id) {
    // Keep only the events whose IDs do NOT match the ID to be deleted
    events = events.filter(e => e.id !== id);
    saveEvents();
    renderEvents(); // Refresh the visible list
}


// --- UI Rendering and Interaction ---

/**
 * Renders the event list, applying filter rules (Read operation).
 */
function renderEvents() {
    eventList.innerHTML = ''; // Clear the list before rendering

    const selectedType = filterType.value;
    const selectedDate = filterDate.value;

    let filteredEvents = events;

    // 1. Filtering by Type
    if (selectedType) {
        filteredEvents = filteredEvents.filter(e => e.type === selectedType);
    }
    // 2. Filtering by Date
    if (selectedDate) {
        filteredEvents = filteredEvents.filter(e => e.date === selectedDate);
    }

    // 3. Sorting (Sort events by date, earliest date first)
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Display "No Events" message if the filtered list is empty
    if (filteredEvents.length === 0) {
        noEventsMessage.classList.remove('hidden');
        eventList.appendChild(noEventsMessage);
        return;
    } else {
        noEventsMessage.classList.add('hidden');
    }

    // 4. Create an HTML card for each filtered event
    filteredEvents.forEach(event => {
        // Format the date for a readable display
        const displayDate = new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        // Create a new div element for the card
        const eventCard = document.createElement('div');
        // Add the base class and the type class for CSS styling
        eventCard.className = `event-card type-${event.type}`;

        // Fill the card with event details and buttons
        eventCard.innerHTML = `
            <div class="event-header">
                <div>
                    <h3>${event.name}</h3>
                    <span class="event-type">${event.type}</span>
                </div>
                <p class="event-date">${displayDate}</p>
            </div>

            <p class="event-description">${event.description || 'No description provided.'}</p>

            <div class="event-actions">
                <button onclick="prefillEditForm('${event.id}')"
                    class="btn action-btn edit-btn">
                    Edit
                </button>
                <button onclick="deleteEvent('${event.id}')"
                    class="btn action-btn delete-btn">
                    Delete
                </button>
            </div>
        `;
        eventList.appendChild(eventCard);
    });
}

/**
 * Switches the form to Edit mode and fills fields with event data.
 */
function prefillEditForm(id) {
    const eventToEdit = events.find(e => e.id === id);

    if (eventToEdit) {
        // Set the hidden ID field (important for saving the update)
        document.getElementById('event-id').value = eventToEdit.id;
        
        // Fill the visible form fields
        document.getElementById('name').value = eventToEdit.name;
        document.getElementById('type').value = eventToEdit.type;
        document.getElementById('date').value = eventToEdit.date;
        document.getElementById('description').value = eventToEdit.description;

        // Change the form UI text and buttons to reflect Edit mode
        formTitle.textContent = 'Edit Existing Event';
        submitBtn.textContent = 'Save Changes';
        submitBtn.classList.remove('primary-btn');
        submitBtn.classList.add('edit-btn');
        cancelEditBtn.classList.remove('hidden');

        // Scroll to the form for better user experience
        document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Resets the form back to Add mode.
 */
function resetForm() {
    eventForm.reset(); // Clear all form fields
    document.getElementById('event-id').value = ''; // Clear the hidden ID

    // Reset UI back to Add mode
    formTitle.textContent = 'Add New Event';
    submitBtn.textContent = 'Save Event';
    submitBtn.classList.add('primary-btn');
    submitBtn.classList.remove('edit-btn');
    cancelEditBtn.classList.add('hidden');
}

/**
 * Resets the filter controls (type and date) and refreshes the list.
 */
function resetFilters() {
    filterType.value = '';
    filterDate.value = '';
    renderEvents();
}

// --- Main Event Listener for Form Submission (Add or Edit) ---
eventForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission (page reload)

    // Collect data from the form
    const eventData = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value.trim()
    };

    const eventId = document.getElementById('event-id').value;

    if (eventId) {
        // If eventId exists, update the existing event
        updateEvent(eventId, eventData);
    } else {
        // Otherwise, add a new event
        addEvent(eventData);
    }

    // Reset form and re-render the event list
    resetForm();
    renderEvents();
});

// --- Initialization: Run on page load ---
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();   // Get any previously saved data
    renderEvents(); // Display the initial list of events
});
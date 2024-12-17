const addNoteBtn = document.getElementById('add-note-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const notesContainer = document.getElementById('notes-container');
const searchBar = document.getElementById('search-bar');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const globalBgColor = document.getElementById('global-bg-color');
const globalTextColor = document.getElementById('global-text-color');
const globalBoldBtn = document.getElementById('global-bold-btn');
const globalItalicBtn = document.getElementById('global-italic-btn');
const globalUnderlineBtn = document.getElementById('global-underline-btn');

let currentSelectedCard = null; // Track the currently selected card

// Toggle Theme
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.classList.toggle('fa-sun', !isDark); // Show sun for light mode
    themeIcon.classList.toggle('fa-moon', isDark); // Show moon for dark mode
});

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    loadNotes();
});

// Create a new note
function createNote(content = '', bgColor = '#ffffff', textColor = '#000000') {
    const note = document.createElement('div');
    note.classList.add('note', 'p-4', 'rounded', 'shadow-lg', 'relative', 'border', 'border-gray-300');
    note.style.backgroundColor = bgColor;

    note.innerHTML = `
        <div contenteditable="true" class="note-content mb-4" style="color: ${textColor};">${content}</div>
        <button class="shorten-btn px-2 py-1 bg-gray-200 rounded">Shorten</button>
        <button class="delete-btn absolute top-2 right-2 text-gray-500   hover:text-red-500">&times;</button>
    `;

    const noteContent = note.querySelector('.note-content');

    // Select card on click
    noteContent.addEventListener('click', () => {
        if (currentSelectedCard) {
            currentSelectedCard.classList.remove('selected');
        }
        currentSelectedCard = note;
        currentSelectedCard.classList.add('selected');
    });

    // Shorten functionality
    note.querySelector('.shorten-btn').addEventListener('click', () => {
        const isShortened = noteContent.style.overflow === 'hidden';
        noteContent.style.overflow = isShortened ? '' : 'hidden';
        noteContent.style.height = isShortened ? '' : '50px';
        note.querySelector('.shorten-btn').textContent = isShortened ? 'Shorten' : 'Expand';
    });

    // Delete button
    note.querySelector('.delete-btn').addEventListener('click', () => {
        note.remove();
        saveNotes();
    });

    // Save content on input
    noteContent.addEventListener('input', saveNotes);

    notesContainer.appendChild(note);
    saveNotes();
}

// Save notes to localStorage
function saveNotes() {
    const notes = Array.from(notesContainer.children).map(note => ({
        content: note.querySelector('.note-content').innerHTML,
        bgColor: note.style.backgroundColor,
        textColor: note.querySelector('.note-content').style.color,
    }));
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Load notes from localStorage
function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotes.forEach(note => createNote(note.content, note.bgColor, note.textColor));
}

// Event Listeners for Header Buttons
addNoteBtn.addEventListener('click', () => createNote());

deleteAllBtn.addEventListener('click', () => {
    if (!notesContainer.children.length) {
        alert('No notes to delete!');
        return;
    }
    if (confirm('Are you sure you want to delete all notes?')) {
        notesContainer.innerHTML = '';
        saveNotes();
    }
});

// Search functionality
searchBar.addEventListener('input', () => {
    const query = searchBar.value.toLowerCase();
    Array.from(notesContainer.children).forEach(note => {
        const content = note.querySelector('.note-content').textContent.toLowerCase();
        note.style.display = content.includes(query) ? '' : 'none';
    });
});

// Toggle Style Function
function toggleStyle(styleProp, value) {
    if (currentSelectedCard) {
        const noteContent = currentSelectedCard.querySelector('.note-content');
        noteContent.style[styleProp] = noteContent.style[styleProp] === value ? '' : value;
        saveNotes();
    } else {
        alert('Please select a note to apply this style.');
    }
}

// Global style application
globalBoldBtn.addEventListener('click', () => toggleStyle('fontWeight', 'bold'));
globalItalicBtn.addEventListener('click', () => toggleStyle('fontStyle', 'italic'));
globalUnderlineBtn.addEventListener('click', () => toggleStyle('textDecoration', 'underline'));

globalBgColor.addEventListener('input', () => {
    if (currentSelectedCard) {
        currentSelectedCard.style.backgroundColor = globalBgColor.value;
        saveNotes();
    } else {
        alert('Please select a note to apply this background color.');
    }
});

globalTextColor.addEventListener('input', () => {
    if (currentSelectedCard) {
        const noteContent = currentSelectedCard.querySelector('.note-content');
        noteContent.style.color = globalTextColor.value;
        saveNotes();
    } else {
        alert('Please select a note to apply this text color.');
    }
});

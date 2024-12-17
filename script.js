
const addNoteBtn = document.getElementById('add-note-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const notesContainer = document.getElementById('notes-container');
const searchBar = document.getElementById('search-bar');
const themeIcon = document.getElementById('theme-icon');
const globalBgColor = document.getElementById('global-bg-color');
const globalTextColor = document.getElementById('global-text-color');
const globalBoldBtn = document.getElementById('global-bold-btn');
const globalItalicBtn = document.getElementById('global-italic-btn');
const globalUnderlineBtn = document.getElementById('global-underline-btn');

// Variables
let currentSelectedCard = null; // Track the currently selected card

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
addNoteBtn.addEventListener('click', createNote);
deleteAllBtn.addEventListener('click', deleteAllNotes);
searchBar.addEventListener('input', filterNotes);

// Global Style Event Listeners
globalBoldBtn.addEventListener('click', () => toggleStyle('fontWeight', 'bold'));
globalItalicBtn.addEventListener('click', () => toggleStyle('fontStyle', 'italic'));
globalUnderlineBtn.addEventListener('click', () => toggleStyle('textDecoration', 'underline'));
globalBgColor.addEventListener('input', () => changeNoteStyle('backgroundColor', globalBgColor.value));
globalTextColor.addEventListener('input', () => changeNoteStyle('color', globalTextColor.value));

// Initialize App (Load Notes & Apply Saved Theme)
function initializeApp() {
    loadNotes();
}



// Create a new note
function createNote(content = '', bgColor = '#ffffff', textColor = '#000000') {
    const note = document.createElement('div');
    note.classList.add('note', 'p-4', 'rounded', 'shadow-lg', 'relative', 'border', 'border-gray-300');
    note.style.backgroundColor = bgColor;

    note.innerHTML = `
        <div contenteditable="true" class="note-content mb-4" style="color: ${textColor};">${content}</div>
        <button class="summarize-btn px-2 py-1 bg-blue-200 rounded">Summarize</button>
        <button class="delete-btn absolute top-2 right-2 text-gray-500 hover:text-red-500">&times;</button>
    `;

    const noteContent = note.querySelector('.note-content');

    // Select card on click
    noteContent.addEventListener('click', () => selectNoteCard(note));

    // Summarize functionality
    note.querySelector('.summarize-btn').addEventListener('click', () => summarizeText(noteContent));

    // Delete button
    note.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note));

    // Save content on input
    noteContent.addEventListener('input', saveNotes);

    notesContainer.appendChild(note);
    saveNotes();
}

// Delete Note
function deleteNote(note) {
    note.remove();
    saveNotes();
}

// Select a note to apply styles
function selectNoteCard(note) {
    if (currentSelectedCard) {
        currentSelectedCard.classList.remove('selected');
    }
    currentSelectedCard = note;
    currentSelectedCard.classList.add('selected');
}

// Toggle Style Function (Bold, Italic, Underline)
function toggleStyle(styleProp, value) {
    if (currentSelectedCard) {
        const noteContent = currentSelectedCard.querySelector('.note-content');
        noteContent.style[styleProp] = noteContent.style[styleProp] === value ? '' : value;
        saveNotes();
    } else {
        alert('Please select a note to apply this style.');
    }
}

// Change Style for Background or Text Color
function changeNoteStyle(styleProp, value) {
    if (currentSelectedCard) {
        const noteContent = currentSelectedCard.querySelector('.note-content');
        noteContent.style[styleProp] = value;
        saveNotes();
    } else {
        alert('Please select a note to apply this style.');
    }
}
function changeStyle(styleProp, value) {
    if (!currentSelectedCard) return alert('Select a note first!');
    const content = currentSelectedCard.querySelector('.note-content');
    content.style[styleProp] = value;
    saveNotes();
}
// Search functionality for filtering notes
function filterNotes() {
    const query = searchBar.value.toLowerCase();
    Array.from(notesContainer.children).forEach(note => {
        const content = note.querySelector('.note-content').textContent.toLowerCase();
        note.style.display = content.includes(query) ? '' : 'none';
    });
}

// Delete All Notes
function deleteAllNotes() {
    if (!notesContainer.children.length) {
        alert('No notes to delete!');
        return;
    }
    if (confirm('Are you sure you want to delete all notes?')) {
        notesContainer.innerHTML = '';
        saveNotes();
    }
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


async function summarizeText(noteContent) {
    const inputText = noteContent.innerText;
    const apiKey = "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";
    const apiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: inputText,
                parameters: {
                    "min_length": 20,   // Minimum length of summary
                    "max_length": 50,   // Maximum length of summary
                },
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Display the summary
        if (data && data[0] && data[0].summary_text) {
            noteContent.innerText = data[0].summary_text;
            saveNotes();  // Save the updated content after summarization
        } else {
            noteContent.innerText = "Could not generate summary. Please try again.";
        }
    } catch (error) {
        console.error("Error:", error);
        noteContent.innerText = "An error occurred while summarizing.";
    }
}




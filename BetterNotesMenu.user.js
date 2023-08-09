// ==UserScript==
// @name         Better Notes Menü
// @namespace    Discord @afiliaassela
// @version      1.3.1
// @description  Resizeable Notizen für LSS
// @author       Afilia
// @match        https://www.leitstellenspiel.de/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const notesKey = 'stickyNotes'; // Key for localStorage

    // Load notes from local storage
    const savedNoteDimensions = JSON.parse(localStorage.getItem('stickyNoteDimensions')) || [];

    document.addEventListener('DOMContentLoaded', () => {
        savedNoteDimensions.forEach((dimensions, index) => {
            const noteElement = document.querySelector('.sticky-note:nth-child(' + (index + 1) + ')');
            if (noteElement && dimensions.width && dimensions.height) {
                noteElement.style.width = dimensions.width;
                noteElement.style.height = dimensions.height;
            }
        });
    });

    // Create Sticky Notes Modal
    const menuModal = document.createElement('div');
    menuModal.classList.add('modal', 'fade', 'bd-example-modal-lg');
    menuModal.id = 'sticky-notes-modal';
    menuModal.tabIndex = '-1';
    menuModal.role = 'dialog';
    menuModal.setAttribute('aria-labelledby', 'sticky-notes-modal-label');
    menuModal.setAttribute('aria-hidden', 'true');

    // Move the style tag outside the modal content and add the styles to the document head
    const styles = `
        .modal-header .close span {
            color: red;
        }

        .modal-footer .btn-secondary {
            color: red;
            background-color: white;
            border-color: red;
        }

        .sticky-note {
            width: 200px;
            height: 150px;
            background-color: grey;
            border: 1px solid #000;
            resize: both;
            overflow: hidden;
            z-index: 10000;
            min-width: 200px;
            min-height: 150px;
            max-width: calc(100% - 20px);
            max-height: calc(80% - 60px);
            display: inline-grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            grid-gap: 10px; 
        }

        .sticky-note-content {
            padding: 5px;
            height: 80%;
            color: white;
            font-family: Arial, sans-serif;
        }

        .sticky-note-button {
            background-color: green;
        }

        .sticky-note-button-delete {
            background-color: red;
        }

        .resize-handle {
            width: 10px;
            height: 10px;
            background-color: grey;
            position: absolute;
            bottom: 0;
            right: 0;
            cursor: nwse-resize;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    menuModal.innerHTML = `
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Schließen">
                        <span aria-hidden="true">&#x274C;</span>
                    </button>
                    <h5 class="modal-title"><center>Notizen Menü</center></h5>
                </div>
                <div class="modal-body">
                    <button id="add-note-btn" class="btn btn-primary">Neue Notiz</button>
                    <div id="sticky-notes-container"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Schließen</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(menuModal);

    const addButton = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('sticky-notes-container');

    // Load saved notes from local storage
    const savedNotes = JSON.parse(localStorage.getItem(notesKey)) || [];
    savedNotes.forEach((noteText, index) => {
        const dimensions = savedNoteDimensions[index];
        createStickyNote(noteText, dimensions);
    });

    addButton.addEventListener('click', () => createStickyNote());

    // Sticky Notes Code
    function createStickyNote(savedContent = '', dimensions = {}) {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        note.style.width = dimensions.width || '200px';
        note.style.height = dimensions.height || '150px';
        note.style.backgroundColor = 'grey';
        note.style.border = '1px solid #000';
        note.style.resize = 'both';
        note.style.overflow = 'hidden';
        note.style.zIndex = '10000';
        note.style.minWidth = '200px';
        note.style.minHeight = '150px';
        note.style.maxWidth = '600px';
        note.style.maxHeight = '450px';

        // Create the resizing handle
        const handle = document.createElement('div');
        handle.classList.add('resize-handle');
        note.appendChild(handle);

        // Implement resizing behavior
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(getComputedStyle(note).width, 10);
            startHeight = parseInt(getComputedStyle(note).height, 10);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            // Set minimum and maximum dimensions
            const minWidth = 200; // Set your desired minimum width here
            const maxWidth = Math.min(window.innerWidth - 20, 200); // Limit to 1276px width
            const minHeight = 150; // Set your desired minimum height here
            const maxHeight = Math.min(window.innerHeight * 0.8 - 60, 200); // Limit to 1124px height

            // Apply limitations
            note.style.width = Math.min(maxWidth, Math.max(newWidth, minWidth)) + 'px';
            note.style.height = Math.min(maxHeight, Math.max(newHeight, minHeight)) + 'px';
        });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

        const noteContent = document.createElement('div');
        noteContent.classList.add('sticky-note-content');
        noteContent.contentEditable = true;
        noteContent.style.padding = '5px';
        noteContent.style.height = 'calc(100% - 32px)';
        noteContent.style.color = 'white';
        noteContent.style.fontFamily = 'Arial, sans-serif';

        // Create the "Speichern" (Save) button
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Speichern';
        saveButton.classList.add('btn', 'btn-primary', 'sticky-note-button');
        saveButton.addEventListener('click', () => {
            saveContentToLocalStorage(noteContent, note);
            saveResizedDimensionsToLocalStorage(note);
        });

        // Create the "Löschen" (Delete) button
        const removeButton = document.createElement('button');
        removeButton.innerText = 'Löschen';
        removeButton.classList.add('btn', 'btn-danger', 'sticky-note-button');
        removeButton.addEventListener('click', () => {
            notesContainer.removeChild(note);
            saveNotesToLocalStorage();
            saveResizedDimensionsToLocalStorage();
        });

        // Create a button container div
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('sticky-note-button-container');
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(removeButton);

        // Append the note content and button container to the note
        note.appendChild(noteContent);
        note.appendChild(buttonContainer);

        // Append the note to the notes container
        notesContainer.appendChild(note);

        // Set the saved content if provided
        noteContent.innerHTML = savedContent;
    }

    // Save resized dimensions to local storage
    function saveResizedDimensionsToLocalStorage(noteElement) {
        const noteElements = document.querySelectorAll('.sticky-note');
        const index = Array.from(noteElements).indexOf(noteElement);
        if (index !== -1) {
            const noteDimensions = JSON.parse(localStorage.getItem('stickyNoteDimensions')) || [];
            noteDimensions[index] = {
                width: noteElement.style.width,
                height: noteElement.style.height
            };
            localStorage.setItem('stickyNoteDimensions', JSON.stringify(noteDimensions));
        }
    }

    // Save notes to local storage
    function saveNotesToLocalStorage() {
        const noteElements = document.querySelectorAll('.sticky-note-content');
        const notes = Array.from(noteElements).map(noteElement => noteElement.innerHTML); // Use innerHTML
        localStorage.setItem(notesKey, JSON.stringify(notes));

        // Update savedNoteDimensions array by removing dimensions of deleted notes
        savedNoteDimensions.splice(noteElements.length);
        saveResizedDimensionsToLocalStorage();
    }

    // Save specific note content to local storage
    function saveContentToLocalStorage(contentElement, noteElement) {
        const noteElements = document.querySelectorAll('.sticky-note');
        const index = Array.from(noteElements).indexOf(noteElement);
        if (index !== -1) {
            const noteContents = document.querySelectorAll('.sticky-note-content');
            const notes = Array.from(noteContents).map(noteContent => noteContent.innerHTML); // Use innerHTML
            notes[index] = contentElement.innerHTML;
            localStorage.setItem(notesKey, JSON.stringify(notes));
        }
    }


    // Add Mission Control Button
    $("#btn-group-mission-select").before(`
        <a id="Mission Select" data-toggle="modal" data-target="#sticky-notes-modal" class="btn btn-success btn-xs">
            <span class="glyphicon glyphicon-pencil"></span> Notizen
        </a>
    `);
})();

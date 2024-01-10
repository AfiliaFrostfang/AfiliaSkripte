// ==UserScript==
// @name         Sortier Funktion Ausblenden
// @namespace    afilia
// @version      0.1
// @description  Versteckt Sortierfunktion
// @author       Afilia
// @match        *://www.leitstellenspiel.de/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Specify the class or ID of the elements you want to hide
    var elementsToHide = document.querySelectorAll('.mission-sorting');

    // Hide each element
    elementsToHide.forEach(function(element) {
        element.style.display = 'none';
    });
})();
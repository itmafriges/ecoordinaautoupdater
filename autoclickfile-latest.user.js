// ==UserScript==
// @name         Auto Click with Config Popup
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Auto-clicks a button every X seconds with a configurable popup
// @author       Eduardo Morell
// @match        https://v5.e-coordina.com/*
// @exclude      about:*
// @exclude      file://*
// @grant        GM.setValue
// @grant        GM.getValue
// @updateURL    https://raw.githubusercontent.com/itmafriges/ecoordinaautoupdater/main/autoclickfile-latest.user.js
// @downloadURL  https://raw.githubusercontent.com/itmafriges/ecoordinaautoupdater/main/autoclickfile-latest.user.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("Script injected and running"); // Immediate feedback

    // Default settings
    let config = {
        url: '',
        intervalSeconds: 5,
        buttonId: ''
    };

    // Load saved settings
    async function loadConfig() {
        try {
            config.url = await GM.getValue('url', '') || '';
            config.intervalSeconds = parseInt(await GM.getValue('intervalSeconds', 5)) || 5;
            config.buttonId = await GM.getValue('buttonId', '') || '';
            console.log("Config loaded:", config);
        } catch (e) {
            console.error("Error loading config:", e);
        }
    }

    // Save settings
    async function saveConfig() {
        try {
            await GM.setValue('url', config.url);
            await GM.setValue('intervalSeconds', config.intervalSeconds);
            await GM.setValue('buttonId', config.buttonId);
            console.log("Config saved:", config);
        } catch (e) {
            console.error("Error saving config:", e);
        }
    }

    // Create the popup UI
    function createPopup() {
        const existingPopup = document.getElementById('autoClickPopup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.id = 'autoClickPopup';
        popup.style.cssText = `
            position: fixed; top: 20px; right: 20px; width: 300px; padding: 15px;
            background: #fff; border: 2px solid #333; box-shadow: 0 0 15px rgba(0,0,0,0.5);
            z-index: 10000; font-family: Arial, sans-serif; font-size: 16px;
        `;

        popup.innerHTML = `
            <h3 style="margin: 0 0 10px;">Auto Click Config</h3>
            <label>URL (blank for current): <input type="text" id="urlInput" value="${config.url}" placeholder="e.g., https://example.com" style="width: 100%;"></label><br><br>
            <label>Interval (seconds): <input type="number" id="intervalInput" value="${config.intervalSeconds}" min="1" style="width: 100%;"></label><br><br>
            <label>Button ID: <input type="text" id="buttonIdInput" value="${config.buttonId}" placeholder="e.g., submit" style="width: 100%;"></label><br><br>
            <button id="saveBtn" style="margin-right: 10px;">Save & Start</button><button id="closeBtn">Close</button>
        `;

        try {
            document.body.appendChild(popup);
            console.log("Popup appended to DOM");
        } catch (e) {
            console.error("Error appending popup:", e);
        }

        document.getElementById('saveBtn').addEventListener('click', () => {
            config.url = document.getElementById('urlInput').value.trim();
            config.intervalSeconds = parseInt(document.getElementById('intervalInput').value) || 5;
            config.buttonId = document.getElementById('buttonIdInput').value.trim();
            saveConfig().then(startClicking).then(() => popup.remove());
        });

        document.getElementById('closeBtn').addEventListener('click', () => popup.remove());
    }

    // Click function
    function clickButton() {
        const button = config.buttonId ? document.getElementById(config.buttonId) : null;
        if (button) {
            button.click();
            console.log(`Clicked button #${config.buttonId} at ${new Date().toLocaleTimeString()}`);
        } else {
            console.log(`Button #${config.buttonId} not found on ${window.location.href}`);
        }
    }

    // Start auto-clicking
    let intervalId = null;
    function startClicking() {
        if (intervalId) clearInterval(intervalId);
        const shouldRun = config.url === '' || window.location.href.startsWith(config.url);
        if (shouldRun && config.buttonId && config.intervalSeconds > 0) {
            intervalId = setInterval(clickButton, config.intervalSeconds * 1000);
            clickButton();
            console.log("Auto-clicking started with interval:", config.intervalSeconds);
        } else {
            console.log("Auto-clicking not started - conditions not met");
        }
    }

    // Add a floating config button
    function addConfigButton() {
        try {
            const btn = document.createElement('button');
            btn.textContent = 'Config Auto Click';
            btn.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 10000;
                padding: 10px 15px; background: #007BFF; color: #fff; border: none;
                border-radius: 5px; font-size: 16px; cursor: pointer;
            `;
            btn.addEventListener('click', createPopup);
            document.body.appendChild(btn);
            console.log("Config button added to DOM");
        } catch (e) {
            console.error("Error adding config button:", e);
        }
    }

    // Ensure DOM is ready before initializing
    function initialize() {
        console.log("Initializing...");
        if (document.body) {
            loadConfig().then(() => {
                addConfigButton();
                startClicking();
            }).catch(e => console.error("Initialization error:", e));
        } else {
            console.log("DOM not ready, retrying in 100ms");
            setTimeout(initialize, 100);
        }
    }

    // Start when DOM is loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }
})();

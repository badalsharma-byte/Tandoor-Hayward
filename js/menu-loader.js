// js/menu-loader.js

document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
});

function fetchMenu() {
    const container = document.getElementById('dynamic-menu-container');

    fetch('crm/api/menu.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error('Invalid JSON response: ' + text.substring(0, 100));
                }
            });
        })
        .then(data => {
            if (data.success) {
                renderMenu(data.data);
            } else {
                throw new Error(data.message || 'Unknown error from API');
            }
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
            if (container) {
                let errorMessage = error.message;
                let additionalHelp = '';

                if (window.location.protocol === 'file:') {
                    errorMessage = 'You are opening this file directly (file://).';
                    additionalHelp = 'You MUST access this website via the server (http://localhost:8000) for the menu to load.';
                } else {
                    additionalHelp = 'Make sure you are running the server (./start_server.sh) and accessing via localhost:8000';
                }

                container.innerHTML = `
                    <div class="text-center text-red-400 py-4">
                        <p class="font-bold">Failed to load menu.</p>
                        <p class="text-sm opacity-75 mb-2">${errorMessage}</p>
                        <p class="text-xs text-gray-400">${additionalHelp}</p>
                    </div>`;
            }
        });
}

function renderMenu(items) {
    const container = document.getElementById('dynamic-menu-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    if (items.length === 0) {
        container.innerHTML = '<div class="text-center text-white py-4">No menu items available at the moment.</div>';
        return;
    }

    // Optional: Group by category if needed, but for now just list them
    // Or filter to show only specific categories if the design requires it.
    // The current design is a single list, so we'll just append them.

    // Filter available items first
    const availableItems = items.filter(item => item.is_available == 1);

    // Take only the first 6 items
    const displayItems = availableItems.slice(0, 6);

    displayItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'menu-item';

        li.innerHTML = `
            <div class="menu-item-header">
                <span class="menu-item-name">${escapeHtml(item.name)}</span>
                <span class="menu-item-price">$${parseFloat(item.price).toFixed(2)}</span>
            </div>
            <p class="menu-item-description">
                ${escapeHtml(item.description)}
            </p>
        `;
        container.appendChild(li);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

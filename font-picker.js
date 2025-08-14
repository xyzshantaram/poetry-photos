class FontPicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.fonts = [];
        this.filteredFonts = [];
        this.selectedFont = '';
        this.searchTerm = '';
        this.apiKey = this.getAttribute('api-key') || '';
        this.apiUrl = this.getAttribute('api-url') || `https://www.googleapis.com/webfonts/v1/webfonts`;
        this.height = this.getAttribute('height') || '10rem';
        this.loadedFonts = new Set();

        this.render();
        this.loadFonts();
    }

    static get observedAttributes() {
        return ['api-key', 'api-url', 'height'];
    }

    attributeChangedCallback(name, _, updated) {
        if (name === 'api-key') {
            this.apiKey = updated;
            this.loadFonts();
        }
        if (name === 'api-url') {
            this.apiUrl = updated;
            this.loadFonts();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }

        .font-picker-container {
          border: 1px solid #ccc;
          border-radius: 0.25rem;
          padding: 0.5rem;
          background: white;
        }

        #search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
          box-sizing: border-box;
        }

        .selected-font-indicator {
          font-size: 0.8rem;
          margin: 0.2rem;
          color: #666666;
        }

        .selected-font-name {
          font-weight: bold;
          color: #202020;
        }

        #font-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
          background: white;
          font-size: 1rem;
          height: ${this.height};
          overflow-y: auto;
        }

        #font-select:focus {
          outline: none;
        }

        .font-option {
          padding: 0.25rem 0.5rem;
          cursor: pointer;
        }

        .font-option:hover {
          background: #f0f0f0;
        }

        .font-option:focus {
          outline: 2px solid #1976d2;
          outline-offset: -2px;
        }

        .font-category {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          padding: 0.4rem;
          border-bottom: 1px solid #eee;
          width: calc(100% - 0.8rem);
          background: white;
        }

        .font-name {
          font-family: inherit;
        }

        .loading {
          text-align: center;
          padding: 1rem;
          color: #666;
        }

        .error {
          color: #d32f2f;
          padding: 0.5rem;
          background: #ffebee;
          border-radius: 0.25rem;
          margin: 0.5rem 0;
        }
      </style>

      <div class="font-picker-container">
        <input 
          type="text" 
          placeholder="Search fonts..."
          id="search-input"
        >
        <div class="selected-font-indicator" id="selectedFontIndicator">
          Currently selected: <strong>None</strong>
        </div>
        <div id="font-select" class="font-select" tabindex="-1">
          <div class="loading">Loading fonts...</div>
        </div>
      </div>
    `;

        this.searchInput = this.shadowRoot.getElementById('search-input');
        this.fontSelect = this.shadowRoot.getElementById('font-select');
        this.selectedFontIndicator = this.shadowRoot.getElementById('selectedFontIndicator');

        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterFonts();
        });

        // Handle Tab key from search input to move to font options
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                const fontOptions = this.fontSelect.querySelectorAll('.font-option');
                if (fontOptions.length > 0) {
                    e.preventDefault();
                    fontOptions[0].focus();
                }
            }
        });

        // Add keyboard navigation for the font select container
        this.fontSelect.addEventListener('keydown', (e) => {
            const fontOptions = this.fontSelect.querySelectorAll('.font-option');
            if (fontOptions.length === 0) return;

            const currentFocus = this.shadowRoot.activeElement;
            const currentIndex = Array.from(fontOptions).indexOf(currentFocus);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex === -1 || currentIndex === fontOptions.length - 1) {
                        fontOptions[0].focus();
                    } else {
                        fontOptions[currentIndex + 1].focus();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex <= 0) {
                        fontOptions[fontOptions.length - 1].focus();
                    } else {
                        fontOptions[currentIndex - 1].focus();
                    }
                    break;
                case 'Tab':
                    // Allow normal tab navigation but manage focus within the container
                    if (e.shiftKey) {
                        // Shift+Tab: move to previous focusable element or search input
                        if (currentIndex === 0) {
                            e.preventDefault();
                            this.searchInput.focus();
                        }
                    } else {
                        // Tab: move to next focusable element or stay in container
                        if (currentIndex === fontOptions.length - 1) {
                            e.preventDefault();
                            // If at last option, loop to first or let tab leave component
                            fontOptions[0].focus();
                        }
                    }
                    break;
            }
        });

        // Make font select container focusable when it has options
        this.fontSelect.addEventListener('focus', () => {
            const firstOption = this.fontSelect.querySelector('.font-option');
            if (firstOption && this.shadowRoot.activeElement === this.fontSelect) {
                firstOption.focus();
            }
        });
    }

    async loadFonts() {
        if (!this.apiKey) {
            this.showError('API key is required. Please provide an API key.');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            this.fonts = data.items || [];
            this.filterFonts();
        } catch (error) {
            this.showError(`Failed to load fonts: ${error.message}`);
        }
    }

    filterFonts() {
        if (!this.searchTerm) {
            this.filteredFonts = [];
        } else {
            this.filteredFonts = this.fonts.filter(font =>
                font.family.toLowerCase().includes(this.searchTerm) ||
                font.category.toLowerCase().includes(this.searchTerm)
            );
        }
        this.renderFontList();
    }

    renderFontList() {
        if (!this.searchTerm) {
            this.fontSelect.innerHTML = '<div class="loading">Start typing to search fonts...</div>';
            return;
        }

        if (!this.filteredFonts.length) {
            this.fontSelect.innerHTML = '<div class="loading">No fonts found.</div>';
            return;
        }

        // Group fonts by category
        const fontsByCategory = this.filteredFonts.reduce((acc, font) => {
            if (!acc[font.category]) {
                acc[font.category] = [];
            }
            acc[font.category].push(font);
            return acc;
        }, {});

        const html = [];
        let i = 0;

        Object.keys(fontsByCategory).sort().forEach(category => {
            const categoryFonts = fontsByCategory[category].slice(0, 5);

            if (categoryFonts.length > 0) {
                html.push(`<div class="font-category">${category}</div>`);

                categoryFonts.forEach(font => {
                    const isSelected = this.selectedFont === font.family;
                    html.push(`
            <div tabindex='${++i}' class="font-option" data-font="${font.family}">
              <span class="font-name">${font.family}</span>
            </div>
          `);
                });
            }
        });

        this.fontSelect.innerHTML = html.join('');

        // Add click and keyboard listeners
        this.fontSelect.querySelectorAll('.font-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const fontName = e.currentTarget.dataset.font;
                this.selectFont(fontName);
            });

            // Add keyboard event listener for accessibility
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    const fontName = e.currentTarget.dataset.font;
                    this.selectFont(fontName);
                }
            });
        });
    }

    async loadGoogleFont(fontFamily) {
        if (this.loadedFonts.has(fontFamily)) {
            return; // Font already loaded
        }

        try {
            // Create a link element to load the Google Font CSS
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
            link.rel = 'stylesheet';

            // Wait for the font to load
            const loadPromise = new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = reject;
            });

            document.head.appendChild(link);
            await loadPromise;

            // Mark font as loaded
            this.loadedFonts.add(fontFamily);

            console.log(`Loaded font: ${fontFamily}`);
        } catch (error) {
            console.error(`Failed to load font ${fontFamily}:`, error);
        }
    }

    async selectFont(fontFamily) {
        this.selectedFont = fontFamily;

        // Load the Google Font
        await this.loadGoogleFont(fontFamily);

        // Update visual selection
        this.fontSelect.querySelectorAll('.font-option').forEach(option => {
            option.style.background = option.dataset.font === fontFamily ? '#e3f2fd' : '';
        });

        this.selectedFontIndicator.innerHTML =
            `Currently selected: <span class="selected-font-name">${fontFamily}</span>`;

        document.documentElement.style.setProperty(
            '--font-picker-selected-font',
            `'${fontFamily}', sans-serif`
        );

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('font-selected', {
            detail: { fontFamily },
            bubbles: true,
            composed: true
        }));
    }

    showError(message) {
        this.fontSelect.innerHTML = `<div class="error">${message}</div>`;
    }

    // Public methods
    getSelectedFont() {
        return this.selectedFont;
    }

    setSelectedFont(fontFamily) {
        this.selectedFont = fontFamily;
        this.renderFontList();
    }
}

customElements.define('font-picker', FontPicker);

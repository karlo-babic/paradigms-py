document.addEventListener('DOMContentLoaded', function() {
  const themeSwitcher = {
    // A state property to hold the current theme
    currentTheme: localStorage.getItem('theme') || 'system',

    // The button element
    button: null,

    // Initialize the theme switcher
    init: function() {
      // Create the button
      this.button = document.createElement('button');
      this.button.className = 'btn js-toggle-theme';
      this.button.setAttribute('aria-label', 'Toggle theme');
      
      // Add event listener
      this.button.addEventListener('click', () => this.toggleTheme());

      // Insert the button into the header
      const siteHeader = document.querySelector('.site-header');
      if (siteHeader) {
        siteHeader.appendChild(this.button);
      }

      // Apply the theme on initial load
      this.applyTheme();
    },

    // Apply the theme to the <html> element and update the button icon
    applyTheme: function() {
      if (this.currentTheme === 'dark') {
        document.documentElement.setAttribute('data-jp-theme', 'dark');
        this.button.innerHTML = '☀️'; // Sun icon for switching to light
      } else if (this.currentTheme === 'light') {
        document.documentElement.setAttribute('data-jp-theme', 'light');
        this.button.innerHTML = '🌙'; // Moon icon for switching to dark
      } else {
        // For 'system' preference, remove the attribute to let CSS media queries work
        document.documentElement.removeAttribute('data-jp-theme');
        // Check what the system preference is to display the correct next-state icon
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.button.innerHTML = '☀️'; // System is dark, next click is light
        } else {
            this.button.innerHTML = '🌙'; // System is light, next click is dark
        }
      }
    },

    // Toggle the theme and save the preference
    toggleTheme: function() {
      const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (this.currentTheme === 'system') {
        // If current is system, switch to the opposite of the system preference
        this.currentTheme = systemPrefersDark ? 'light' : 'dark';
      } else if (this.currentTheme === 'dark') {
        this.currentTheme = 'light';
      } else {
        this.currentTheme = 'dark';
      }

      localStorage.setItem('theme', this.currentTheme);
      this.applyTheme();
    }
  };

  // Initialize the theme switcher logic
  themeSwitcher.init();
});
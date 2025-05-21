import React from 'react';
import { createRoot } from 'react-dom/client';
import reactToWebComponent from '@r2wc/react-to-web-component';
import ChatWidget from './components/ChatWidget';
import useStore from './utils/store';
import { initGlobalApi } from './utils/globalApi';

// Create a wrapper component with global styles
const GutenVibesApp = (props) => {
  // Effect to fetch and inject CSS styles from the WordPress REST API
  React.useEffect(() => {
    // Get the current shadow root
    const shadowRoot = document.querySelector('guten-vibes')?.shadowRoot;
    if (!shadowRoot) return;

    // If cssPath is provided, use it instead of fetching from the API
    if (props.cssPath) {
      const linkElem = document.createElement('link');
      linkElem.setAttribute('rel', 'stylesheet');
      linkElem.setAttribute('href', props.cssPath);
      shadowRoot.appendChild(linkElem);
      
      return () => {
        if (shadowRoot.contains(linkElem)) {
          shadowRoot.removeChild(linkElem);
        }
      };
    }

    // Create a style element for the fetched CSS
    const styleElem = document.createElement('style');
    styleElem.setAttribute('id', 'gutenvibes-styles');
    shadowRoot.appendChild(styleElem);
    
    // Determine the API URL
    // First try to get it from WordPress global variable
    let apiUrl = window?.gutenvibes?.api_url || '';
    
    // If not available, try to construct it from the current URL
    if (!apiUrl) {
      const wpUrl = window.location.origin;
      apiUrl = `${wpUrl}/wp-json/gutenvibes/v1/styles`;
    }
    
    // Fetch the CSS directly from the API
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(cssText => {
        styleElem.textContent = cssText;
      })
      .catch(error => {
        console.error('Failed to load GutenVibes styles:', error);
        // Fallback to local CSS if API fails
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', './assets/gutenvibes.css');
        shadowRoot.appendChild(linkElem);
      });

    return () => {
      // Clean up when component unmounts
      if (shadowRoot.contains(styleElem)) {
        shadowRoot.removeChild(styleElem);
      }
    };
  }, [props.cssPath]);

  return (
    <div className="guten-vibes-app">
      <ChatWidget {...props} />
    </div>
  );
};

// Create a web component from the React component
const GutenVibesElement = reactToWebComponent(GutenVibesApp, {
  shadow: 'open',
  props: {
    configId: 'string',  // Optional ID of a different config element
    theme: 'string',     // Optional theme override
    mode: 'string',      // Optional mode override (bubble, drawer, full)
    startOpen: 'boolean', // Whether to start with the chat open
    cssPath: 'string'    // Optional path to the CSS file
  },
  reactRender: { createRoot: true } // Use React 18's createRoot API
});

// Log configuration for debugging
console.log('Initializing GutenVibes web component');

// Register the custom element with a hyphen (required for valid custom element names)
customElements.define('guten-vibes', GutenVibesElement);

// Initialize the global API
const api = initGlobalApi();

// Log success message for debugging
console.log('GutenVibes web component registered successfully as guten-vibes');
console.log('Global API initialized and available as window.vibe');

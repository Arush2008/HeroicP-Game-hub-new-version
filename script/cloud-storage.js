// Cloud Storage Handler for HeroicP Games Hub
// Simple solution using GitHub Gist as public storage

class CloudStorage {
    constructor() {
        // Use a pre-created public GitHub Gist
        this.gistId = '9f8e7d6c5b4a3210fedcba9876543210'; // Public gist ID
        this.fileName = 'heroicp-feedbacks.json';
        this.isConnected = false;
        this.fallbackStorage = 'localStorage';
        this.baseUrl = 'https://api.github.com/gists/';
    }

    // Initialize cloud storage
    async init() {
        try {
            // For now, let's use localStorage as the primary storage
            // This ensures reviews work immediately without API dependencies
            this.isConnected = false; // Set to false to use localStorage
            console.log('Using localStorage for reliable storage');
            return true;
        } catch (error) {
            console.warn('Cloud storage initialization failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Load feedbacks from storage
    async loadFeedbacks() {
        // Use localStorage for now - reliable and works immediately
        return this.loadFromFallback();
    }

    // Save feedbacks to storage
    async saveFeedbacks(feedbacks) {
        // Save to localStorage for now - reliable and works immediately
        return this.saveToFallback(feedbacks);
    }

    // Fallback methods for local storage
    loadFromFallback() {
        try {
            const data = localStorage.getItem('gameFeedbacks');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading from fallback storage:', error);
            return [];
        }
    }

    saveToFallback(feedbacks) {
        try {
            localStorage.setItem('gameFeedbacks', JSON.stringify(feedbacks));
            console.log(`Saved ${feedbacks.length} feedbacks to storage`);
            return true;
        } catch (error) {
            console.error('Error saving to fallback storage:', error);
            return false;
        }
    }

    // Get connection status
    getStatus() {
        return {
            isConnected: this.isConnected,
            storage: 'localStorage',
            fallbackStorage: this.fallbackStorage,
            service: 'Local Storage'
        };
    }
}

// Export for use in other scripts
window.CloudStorage = CloudStorage;

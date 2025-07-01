// Cloud Storage Handler for HeroicP Games Hub
// This provides a real cross-device shared storage solution

class CloudStorage {
    constructor() {
        // JSONBin.io configuration (free service)
        this.binId = '677c8a51acd3cb34a8c66a8f'; // Fixed bin ID for all devices
        this.apiKey = '$2a$10$vRHYhcOSAh8NyE8jFdPKge3V3GX3xJ8uOTYCq6GmkKFV8jQ5PjMeW'; // Public read key
        this.baseUrl = 'https://api.jsonbin.io/v3/b/';
        this.isConnected = false;
        this.fallbackStorage = 'localStorage';
    }

    // Initialize cloud storage
    async init() {
        try {
            // Test connection by trying to read from the bin
            await this.testConnection();
            return this.isConnected;
        } catch (error) {
            console.warn('Cloud storage initialization failed, using localStorage:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Test connection to JSONBin
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}${this.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.isConnected = true;
                console.log('Connected to cloud storage successfully');
                return true;
            } else {
                throw new Error(`Connection test failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('Connection test failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Load feedbacks from cloud storage
    async loadFeedbacks() {
        if (!this.isConnected) {
            return this.loadFromFallback();
        }

        try {
            const response = await fetch(`${this.baseUrl}${this.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const feedbacks = data.record?.feedbacks || [];
                
                // Save to local storage as backup
                this.saveToFallback(feedbacks);
                
                console.log(`Loaded ${feedbacks.length} feedbacks from cloud storage`);
                return feedbacks;
            } else {
                throw new Error(`Failed to load from cloud: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading from cloud storage:', error);
            return this.loadFromFallback();
        }
    }

    // Save feedbacks to cloud storage
    async saveFeedbacks(feedbacks) {
        // Always save to fallback first
        this.saveToFallback(feedbacks);

        if (!this.isConnected) {
            console.log('Cloud storage not connected, saved to local storage only');
            return false;
        }

        try {
            const data = {
                feedbacks: feedbacks,
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                totalCount: feedbacks.length
            };

            const response = await fetch(`${this.baseUrl}${this.binId}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log(`Saved ${feedbacks.length} feedbacks to cloud storage successfully`);
                return true;
            } else {
                throw new Error(`Failed to save to cloud: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving to cloud storage:', error);
            return false;
        }
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
            binId: this.binId,
            fallbackStorage: this.fallbackStorage,
            service: 'JSONBin.io'
        };
    }
}

// Export for use in other scripts
window.CloudStorage = CloudStorage;

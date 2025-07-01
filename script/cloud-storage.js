// Cloud Storage Handler for HeroicP Games Hub
// This file provides a simple cloud storage solution using GitHub Gist

class CloudStorage {
    constructor() {
        // GitHub Gist configuration
        this.gistId = null; // Will be set when first gist is created
        this.fileName = 'heroicp-feedbacks.json';
        this.githubToken = null; // Optional - for authenticated requests
        this.isConnected = false;
        this.fallbackStorage = 'localStorage';
    }

    // Initialize cloud storage
    async init() {
        try {
            // Try to load existing gist ID from localStorage
            const savedGistId = localStorage.getItem('heroicp_gist_id');
            if (savedGistId) {
                this.gistId = savedGistId;
                await this.testConnection();
            }
            
            if (!this.isConnected) {
                // Create new gist if none exists
                await this.createGist();
            }
            
            return this.isConnected;
        } catch (error) {
            console.warn('Cloud storage initialization failed, using localStorage:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Test connection to existing gist
    async testConnection() {
        if (!this.gistId) return false;
        
        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
            if (response.ok) {
                this.isConnected = true;
                return true;
            }
        } catch (error) {
            console.warn('Connection test failed:', error);
        }
        
        this.isConnected = false;
        return false;
    }

    // Create a new public gist
    async createGist() {
        try {
            const initialData = {
                feedbacks: [],
                created: new Date().toISOString(),
                version: '1.0'
            };

            const gistData = {
                description: 'HeroicP Games Hub - Player Feedbacks',
                public: true,
                files: {
                    [this.fileName]: {
                        content: JSON.stringify(initialData, null, 2)
                    }
                }
            };

            const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            if (this.githubToken) {
                headers['Authorization'] = `token ${this.githubToken}`;
            }

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                this.gistId = result.id;
                localStorage.setItem('heroicp_gist_id', this.gistId);
                this.isConnected = true;
                console.log('Cloud storage initialized with gist:', this.gistId);
                return true;
            } else {
                throw new Error(`Failed to create gist: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to create gist:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Load feedbacks from cloud
    async loadFeedbacks() {
        if (!this.isConnected || !this.gistId) {
            return this.loadFromFallback();
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files[this.fileName]?.content;
                if (fileContent) {
                    const data = JSON.parse(fileContent);
                    return data.feedbacks || [];
                }
            }
        } catch (error) {
            console.error('Error loading from cloud:', error);
        }

        return this.loadFromFallback();
    }

    // Save feedbacks to cloud
    async saveFeedbacks(feedbacks) {
        // Always save to fallback first
        this.saveToFallback(feedbacks);

        if (!this.isConnected || !this.gistId) {
            return false;
        }

        try {
            const data = {
                feedbacks: feedbacks,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };

            const gistData = {
                files: {
                    [this.fileName]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            };

            const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            if (this.githubToken) {
                headers['Authorization'] = `token ${this.githubToken}`;
            }

            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                console.log('Feedbacks saved to cloud successfully');
                return true;
            } else {
                throw new Error(`Failed to update gist: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
            return false;
        }
    }

    // Fallback methods
    loadFromFallback() {
        try {
            return JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
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

    // Get status
    getStatus() {
        return {
            isConnected: this.isConnected,
            gistId: this.gistId,
            fallbackStorage: this.fallbackStorage
        };
    }
}

// Export for use in other scripts
window.CloudStorage = CloudStorage;

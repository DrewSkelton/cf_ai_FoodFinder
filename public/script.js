// Food Finder Web App JavaScript

class FoodFinderApp {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
        this.currentSearchData = null;
        this.loadingInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('foodSearchForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // New search button
        const newSearchBtn = document.getElementById('newSearchButton');
        newSearchBtn.addEventListener('click', () => this.resetToSearch());

        // Retry button
        const retryBtn = document.getElementById('retryButton');
        retryBtn.addEventListener('click', () => this.retrySearch());

        // Real-time form validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateForm());
        });
    }

    setupFormValidation() {
        this.validateForm();
    }

    validateForm() {
        const locationInput = document.getElementById('location');
        const searchButton = document.getElementById('searchButton');
        
        const isValid = locationInput.value.trim().length > 0;
        searchButton.disabled = !isValid;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const searchData = {
            location: formData.get('location').trim(),
            cuisine: formData.get('cuisine') || undefined,
            priceRange: formData.get('priceRange') || undefined,
            dietaryRestrictions: formData.get('dietaryRestrictions').trim() || undefined
        };

        this.currentSearchData = searchData;
        await this.performSearch(searchData);
    }

    async performSearch(searchData) {
        try {
            this.showLoading();
            this.startLoadingAnimation();
            
            const response = await fetch(`${this.apiBaseUrl}/food/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.result) {
                this.showResults(data.result);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message);
        } finally {
            this.stopLoadingAnimation();
        }
    }

    showLoading() {
        this.hideAllSections();
        const loadingSection = document.getElementById('loadingSection');
        loadingSection.classList.remove('hidden');
        
        // Scroll to loading section
        loadingSection.scrollIntoView({ behavior: 'smooth' });
    }

    startLoadingAnimation() {
        const progressBar = document.getElementById('loadingProgress');
        let progress = 0;
        
        this.loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90; // Don't complete until API call finishes
            progressBar.style.width = progress + '%';
        }, 200);
    }

    stopLoadingAnimation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
        
        const progressBar = document.getElementById('loadingProgress');
        progressBar.style.width = '100%';
        
        // Wait a moment before hiding loading section
        setTimeout(() => {
            const loadingSection = document.getElementById('loadingSection');
            if (!loadingSection.classList.contains('hidden')) {
                loadingSection.classList.add('hidden');
            }
        }, 500);
    }

    showResults(results) {
        this.hideAllSections();
        
        // Update results header
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsSummary = document.getElementById('resultsSummary');
        
        resultsTitle.textContent = `Food Options in ${results.location}`;
        resultsSummary.textContent = results.searchSummary;
        
        // Populate results list
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = '';
        
        if (results.searchResults && results.searchResults.length > 0) {
            results.searchResults.forEach(restaurant => {
                const restaurantCard = this.createRestaurantCard(restaurant);
                resultsList.appendChild(restaurantCard);
            });
        } else {
            resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                    <h3>No restaurants found</h3>
                    <p>Try adjusting your search criteria or location.</p>
                </div>
            `;
        }
        
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createRestaurantCard(restaurant) {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        
        const ratingStars = this.generateStarRating(restaurant.rating);
        const dietaryTags = this.createDietaryTags(restaurant.dietaryOptions);
        
        card.innerHTML = `
            <div class="restaurant-header">
                <h3 class="restaurant-name">${this.escapeHtml(restaurant.name)}</h3>
                ${restaurant.rating ? `
                    <div class="restaurant-rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="restaurant-details">
                <div class="restaurant-cuisine">
                    <i class="fas fa-globe"></i>
                    <span>${this.escapeHtml(restaurant.cuisine)}</span>
                </div>
                <div class="restaurant-price">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${this.formatPriceRange(restaurant.priceRange)}</span>
                </div>
                <div class="restaurant-address">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(restaurant.address)}</span>
                </div>
            </div>
            
            <div class="restaurant-description">
                ${this.escapeHtml(restaurant.description)}
            </div>
            
            ${dietaryTags ? `
                <div class="dietary-tags">
                    ${dietaryTags}
                </div>
            ` : ''}
        `;
        
        return card;
    }

    generateStarRating(rating) {
        if (!rating) return '';
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    createDietaryTags(dietaryOptions) {
        if (!dietaryOptions || dietaryOptions.length === 0) return '';
        
        return dietaryOptions.map(option => 
            `<span class="dietary-tag">${this.escapeHtml(option)}</span>`
        ).join('');
    }

    formatPriceRange(priceRange) {
        const priceMap = {
            'budget': 'Budget ($)',
            'moderate': 'Moderate ($$)',
            'upscale': 'Upscale ($$$)'
        };
        return priceMap[priceRange] || priceRange;
    }

    showError(message) {
        this.hideAllSections();
        
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message || 'We couldn\'t find food options at the moment. Please try again.';
        
        const errorSection = document.getElementById('errorSection');
        errorSection.classList.remove('hidden');
        
        // Scroll to error section
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    retrySearch() {
        if (this.currentSearchData) {
            this.performSearch(this.currentSearchData);
        } else {
            this.resetToSearch();
        }
    }

    resetToSearch() {
        this.hideAllSections();
        
        // Reset form
        const form = document.getElementById('foodSearchForm');
        form.reset();
        
        // Focus on location input
        const locationInput = document.getElementById('location');
        locationInput.focus();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.currentSearchData = null;
    }

    hideAllSections() {
        const sections = [
            'loadingSection',
            'resultsSection',
            'errorSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            section.classList.add('hidden');
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FoodFinderApp();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add enter key support for quick search
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const form = document.getElementById('foodSearchForm');
                if (form.checkValidity()) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    });
    
    // Add smooth scrolling for better UX
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

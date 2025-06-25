// Global variables
let currentMagnetLink = '';

// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Add enter key listener to input
    document.getElementById('torrentUrl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertToMagnet();
        }
    });
});

// Main conversion function
async function convertToMagnet() {
    const urlInput = document.getElementById('torrentUrl');
    const url = urlInput.value.trim();
    
    // Validate URL
    if (!url) {
        showError('Please enter a torrent URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    if (!url.toLowerCase().includes('.torrent')) {
        showError('URL must point to a .torrent file');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Call the API
        const response = await fetch(`/${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        // Get magnet URI from response headers
        const magnetURI = response.headers.get('magnetURI');
        
        if (!magnetURI) {
            throw new Error('No magnet URI returned from server');
        }
        
        // Try to get torrent data from response body if available
        let torrentData = null;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                torrentData = await response.json();
            }
        } catch (e) {
            console.log('No JSON data available:', e);
        }
        
        // Show results
        showResults(magnetURI, torrentData);
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError(error.message || 'Failed to convert torrent to magnet link');
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.add('loading');
}

// Show results
function showResults(magnetURI, torrentData) {
    currentMagnetLink = magnetURI;
    
    // Hide loading, show results
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    
    // Fill in magnet link
    document.getElementById('magnetLink').value = magnetURI;
    
    // Fill in torrent details if available
    if (torrentData && torrentData.torrentData) {
        displayTorrentDetails(torrentData.torrentData);
    }
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Show error
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    document.getElementById('errorMessage').textContent = message;
}

// Display torrent details
function displayTorrentDetails(torrentData) {
    const detailsContainer = document.getElementById('torrentDetails');
    detailsContainer.innerHTML = '';
    
    const details = [
        { label: 'Name', value: torrentData.name || 'N/A', icon: '📁' },
        { label: 'Created', value: torrentData.created ? new Date(torrentData.created).toLocaleDateString() : 'N/A', icon: '📅' },
        { label: 'Comment', value: torrentData.comment || 'N/A', icon: '💬' },
        { label: 'Info Hash', value: torrentData.infoHash || 'N/A', icon: '🔗' },
        { label: 'Files', value: torrentData.files ? `${torrentData.files.length} files` : 'N/A', icon: '📄' },
        { label: 'Trackers', value: torrentData.announce ? `${torrentData.announce.length} trackers` : 'N/A', icon: '🌐' }
    ];
    
    details.forEach(detail => {
        const detailElement = document.createElement('div');
        detailElement.className = 'bg-base-300 p-3 rounded-lg';
        detailElement.innerHTML = `
            <div class="flex items-center mb-2">
                <span class="text-lg mr-2">${detail.icon}</span>
                <span class="font-semibold text-sm">${detail.label}</span>
            </div>
            <div class="text-sm text-base-content/70 break-all">
                ${detail.value}
            </div>
        `;
        detailsContainer.appendChild(detailElement);
    });
}

// Copy magnet link to clipboard
async function copyMagnetLink() {
    try {
        await navigator.clipboard.writeText(currentMagnetLink);
        
        // Show success feedback
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Copied!
        `;
        copyBtn.className = 'btn btn-sm btn-success';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.className = 'btn btn-sm btn-outline';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy:', error);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentMagnetLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showToast('Magnet link copied to clipboard!');
    }
}

// Open magnet link in torrent client
function openInTorrentClient() {
    if (currentMagnetLink) {
        window.location.href = currentMagnetLink;
    }
}

// Reset form
function resetForm() {
    document.getElementById('torrentUrl').value = '';
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    currentMagnetLink = '';
    
    // Focus on input
    document.getElementById('torrentUrl').focus();
}

// Utility functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center z-50';
    toast.innerHTML = `
        <div class="alert alert-success">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Error handling for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('An unexpected error occurred. Please try again.');
});

// Service worker registration (optional, for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

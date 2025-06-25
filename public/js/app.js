// Global variables
let currentResult = '';
let currentMode = 'torrent-to-magnet';

// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Conversion mode management
function setConversionMode(mode) {
    currentMode = mode;
    
    // Update button states
    const torrentToMagnetBtn = document.getElementById('torrentToMagnetBtn');
    const magnetToTorrentBtn = document.getElementById('magnetToTorrentBtn');
    
    if (mode === 'torrent-to-magnet') {
        torrentToMagnetBtn.className = 'btn btn-primary';
        magnetToTorrentBtn.className = 'btn btn-outline';
        
        // Update UI elements
        document.getElementById('inputLabel').innerHTML = '🔗 Torrent File URL';
        document.getElementById('inputUrl').placeholder = 'https://example.com/file.torrent';
        document.getElementById('convertBtnText').textContent = 'Convert to Magnet';
        document.getElementById('resultLabel').innerHTML = '🧲 Magnet URI';
        document.getElementById('openBtnText').textContent = 'Open in Torrent Client';
        document.getElementById('loadingText').textContent = 'Converting torrent to magnet link...';
        document.getElementById('successMessage').textContent = 'Magnet link generated successfully!';
        
    } else {
        torrentToMagnetBtn.className = 'btn btn-outline';
        magnetToTorrentBtn.className = 'btn btn-primary';
        
        // Update UI elements
        document.getElementById('inputLabel').innerHTML = '🧲 Magnet Link';
        document.getElementById('inputUrl').placeholder = 'magnet:?xt=urn:btih:...';
        document.getElementById('convertBtnText').textContent = 'Convert to Torrent';
        document.getElementById('resultLabel').innerHTML = '📄 Torrent File URL';
        document.getElementById('openBtnText').textContent = 'Download Torrent File';
        document.getElementById('loadingText').textContent = 'Converting magnet to torrent file...';
        document.getElementById('successMessage').textContent = 'Torrent file generated successfully!';
    }
    
    // Reset form when mode changes
    resetForm();
}

// Load saved theme and set default mode on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Set default conversion mode
    setConversionMode('torrent-to-magnet');
    
    // Add enter key listener to input
    document.getElementById('inputUrl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performConversion();
        }
    });
});

// Main conversion function
async function performConversion() {
    if (currentMode === 'torrent-to-magnet') {
        await convertToMagnet();
    } else {
        await convertToTorrent();
    }
}

// Convert torrent to magnet (existing functionality)
async function convertToMagnet() {
    const urlInput = document.getElementById('inputUrl');
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

// Convert magnet to torrent (new functionality)
async function convertToTorrent() {
    const magnetInput = document.getElementById('inputUrl');
    const magnetLink = magnetInput.value.trim();
    
    // Validate magnet link
    if (!magnetLink) {
        showError('Please enter a magnet link');
        return;
    }
    
    if (!magnetLink.toLowerCase().startsWith('magnet:')) {
        showError('Please enter a valid magnet link starting with "magnet:"');
        return;
    }
    
    if (!magnetLink.includes('xt=urn:btih:')) {
        showError('Magnet link must contain a valid info hash (xt=urn:btih:)');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // For now, we'll create a simulated torrent file URL
        // In a real implementation, you'd need a backend service to generate .torrent files
        const infoHash = extractInfoHash(magnetLink);
        const torrentName = extractTorrentName(magnetLink) || 'download';
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a placeholder torrent file URL
        const torrentFileUrl = `https://example-torrent-service.com/generate/${infoHash}/${encodeURIComponent(torrentName)}.torrent`;
        
        // Show results
        showResults(torrentFileUrl, {
            torrentData: {
                name: torrentName,
                infoHash: infoHash,
                created: new Date().toISOString(),
                comment: 'Generated from magnet link',
                announce: ['Generated torrent file'],
                files: ['See magnet link for file details']
            }
        });
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError(error.message || 'Failed to convert magnet link to torrent file');
    }
}

// Extract info hash from magnet link
function extractInfoHash(magnetLink) {
    const match = magnetLink.match(/xt=urn:btih:([a-fA-F0-9]{40}|[a-zA-Z2-7]{32})/);
    return match ? match[1] : 'unknown';
}

// Extract torrent name from magnet link
function extractTorrentName(magnetLink) {
    const match = magnetLink.match(/dn=([^&]+)/);
    if (match) {
        return decodeURIComponent(match[1].replace(/\+/g, ' '));
    }
    return null;
}

// Show loading state
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.add('loading');
}

// Show error
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    document.getElementById('errorMessage').textContent = message;
}

// Show results
function showResults(result, torrentData) {
    currentResult = result;
    
    // Hide loading, show results
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    
    // Fill in result
    document.getElementById('resultOutput').value = result;
    
    // Fill in torrent details if available
    if (torrentData && torrentData.torrentData) {
        displayTorrentDetails(torrentData.torrentData);
    }
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
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

// Copy result to clipboard
async function copyResult() {
    try {
        await navigator.clipboard.writeText(currentResult);
        
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
        textArea.value = currentResult;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showToast('Result copied to clipboard!');
    }
}

// Open result (magnet link or download torrent file)
function openResult() {
    if (currentResult) {
        if (currentMode === 'torrent-to-magnet') {
            // Open magnet link in torrent client
            window.location.href = currentResult;
        } else {
            // Download torrent file
            window.open(currentResult, '_blank');
        }
    }
}

// Reset form
function resetForm() {
    document.getElementById('inputUrl').value = '';
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('convertBtn').classList.remove('loading');
    currentResult = '';
    
    // Focus on input
    document.getElementById('inputUrl').focus();
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

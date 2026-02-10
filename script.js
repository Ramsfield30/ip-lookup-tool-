const searchBtn = document.getElementById('searchBtn');
const ipInput = document.getElementById('ipInput');
let map = null;
let marker = null;
let mapSection = document.getElementById('map-section');

// Function to update all data fields
function updateDisplay(data) {
    document.getElementById('network').textContent = data.org || 'Not available';
    document.getElementById('city').textContent = data.city || 'Not available';
    document.getElementById('country').textContent = data.country_name || 'Not available';
    document.getElementById('timezone').textContent = data.timezone || 'Not available';
    document.getElementById('coords').textContent = data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'Not available';
    document.getElementById('zip').textContent = data.postal || 'Not available';
    
    // Show map if coordinates exist
    if (data.latitude && data.longitude) {
        showMapSection();
        updateMap(
            parseFloat(data.latitude), 
            parseFloat(data.longitude), 
            data.city || 'Unknown Location',
            data.country_name || ''
        );
    } else {
        hideMapSection();
    }
}

// Function to show loading state
function showLoading() {
    const fields = ['network', 'city', 'country', 'timezone', 'coords', 'zip'];
    fields.forEach(id => {
        document.getElementById(id).textContent = 'Loading...';
    });
    hideMapSection();
}

// Show/hide map section
function showMapSection() {
    if (mapSection) {
        mapSection.style.display = 'block';
    }
}

function hideMapSection() {
    if (mapSection) {
        mapSection.style.display = 'none';
    }
}

// MAP FUNCTIONS
function initMap() {
    if (!map) {
        // Create map with dark theme
        map = L.map('map', {
            zoomControl: true,
            attributionControl: false
        });
        
        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO',
            maxZoom: 19
        }).addTo(map);
        
        // Add custom attribution
        L.control.attribution({
            position: 'bottomright'
        }).addTo(map).addAttribution('IP Lookup Tool');
    }
    return map;
}

function updateMap(lat, lng, city, country) {
    // Initialize map if needed
    const mapInstance = initMap();
    
    // Set view to coordinates
    mapInstance.setView([lat, lng], 12);
    
    // Remove existing marker
    if (marker) {
        mapInstance.removeLayer(marker);
    }
    
    // Create custom icon
    const customIcon = L.divIcon({
        html: '<i class="fas fa-map-marker-alt" style="color: #ff00ff; font-size: 30px; text-shadow: 0 0 10px #ff00ff;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        className: 'custom-marker'
    });
    
    // Add new marker
    marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
    
    // Create popup content
    const popupContent = `
        <div style="text-align: center; padding: 10px;">
            <h3 style="margin: 0; color: #00ffff;">📍 ${city}</h3>
            <p style="margin: 5px 0; color: #666;">${country}</p>
            <hr style="margin: 8px 0;">
            <p style="margin: 5px 0;">
                <strong>Latitude:</strong> ${lat.toFixed(4)}<br>
                <strong>Longitude:</strong> ${lng.toFixed(4)}
            </p>
            <a href="https://www.google.com/maps?q=${lat},${lng}" 
               target="_blank" 
               style="display: inline-block; margin-top: 8px; padding: 5px 10px; background: #00ffff; color: black; text-decoration: none; border-radius: 4px; font-size: 12px;">
               <i class="fas fa-external-link-alt"></i> Open in Google Maps
            </a>
        </div>
    `;
    
    // Bind popup to marker
    marker.bindPopup(popupContent).openPopup();
    
    // Add circle for accuracy indication
    L.circle([lat, lng], {
        color: '#00ffff',
        fillColor: '#00ffff',
        fillOpacity: 0.1,
        radius: 2000 // 2km radius
    }).addTo(mapInstance);
}

// Function to fetch and display IP data
function fetchIPData(ip) {
    fetch(`https://ipapi.co/${ip}/json/`)
        .then(response => response.json())
        .then(data => {
            updateDisplay(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading IP data. Please try again.');
            hideMapSection();
        });
}

// Auto-load visitor's IP when page loads
window.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    // First get the visitor's IP address
    fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const visitorIP = data.ip;
            
            // Fill the input field with visitor's IP
            ipInput.value = visitorIP;
            
            // Fetch and display the geolocation data
            fetchIPData(visitorIP);
        })
        .catch(error => {
            console.error('Error getting IP:', error);
            
            // Fallback: Try a different IP service if first fails
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    ipInput.value = data.ip;
                    fetchIPData(data.ip);
                })
                .catch(fallbackError => {
                    console.error('Fallback also failed:', fallbackError);
                    alert('Could not retrieve your IP address. Please enter one manually.');
                    hideMapSection();
                });
        });
});

// Keep the original search functionality
searchBtn.addEventListener('click', function() {
    const ipAddress = ipInput.value.trim();
    
    if (ipAddress === '') {
        alert('Please enter an IP address!');
        return;
    }
    
    showLoading();
    fetchIPData(ipAddress);
});

// Add keyboard support (Enter key to search)
ipInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});
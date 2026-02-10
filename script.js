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
    document.getElementById('coords').textContent = data.latitude && data.longitude ? 
        `${data.latitude}, ${data.longitude}` : 'Not available';
    document.getElementById('zip').textContent = data.postal || 'Not available';
    document.getElementById('isp').textContent = data.org || 'Not available';
    document.getElementById('asn').textContent = data.asn || 'Not available';
    document.getElementById('currency').textContent = data.currency || 'Not available';
    document.getElementById('calling-code').textContent = data.country_calling_code || 'Not available';


    
    // Show map if coordinates exist
    if (data.latitude && data.longitude) {
        showMapSection();
        updateMap(
            parseFloat(data.latitude), 
            parseFloat(data.longitude), 
            data.city || 'Unknown',
            data.country_name || '',
            data.org || 'Unknown ISP'
        );
    } else {
        hideMapSection();
    }
}


// Function to show loading state
function showLoading() {
    const fields = ['network', 'city', 'country', 'timezone', 'coords', 'zip'];
    fields.forEach(id => {
        document.getElementById(id).innerHTML = '<span class="loading-dots">...</span>';
    });
    hideMapSection();

}

// Show/hide map section
function showMapSection() {
    if (mapSection) {
        mapSection.style.display = 'block';
        // Refresh map size after showing
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 100);
    }
}

function hideMapSection() {
    if (mapSection) {
        mapSection.style.display = 'none';
    }
}

// LIGHT MODE MAP FUNCTIONS
function initMap() {
    if (!map) {
        // Create light mode map
        map = L.map('map', {
            zoomControl: true,
            attributionControl: true,
            fadeAnimation: true
        });
        
        // Add standard OpenStreetMap tiles (LIGHT MODE)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);
        
        // Add scale control
        L.control.scale({ imperial: false }).addTo(map);
    }
    return map;
}

function updateMap(lat, lng, city, country, isp) {
    // Initialize map if needed
    const mapInstance = initMap();
    
    // Set view to coordinates
    mapInstance.setView([lat, lng], 12);
    
    // Remove existing marker
    if (marker) {
        mapInstance.removeLayer(marker);
    }
    
    // Create BLUE marker (visible on light map)
    const customIcon = L.divIcon({
        html: '<div style="background: #0066ff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,102,255,0.7);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    // Add new marker
    marker = L.marker([lat, lng], { 
        icon: customIcon,
        title: `${city}, ${country}`
    }).addTo(mapInstance);
    
    // Create popup content
    const popupContent = `
        <div style="min-width: 200px; font-family: Arial, sans-serif;">
            <div style="background: #0066ff; color: white; padding: 8px; border-radius: 5px; margin-bottom: 8px;">
                <strong><i class="fas fa-map-pin"></i> ${city}</strong>
            </div>
            <p style="margin: 4px 0;"><strong>Country:</strong> ${country}</p>
            <p style="margin: 4px 0;"><strong>ISP:</strong> ${isp.substring(0, 40)}${isp.length > 40 ? '...' : ''}</p>
            <p style="margin: 4px 0;"><strong>Lat:</strong> ${lat.toFixed(6)}</p>
            <p style="margin: 4px 0;"><strong>Lng:</strong> ${lng.toFixed(6)}</p>
            <div style="margin-top: 10px; display: flex; gap: 5px;">
                <a href="https://maps.google.com/?q=${lat},${lng}" 
                   target="_blank" 
                   style="flex: 1; text-align: center; padding: 6px; background: #0066ff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                   Google Maps
                </a>
                <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}" 
                   target="_blank" 
                   style="flex: 1; text-align: center; padding: 6px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                   OSM
                </a>
            </div>
        </div>
    `;
    
    // Bind popup to marker
    marker.bindPopup(popupContent).openPopup();
    
    // Add accuracy circle
    L.circle([lat, lng], {
        color: '#0066ff',
        fillColor: '#0066ff',
        fillOpacity: 0.1,
        weight: 2,
        radius: 1500
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
            ipInput.value = visitorIP;
            fetchIPData(visitorIP);
        })
        .catch(error => {
            console.error('Error getting IP:', error);
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

// Search button click
searchBtn.addEventListener('click', function() {
    const ipAddress = ipInput.value.trim();
    if (ipAddress === '') {
        alert('Please enter an IP address!');
        return;
    }
    showLoading();
    fetchIPData(ipAddress);
});

// Enter key support
ipInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});
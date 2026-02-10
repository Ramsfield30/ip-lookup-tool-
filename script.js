const searchBtn = document.getElementById('searchBtn');
const ipInput = document.getElementById('ipInput');

// Function to update all data fields
function updateDisplay(data) {
    document.getElementById('network').textContent = data.org || 'Not available';
    document.getElementById('city').textContent = data.city || 'Not available';
    document.getElementById('country').textContent = data.country_name || 'Not available';
    document.getElementById('timezone').textContent = data.timezone || 'Not available';
    document.getElementById('coords').textContent = data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'Not available';
    document.getElementById('zip').textContent = data.postal || 'Not available';
}

// Function to show loading state
function showLoading() {
    const fields = ['network', 'city', 'country', 'timezone', 'coords', 'zip'];
    fields.forEach(id => {
        document.getElementById(id).textContent = 'Loading...';
    });
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
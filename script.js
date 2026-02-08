const searchBtn = document.getElementById('searchBtn');
const ipInput = document.getElementById('ipInput');

searchBtn.addEventListener('click', function() {
    const ipAddress = ipInput.value;
    
    if (ipAddress === '') {
        alert('Please enter an IP address!');
        return;
    }
    
    fetch(`http://ip-api.com/json/${ipAddress}`)
        .then(response => response.json())
        .then(data => {
     // Add this line
    document.getElementById('network').textContent = data.isp;
    // ... rest of code
        
            document.getElementById('city').textContent = data.city;
            document.getElementById('country').textContent = data.country;
            document.getElementById('timezone').textContent = data.timezone;
            document.getElementById('coords').textContent = data.lat && data.lon ? `${data.lat}, ${data.lon}` : 'Not available';
            document.getElementById('zip').textContent = data.zip;
        });
});
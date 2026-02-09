const searchBtn = document.getElementById('searchBtn');
const ipInput = document.getElementById('ipInput');

searchBtn.addEventListener('click', function() {
    const ipAddress = ipInput.value;
    
    if (ipAddress === '') {
        alert('Please enter an IP address!');
        return;
    }
    
    fetch(`https://ip-api.com/json/${ipAddress}`)
        .then(response => response.json())
        .then(data => {
            alert('Data received!');
            document.getElementById('network').textContent = data.isp || 'Not available';
            document.getElementById('city').textContent = data.city || 'Not available';
            document.getElementById('country').textContent = data.country || 'Not available';
            document.getElementById('timezone').textContent = data.timezone || 'Not available';
            document.getElementById('coords').textContent = data.lat && data.lon ? `${data.lat}, ${data.lon}` : 'Not available';
            document.getElementById('zip').textContent = data.zip || 'Not available';
        })
        .catch(error => {
            alert('Error: ' + error);
        });
});
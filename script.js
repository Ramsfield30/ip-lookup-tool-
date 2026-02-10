const searchBtn = document.getElementById('searchBtn');
const ipInput = document.getElementById('ipInput');

searchBtn.addEventListener('click', function() {
    const ipAddress = ipInput.value;
    
    if (ipAddress === '') {
        alert('Please enter an IP address!');
        return;
    }
    
    fetch(`https://ipapi.co/${ipAddress}/json/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('network').textContent = data.org || 'Not available';
            document.getElementById('city').textContent = data.city || 'Not available';
            document.getElementById('country').textContent = data.country_name || 'Not available';
            document.getElementById('timezone').textContent = data.timezone || 'Not available';
            document.getElementById('coords').textContent = data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'Not available';
            document.getElementById('zip').textContent = data.postal || 'Not available';
        })
        .catch(error => {
            alert('Error: ' + error);
        });
});
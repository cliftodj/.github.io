let map;
let markers = [];
let tempMarker;

function initMap() {
    console.log('Initializing map...');
    const mapElement = document.getElementById('map');
    console.log('Map element:', mapElement);
    
    if (!mapElement) {
        console.error('Map element not found!');
        return;
    }
    
    map = L.map('map').setView([37.7749, -122.4194], 12);
    console.log('Map object created:', map);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    console.log('Tile layer added to map');

    map.on('click', function(e) {
        console.log('Map clicked at:', e.latlng);
        if (tempMarker) {
            map.removeLayer(tempMarker);
        }
        tempMarker = L.marker(e.latlng).addTo(map);
        document.getElementById('restaurant-form').style.display = 'block';
        window.clickedLatLng = e.latlng;
    });

    // Load saved markers
    loadMarkers();
    console.log('Map initialization complete');
}

document.getElementById('restaurant-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const experience = document.getElementById('experience').value;
    const image = document.getElementById('image').files[0];
    const video = document.getElementById('video').files[0];

    // Check file size (limit to 5MB for this example)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (video && video.size > maxSize) {
        alert('Video file is too large. Please choose a file smaller than 5MB.');
        return;
    }

    if (image || video) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileData = event.target.result;
            addMarker(name, experience, image ? fileData : null, video ? fileData : null);
        };
        reader.readAsDataURL(image || video);
    } else {
        addMarker(name, experience, null, null);
    }

    this.reset();
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
});

function addMarker(name, experience, imageData, videoData) {
    const marker = L.marker(window.clickedLatLng).addTo(map);
    markers.push(marker);

    const firstThreeWords = experience.split(' ').slice(0, 3).join(' ');
    const markerText = `${name}: ${firstThreeWords}...`;

    marker.bindTooltip(markerText, {permanent: true, direction: 'top'}).openTooltip();

    let popupContent = `<h3>${name}</h3><p>${experience}</p>`;
    
    if (imageData) {
        popupContent += `<img src="${imageData}" alt="${name}" style="max-width: 200px;">`;
    }

    if (videoData) {
        popupContent += `
            <video controls style="max-width: 200px;">
                <source src="${videoData}" type="video/quicktime">
                Your browser does not support the video tag or the file format of this video.
            </video>`;
    }

    marker.bindPopup(popupContent);

    // Save marker data
    saveMarker({
        name,
        experience,
        lat: window.clickedLatLng.lat,
        lng: window.clickedLatLng.lng,
        imageData,
        videoData
    });
}

function saveMarker(markerData) {
    let markers = JSON.parse(localStorage.getItem('markers')) || [];
    markers.push(markerData);
    localStorage.setItem('markers', JSON.stringify(markers));
}

function loadMarkers() {
    let savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    savedMarkers.forEach(markerData => {
        const marker = L.marker([markerData.lat, markerData.lng]).addTo(map);
        markers.push(marker);

        const firstThreeWords = markerData.experience.split(' ').slice(0, 3).join(' ');
        const markerText = `${markerData.name}: ${firstThreeWords}...`;

        marker.bindTooltip(markerText, {permanent: true, direction: 'top'}).openTooltip();

        let popupContent = `<h3>${markerData.name}</h3><p>${markerData.experience}</p>`;
        
        if (markerData.imageData) {
            popupContent += `<img src="${markerData.imageData}" alt="${markerData.name}" style="max-width: 200px;">`;
        }

        if (markerData.videoData) {
            popupContent += `<video src="${markerData.videoData}" controls style="max-width: 200px;"></video>`;
        }

        marker.bindPopup(popupContent);
    });
}

// Make sure the map is initialized after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initMap();
});

// Map creation
var mainMap = L.map('mainMap').setView([32.0795, 34.7812], 14);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaWRvY28iLCJhIjoiY2ptM2JnbW5lMGN6czN2bW14NXUzMGZ2YyJ9.xIvjUlL3cPhak8p0ucOnxg'
}).addTo(mainMap);

let currentMarkerGroup; // the currently displayed marker layer 

async function fetchWithCors(url) {
    return await fetch('https://cors.io/?' + url);
}

async function loadBikes(url) {
    let response = await fetchWithCors(url + '?time=' + Date.now());
    let freeBikes = await response.json();
    return freeBikes.data.bikes;
}

async function showBikes(bikes) {
    let markers = [];
    for (let i in bikes) {
        let bike = bikes[i];
        let marker = L.marker([bike.lat, bike.lon])
            .bindPopup(
                `bike_id: ${bike.bike_id}<br/>
                is_disabled: ${!!bike.is_disabled}
                <br/>is_reserved: ${!!bike.is_reserved}
                <br/>vehicle_type: ${bike.vehicle_type || 'unknown'}`
            );
        markers.push(marker);
    }

    currentMarkerGroup = L.featureGroup(markers).addTo(mainMap);
    mainMap.fitBounds(currentMarkerGroup.getBounds());
}

async function loadCsv(url) {
    let response = await fetch(url);
    let rawCsv = await response.text()
    let csv = $.csv.toArrays(rawCsv)
    csv.shift() // remove header row
    csv.unshift(["IL", "Bird gbfs", "Tel Aviv", "BIRD_TLV", "bird.co", 'https://mds.bird.co/gbfs']); // Add bird 
    return csv;
}

async function main() {

    let csv = await loadCsv('https://raw.githubusercontent.com/NABSA/gbfs/master/systems.csv');

    var selectSystem = document.getElementById("select-system");

    for (let i in csv) {
        let opt = csv[i][1];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectSystem.appendChild(el);
    }

    selectSystem.addEventListener("change", async () => {
        const selectedIndex = document.getElementById("select-system").selectedIndex;
        const systemUrl = csv[selectedIndex][5];

        let response = await fetchWithCors(systemUrl + '?time=' + Date.now());
        let systemData = await response.json();

        if (systemData.data && systemData.data.en.feeds) {
            const feeds = systemData.data.en.feeds;
            for (let i in feeds) {
                if (feeds[i].name == 'free_bike_status' || feeds[i].name == 'free_bikes') {
                    freeBikesUrl = feeds[i].url;
                    break;
                }
            }

            mainMap.removeLayer(currentMarkerGroup);
            let bikes = await loadBikes(freeBikesUrl);
            await showBikes(bikes)
        }

    });

    // Load bird Tel aviv on launch
    let bikes = await loadBikes('https://mds.bird.co/gbfs/tel-aviv/free_bikes');
    let displayedMarkers = await showBikes(bikes)
}

main();

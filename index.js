
var mainMap = L.map('mainMap').setView([32.0795, 34.7812], 14);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaWRvY28iLCJhIjoiY2ptM2JnbW5lMGN6czN2bW14NXUzMGZ2YyJ9.xIvjUlL3cPhak8p0ucOnxg'
}).addTo(mainMap);

async function loadBikes(url) {
    let response = await fetch(url + '?time=' + Date.now());
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
                <br/>is_reserved: ${!!bike.is_reserved}`
            );
        markers.push(marker);
    }

    var group = L.featureGroup(markers).addTo(mainMap);
    mainMap.fitBounds(group.getBounds());

}

async function main(url) {
    let bikes = await loadBikes('https://mds.bird.co/gbfs/tel-aviv/free_bikes');
    showBikes(bikes)
}

main();

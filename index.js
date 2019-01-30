
var mainMap = L.map('mainMap').setView([32.0795, 34.7812], 14);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaWRvY28iLCJhIjoiY2ptM2JnbW5lMGN6czN2bW14NXUzMGZ2YyJ9.xIvjUlL3cPhak8p0ucOnxg'
}).addTo(mainMap);

async function foo() {

    let response = await fetch('https://mds.bird.co/gbfs/tel-aviv/free_bikes');
    let freeBikes = await response.json();

    let markers = [];
    let bikes = freeBikes.data.bikes;
    for (let i in bikes) {
        let bike = bikes[i];
        let marker = L.marker([bike.lat, bike.lon]);
        markers.push(marker);
    }

    var group = L.featureGroup(markers).addTo(mainMap);
    mainMap.fitBounds(group.getBounds());

}

foo();
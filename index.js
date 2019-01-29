
var mainMap = L.map('mainMap').setView([32.0795, 34.7812], 14);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaWRvY28iLCJhIjoiY2ptM2JnbW5lMGN6czN2bW14NXUzMGZ2YyJ9.xIvjUlL3cPhak8p0ucOnxg'
}).addTo(mainMap);

async function foo() {

    // read our JSON
    let response = await fetch('https://mds.bird.co/gbfs/tel-aviv/free_bikes');
    let user = await response.json();

}

foo();
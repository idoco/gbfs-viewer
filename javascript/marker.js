


let currentMarkerGroup; // the currently displayed marker layer 
let currentBikesUrl = "https://mds.bird.co/gbfs/tel-aviv/free_bikes";
let currentStationsUrl = false;

// Some GBFS systems do not support cross origin requests
async function fetchWithCors(url) {
    try{
    return await fetch('https://cors.idoco.workers.dev/?' + url);
    }catch(e){
        alert("The GBFS URL is invalid")
        return false;
    }
}

async function loadBikes(url) {
    const response = await fetchWithCors(url + '?time=' + Date.now());
    const freeBikes = await response.json();
    return freeBikes.data.bikes;
}

async function loadStations(url) {
    const response = await fetchWithCors(url);
    const stations = await response.json();
    return stations.data.stations;
}

async function refreshBikes(currentBikeUrl) {
    document.getElementById("loader").style.display = "block"
    let stations = false;
    try {
        if (currentMarkerGroup) { // clear current markers before showing new
            map.removeLayer(currentMarkerGroup);
        }
        if (currentStationsUrl !== false) {
            stations = await loadStations(currentStationsUrl);
            stations.map(station => station.bikes = [])
        }
        const bikes = await loadBikes(currentBikeUrl);
        await showAllBikes(bikes, stations)
    } catch (e) {
        console.error(e);
    }
    document.getElementById("loader").style.display = "none";
}


async function showAllBikes(bikes, stations) {
    const markers = [];
    const stationBikes = bikes.filter(bike => bike.station_id !== undefined);
    const otherBikes = bikes.filter(bike => bike.station_id == undefined);

    if (stations !== false)
        createStationMarker(stations, markers, stationBikes);
    createBikeMarker(otherBikes, markers);

    document.getElementById('bike-count').textContent = bikes.length || 'N/A'

    currentMarkerGroup = L.featureGroup(markers).addTo(map);
    map.fitBounds(currentMarkerGroup.getBounds());
}

function createBikeMarker(otherBikes, markers) {
    otherBikes.map(bike => {
        L.Icon.Default.prototype.options.iconSize = [25, 41];
        const marker = L.marker([bike.lat, bike.lon])
            .bindPopup(
                `bike_id: ${bike.bike_id} <br />
                is_disabled: ${!!bike.is_disabled}
                <br />is_reserved: ${!!bike.is_reserved}
                <br />vehicle_type: ${bike.vehicle_type || 'unknown'} `
            );
        markers.push(marker);
    })
}

function createStationMarker(stations, markers, stationBikes) {
    stationBikes.map(stationBike => {
        const station = stations.find(station => station.station_id == stationBike.station_id);
        if (station.bikes == undefined) station.bikes = [];
        station.bikes.push(stationBike);
    });
    var stationIcon = new L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    stations.map(station => {
        let bikeDescriptions = "<br/>bikes_in_station:";
        station.bikes.map(bike => {
            bikeDescriptions +=
                "<br/><br />bike_id: "
                + bike.bike_id
                + "<br />is_disabled: "
                + bike.is_disabled
                + "<br/>is_reserved: "
                + bike.is_reserved
                + "<br/>vehicle_type: "
                + bike.vehicle_type || 'unknown';
        })

        const marker = L.marker([station.lat, station.lon], { icon: stationIcon })
            .bindPopup(
                `name: ${station.name}
                <br />station_id: ${station.station_id}
                <br />num_bikes_available: ${station.bikes.length}
                ${bikeDescriptions}
            `);
        markers.push(marker);
    })

    return markers
}

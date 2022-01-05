// Map creation
var map = L.map('map');

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiaWRvY28iLCJhIjoiY2ptM2JnbW5lMGN6czN2bW14NXUzMGZ2YyJ9.xIvjUlL3cPhak8p0ucOnxg'
}).addTo(map);

async function loadCsv(url) {
    let response = await fetch(url);
    let rawCsv = await response.text()
    let csv = $.csv.toArrays(rawCsv)
    csv.shift() // remove csv header row
    csv.unshift(["IL", "Bird gbfs", "Tel Aviv", "BIRD_TLV", "bird.co", 'https://mds.bird.co/gbfs']); // Add bird 
    return csv;
}

function addEventListeners() {
    const durationInput = document.getElementById("duration-input");
    durationInput.addEventListener("change", async => {
        currentPricingOptions.currentDuration = durationInput.value;
        refreshPricing(currentPricingOptions);
    });

    document.getElementById("refresh-button").addEventListener('click', () => {
        refreshBikes(currentBikesUrl);
    });

    const selectPricingPlan = document.getElementById("select-pricing-plan");
    selectPricingPlan.addEventListener("change", async => {
        selectedPricingIndex = selectPricingPlan.value;
        refreshPricing(currentPricingOptions);
    });

    const distanceInput = document.getElementById("distance-input");
    distanceInput.addEventListener("change", async => {
        currentPricingOptions.currentDistance = distanceInput.value;
        refreshPricing(currentPricingOptions)
    })

    const selectCustomSystemForm = document.getElementById("submit-custom-system");
    selectCustomSystemForm.addEventListener("click", async() => {
        document.getElementById("loader").style.display = "block"
        const systemUrl = document.getElementById("custom-system-input").value;
        const systemUrlResponse = await fetchWithCors(systemUrl + '?time=' + Date.now());

        if(systemUrlResponse === false){
            const systemUrl = document.getElementById("custom-system-input").value = " "
            document.getElementById("loader").style.display = "none";
            return false
        }

        const systemData = await systemUrlResponse.json();
        console.log(systemData);
        updateContent(systemData)
    })
}

async function main() {
    const csv = await loadCsv('https://raw.githubusercontent.com/NABSA/gbfs/master/systems.csv');
    const selectSystem = document.getElementById("select-system");

    for (const i in csv) {
        const opt = csv[i][1];
        const el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectSystem.appendChild(el);
    }

    selectSystem.addEventListener("change", async () => {
        document.getElementById("loader").style.display = "block"

        const selectedIndex = document.getElementById("select-system").selectedIndex;
        const systemUrl = csv[selectedIndex][5];
        console.log(systemUrl);
        const systemUrlResponse = await fetchWithCors(systemUrl + '?time=' + Date.now());

        const systemData = await systemUrlResponse.json();

        updateContent(systemData);
    });

    addEventListeners();

    // Load bird Tel aviv on launch
    await refreshBikes('https://mds.bird.co/gbfs/tel-aviv/free_bikes');
    await refreshPricing(currentPricingOptions);
}

function updateContent(systemData) {
    if (systemData.data) {
        const feedKey = Object.keys(systemData.data)[0];
        const feeds = systemData.data[feedKey].feeds;
        currentStationsUrl = false;
        currentPricingOptions.currentPricingUrl = false;

        feeds.map(feed => {
            if (feed.name == 'station_information') {
                currentStationsUrl = feed.url;
            } else if (feed.name == 'system_pricing_plans') {
                currentPricingOptions.currentPricingUrl = feed.url;
                currentPricingOptions.selectedPricingIndex = 0;
            }
        });
        feeds.map(async (feed) => {
            if (feed.name == 'free_bike_status' || feed.name == 'free_bikes') {
                currentBikesUrl = feed.url;
                await refreshBikes(currentBikesUrl);
                refreshPricing(currentPricingOptions);
            }

        });
        document.getElementById("loader").style.display = "none";
    }
}

main();

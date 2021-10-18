
currentPricingOptions = {
    currentPricingUrl: false,
    currentDuration: 0,
    currentDistance: 0,
    selectedPricingIndex: 0
}

async function loadPricingPlans(url) {
    const response = await fetch('https://cors.idoco.workers.dev/?' + url)
    const pricing = await response.json();
    return pricing.data.plans;
}

async function pricingWentWrong(reason) {
    const pricingSection = document.getElementById('pricing');
    const noPricingPlanFound = document.getElementById('no-pricing-plan-found')
    pricingSection.style.display = 'none';
    noPricingPlanFound.textContent = reason
    noPricingPlanFound.style.display = 'block';
}

async function pricingOK() {
    const noPricingPlanFound = document.getElementById('no-pricing-plan-found')
    const pricingSection = document.getElementById('pricing');
    noPricingPlanFound.style.display = 'none';
    pricingSection.style.display = 'block';
}

async function setPricingOptions(pricingPlans, pricingIndex) {
    const selectPricingPlan = document.getElementById('select-pricing-plan');
    while (selectPricingPlan.lastChild) {
        selectPricingPlan.removeChild(selectPricingPlan.lastChild);
    }

    for (const pricingPlanIndex in pricingPlans) {
        const opt = pricingPlans[pricingPlanIndex].name;
        const el = document.createElement("option");
        el.textContent = opt;
        el.value = pricingPlanIndex;
        selectPricingPlan.appendChild(el);
    }
    selectPricingPlan.value = pricingIndex;
}

async function refreshPricing({
    currentPricingUrl,
    currentDuration,
    currentDistance,
    selectedPricingIndex }) {
    if (currentPricingUrl == false) {
        pricingWentWrong("no pricing URL found");
        return;
    }

    const pricingPlans = await loadPricingPlans(currentPricingUrl);
    pricingOK();
    setPricingOptions(pricingPlans, selectedPricingIndex);
    const pricingPlan = pricingPlans[selectedPricingIndex];
    let price = 0;
    if (pricingPlan == undefined) {
        pricingWentWrong("no valid per pricing plan found");
        return;
    }
    else if (pricingPlan.per_min_pricing !== undefined) {
        price += await getGbfsPricePerMin(pricingPlan, currentDuration)
    } if (pricingPlan.per_km_pricing !== undefined) {
        price += await getGbfsPricePerKm(pricingPlan, currentDistance)
    }
    price += pricingPlan.price;
    document.getElementById("price").textContent = price + pricingPlan.currency;
}
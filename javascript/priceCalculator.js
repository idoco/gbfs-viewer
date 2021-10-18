

function getDurationInSegment(segment, duration) {
    if (segment.end < duration && segment.end !== undefined) {
        return segment.end - segment.start
    } else if (segment.start <= duration) {
        return duration - segment.start;
    } else if (segment.start > duration) {
        return null;
    }
}

function getPriceInSegment(segment, duration) {
    minInSegment = getDurationInSegment(segment, duration);
    if (minInSegment !== null) {
        let rateApplyCount = 0;
        if (segment.interval !== 0) {
            let overlappingDurationCharged = segment.start;
            while (
                (overlappingDurationCharged < segment.end || segment.end == undefined)
                &&
                overlappingDurationCharged <= duration) {
                overlappingDurationCharged += segment.interval;
                rateApplyCount++;
            }
        } else {
            rateApplyCount = 1;
        }
        const priceInSegment = rateApplyCount * segment.rate;
        return priceInSegment
    }
    return 0;
}

async function getGbfsPricePerMin(pricingPlan, duration) {
    let price = 0;
    pricingPlan.per_min_pricing.map(segment => price += getPriceInSegment(segment, duration))
    return price;
}

async function getGbfsPricePerKm(pricingPlan, duration) {
    const price = 0;
    pricingPlan.per_km_pricing.map(segment => getPriceInSegment(segment, duration))
    return price;
}
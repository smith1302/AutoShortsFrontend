export default {
    showProductDetailsTooltip,
    showGeniusEditorNotesTooltip,
    showGeniusEditorAutocompleteTooltip,
    markGeniusEditorAutocompleteTooltipAsSeen,
    showGeniusEditorSideBarDot,
    markGeniusEditorSideBarDotAsSeen,
};

function showProductDetailsTooltip() {
    return _showTooltip('productDetailsTooltip', 3)
}

function showGeniusEditorNotesTooltip() {
    return _showTooltip('geniusEditorNotesInitialOpen', 2)
}

function _showTooltip(key, maxSeenTimes) {
    if (!process.browser) return false;
    const numTimesSeen = parseFloat(localStorage.getItem(key) || 0);
    if (numTimesSeen < maxSeenTimes) {
        localStorage.setItem(key, numTimesSeen + 1);
    }
    return numTimesSeen < maxSeenTimes;
}

/* ==== */

function showGeniusEditorSideBarDot() {
    return !localStorage.getItem('geniusEditorSideBarDot');
}

function markGeniusEditorSideBarDotAsSeen() {
    localStorage.setItem('geniusEditorSideBarDot', true);
}

/* ==== */

function showGeniusEditorAutocompleteTooltip() {
    return _showTooltip('geniusEditorAutocompleteTooltip', 5)
}

function markGeniusEditorAutocompleteTooltipAsSeen() {
    localStorage.setItem('geniusEditorAutocompleteTooltip', true);
}
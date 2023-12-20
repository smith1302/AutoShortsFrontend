import FetchWrapper from '~/src/Services/FetchWrapper';
import Cookies from 'js-cookie'

export default {
    logClick,
    setAffiliateTracker,
    getAffiliateTracker
};

async function logClick(affiliateID) {
    try {
        return FetchWrapper.post(`/api/affiliate/click`, { affiliateID });
    } catch (err) {}
}

/* Cookie Tracking */

const AFFILIATE_COOKIE_NAME = "affref";

function setAffiliateTracker(affiliateID) {
    Cookies.set(AFFILIATE_COOKIE_NAME, affiliateID, { expires: 30 })
}

function getAffiliateTracker() {
    return Cookies.get(AFFILIATE_COOKIE_NAME);
}
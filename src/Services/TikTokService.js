import TiktokPixel from 'tiktok-pixel';
const sha256 = require('js-sha256');
import UserService from '~/src/Services/UserService';

export default {
    pageview,
    register,
    initiateCheckout,
    purchase,
    viewContent
};

function pageview() {
    init();
    TiktokPixel.pageView();
}

function viewContent(contentName) {
    TiktokPixel.track('ViewContent', {
        "contents": [{
          "content_name": contentName
        }],
    }); 
}

async function register() {
    TiktokPixel.track('CompleteRegistration'); 
}

async function initiateCheckout() {
    TiktokPixel.track('InitiateCheckout'); 
}

async function purchase(value) {
    const data = {
        "contents": [{
          "content_type": "product"
        }],
        "currency": "USD"
    }
    if (value) {
        data.value = value;
    }

    TiktokPixel.track('CompletePayment', data); 
}

function init() {
    const user = UserService.currentUser();
    const advancedMatching = {
    };
    if (user && user.email) {
        advancedMatching.email = user.email.trim().toLowerCase()
    }
    if (user && user.id) {
        advancedMatching.external_id = sha256(user.id.toString());
    }
    TiktokPixel.init('REPLACEME', advancedMatching, {});
}
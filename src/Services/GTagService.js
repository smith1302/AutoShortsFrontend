export default {
    pageview,
    register,
    initiateCheckout,
    purchase
};

async function pageview() {
    await getInitializedInstance();
    // const url = window.location.pathname + window.location.search;
    // ReactGA.send({ hitType: "pageview", page: url, title: "Custom Title" });
}

async function register() {
    const ReactGA = await getInitializedInstance();
    ReactGA.event({
        category: 'User',
        action: 'Created an Account'
    });
}

async function initiateCheckout() {
    const ReactGA = await getInitializedInstance();
    ReactGA.event({
        category: 'Checkout',
        action: 'Initiate Checkout'
    });
}

async function purchase(value) {
    const ReactGA = await getInitializedInstance();
    const params = {
        category: 'Checkout',
        action: 'Purchase'
    }
    if (value) {
        params.value = value;
    }
    ReactGA.event(params);
}

async function getInitializedInstance() {
    return new Promise((resolve, reject) => {
        import('react-ga4')
        .then((x) => x.default)
        .then((ReactGA) => {
            ReactGA.initialize('REPLACE_ME_WITH_YOUR_GTAG_ID');
            resolve(ReactGA);
        });
    });
}
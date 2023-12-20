import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    redirectToOAuth
};

async function redirectToOAuth() {
    return FetchWrapper.get(`/api/auth/tiktok/authStart`);
}
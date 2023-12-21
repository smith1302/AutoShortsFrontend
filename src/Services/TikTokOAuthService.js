import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    getOAuthURL
};

async function getOAuthURL() {
    return FetchWrapper.get(`/api/auth/tiktok/authStart`);
}
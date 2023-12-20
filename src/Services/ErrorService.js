import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    reportError
};

async function reportError(error, name) {
    return FetchWrapper.post(`/api/reportError`, { error, name });
}
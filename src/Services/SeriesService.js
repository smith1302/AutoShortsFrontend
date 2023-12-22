import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    get,
    getAll,
    create,
    getSample
};

async function getAll() {
    return FetchWrapper.get(`/api/series`);
}

async function get({seriesID}) {
    return FetchWrapper.get(`/api/series/${seriesID}`);
}

async function create({contentTypeID, customPrompt, voiceID, accountID}) {
    return FetchWrapper.post(`/api/series/create`, {contentTypeID, customPrompt, voiceID, accountID});
}

async function getSample({sampleDetails}) {
    return FetchWrapper.post(`/api/series/sample`, {sampleDetails});
}
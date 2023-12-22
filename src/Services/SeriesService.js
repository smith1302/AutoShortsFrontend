import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    create,
    getSample
};

async function create({contentTypeID, customPrompt, voiceID, accountID}) {
    return FetchWrapper.post(`/api/series/create`, {contentTypeID, customPrompt, voiceID, accountID});
}

async function getSample({sampleDetails}) {
    return FetchWrapper.post(`/api/series/sample`, {sampleDetails});
}
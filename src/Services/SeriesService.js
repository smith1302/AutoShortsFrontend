import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    get,
    getAll,
    create,
    getSample,
    updateVideo,
    updateSeries,
    deleteSeries
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

async function updateVideo({videoID, title, caption, script}) {
    return FetchWrapper.put(`/api/series/video/${videoID}`, {title, caption, script});
}

async function updateSeries({seriesID, privacy, duetDisabled, stitchDisabled, commentDisabled, openID}) {
    return FetchWrapper.put(`/api/series/${seriesID}`, {privacy, duetDisabled, stitchDisabled, commentDisabled, openID});
}

async function deleteSeries({seriesID}) {
    return FetchWrapper.delete(`/api/series/${seriesID}`);
}

async function getSample({sampleDetails}) {
    return FetchWrapper.post(`/api/series/sample`, {sampleDetails});
}
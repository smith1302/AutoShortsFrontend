import FetchWrapper from '~/src/Services/FetchWrapper';

export default {
    create
};

async function create({contentTypeID, contentDetails, voiceID}) {
    return FetchWrapper.post(`/api/series/create`, {contentTypeID, contentDetails, voiceID});
}
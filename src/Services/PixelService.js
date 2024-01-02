import FetchWrapper from '~/src/Services/FetchWrapper';
import UserService from '~/src/Services/UserService';

export default {
    logPixel
};

async function logPixel(event, data={}, eventID=null) {
    // If user passes in eventID, custom logic to make sure that event is only logged once
    if (eventID) {
        if (getLocalStorageItem(eventID)) return;
        setLocalStorageItem(eventID, true);
    }

    return new Promise((resolve, reject) => {
        import("@bettercart/react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
            // Manual event matching (https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching)
            const email = getEmail(UserService.currentUser());
            const userID = getUserID(UserService.currentUser());

            data.em = email;
            data.external_id = userID;

            if (!eventID) {
                eventID = `${Date.now()}${Math.floor(Math.random() * Date.now())}`;
            }
            ReactPixel.init('921770102173440', {}, { debug: true, autoConfig: true });
            ReactPixel.track(event, data, {eventID: eventID});

            FetchWrapper.post(`/api/fbpixel`, { event, eventID, email, userID });

            resolve();
        });
    });
}

const getUserID = (user) => {
    if (!user || !user.id) return null;
    return user.id;
}

const getEmail = (user) => {
    if (!user || !user.email) return null;
    return user.email.trim().toLowerCase();
}

function getLocalStorageItem(key) {
    if (!process.browser) return null;
    return localStorage.getItem(key);
}

function setLocalStorageItem(key, value) {
    if (!process.browser) return null;
    return localStorage.setItem(key, value);
}
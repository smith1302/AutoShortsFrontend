import globals from '~/src/globals';

const sha256 = require('js-sha256');
const bizSdk = require('facebook-nodejs-business-sdk');
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const CustomData = bizSdk.CustomData;

export default class FBPixel {
    static async log(event, eventID, {ip, userAgent, email, externalID}) {
        try {
            const current_timestamp = Math.floor(new Date() / 1000);
            const userData = new UserData();
            if (ip) {
                userData.setClientIpAddress(ip);
            }
            if (userAgent) {
                userData.setClientUserAgent(userAgent);
            }
            if (email) {
                const hashedEmail = sha256(email.trim().toLowerCase());
                userData.setEmail(hashedEmail);
            }
            if (externalID) {
                userData.setExternalId(externalID);
            }

            const serverEvent = (new ServerEvent()) 
                        .setEventName(event)
                        .setEventTime(current_timestamp)
                        .setUserData(userData)
                        .setEventSourceUrl(globals.fullURL)
                        .setEventId(eventID)
                        .setActionSource('website');

            if (event == 'Purchase') {
                const customData = (new CustomData()).setCurrency('usd').setValue(10);
                serverEvent.setCustomData(customData);
            }

            // https://developers.facebook.com/docs/marketing-api/conversions-api/get-started
            const eventsData = [serverEvent];
            const eventRequest = (new EventRequest('EAAKm12RIkOIBOZBvciLpH72krbkTBpIF6bn41yHfxw9LRHtyCE74imJZB6L72TD9aurSZBUg0IWIXqlvvwV8ZCsZADZBxgPc1hTQ2G0i2qWvEfK99ao4rK1FaGXsawb06pSqviSb0A1MrbfdsZCqtZCDa3u1ADLHgVxDLBxHtEWXJKpRWgearwVyaSJXhHFg5J7CLQZDZD', '921770102173440'))
                            .setEvents(eventsData);

            eventRequest.execute();
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}
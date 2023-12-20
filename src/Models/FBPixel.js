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
            const eventRequest = (new EventRequest('EAAG5RFStn6EBAFRFFjWMzvZBjQybzKbqm1dgZBzKmRbWtTHlNwU975kr2H2O3IZCCXS0LKZC5f0wJTnDcCYt0Vh5ERZAZA5mE0mrcnuid0okM0aZBhxkldLP5LayWK8Vxnd8WKovngM6cvtfHkjtvA9oxtsO8uUTzA8YDukswqux8OkbIcfAdqAQpM1GL91250ZD', '1580426829148513'))
                            .setEvents(eventsData);

            eventRequest.execute();
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}
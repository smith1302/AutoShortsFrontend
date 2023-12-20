import globals from '~/src/globals';

const sha256 = require('js-sha256');
const bizSdk = require('facebook-nodejs-business-sdk');
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const CustomData = bizSdk.CustomData;
const axios = require('axios');

/* Not fully implemented or tested. Not sure what access_token is 

https://ads.tiktok.com/i18n/events_manager/v2/creationFlow/setup/CIDGJS3C77U7QBTMVDP0?type=1&aadvid=7249397887572934658
https://ads.tiktok.com/help/article/get-started-pixel?lang=en
*/
export default class TikTokServerPixel {
    static async log(event, eventID, {ip, userAgent, email, userID}) {
        try {
            const data = {
                "pixel_code": "CIDGJS3C77U7QBTMVDP0",
                "event": data,
                "context": {
                  "user": {},
                },
                "properties": {},
            }
            if (ip) {
                data.context.ip = ip;
            }
            if (userAgent) {
                data.context.user_agent = userAgent;
            }
            if (email) {
                const hashedEmail = sha256(email.trim().toLowerCase());
                data.context.user.email = hashedEmail;
            }
            if (eventID) {
                data.event_id = eventID;
            }
            if (userID) {
                data.context.user.external_id = sha256(userID);
            }
            const response = await axios({
                method: 'post',
                url: 'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
                headers: {
                'Access-Token': 'ACCESS_TOKEN',
                'Content-Type': 'application/json'
                },
                data: data
            });
    
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }
}
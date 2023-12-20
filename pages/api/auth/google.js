import getConfig from 'next/config';
import { RegisterSource } from '~/src/enums';
import ApiHandler from '~/src/Services/ApiHandler';
import UserService from '~/src/Services/UserService';
import User from '~/src/Models/DBModels/User';
import AuthHelper from '~/src/Models/AuthHelper';
import { TooManyAccountsError } from '~/src/errorMessages';
const { serverRuntimeConfig } = getConfig();
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(serverRuntimeConfig.GOOGLE_CLIENT_ID)


export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate the request came from google's auth flow.
    const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: serverRuntimeConfig.GOOGLE_CLIENT_ID
    });
    const { email } = ticket.getPayload(); 
    const { affiliateRef, referralURL, referralQueryParams } = req.body;

    // Check if user with this email exists.
    const existingUser = await User.findOne({where: {email: email}});


    // Create new account or sign into existing.
    let response;
    if (!existingUser) {

        // Check if this user has created an account before by matching their IP address.
        const IP = req.IP || '';
        const matchedIPUsers = await User.usersWithRecentMatchingIP({IP});
        const tooManyAccounts = matchedIPUsers.length >= 2;
        if (tooManyAccounts) {
            console.log("Too many accounts for IP: ", IP);
            throw new Error(TooManyAccountsError);
        }

        response = await AuthHelper.registerNewUser({
            email: email, 
            IP: IP, 
            source: RegisterSource.Google, 
            affiliateRef: affiliateRef, 
            referralURL: referralURL, 
            referralQueryParams: referralQueryParams
        });
        
    } else {
        response = await AuthHelper.finishLogin(existingUser)
    }

    return res.status(200).json(response);

});
import EmailValidator from "email-validator";

import getConfig from 'next/config';
import UserService from '~/src/Services/UserService';
import User from '~/src/Models/DBModels/User';
import Plan from '~/src/Models/DBModels/Plan';
import Subscription from '~/src/Models/DBModels/Subscription';
import SendGrid from '~/src/Models/SendGrid';
import LocalUser from '~/src/Models/LocalUser';
import CountryLookup from '~/src/Models/CountryLookup';

const { serverRuntimeConfig } = getConfig();

export default class AuthHelper {
    static async registerNewUser({email, hashedPassword=null, IP='', source, affiliateRef=null, referralURL=null, referralQueryParams=null}) {
        
        const country = await CountryLookup.getCountry(IP);
        const userID = await User.create({
            email: email, 
            hashedPassword: hashedPassword, 
            IP: IP, 
            source: source,
            affiliateRef: affiliateRef,
            referralURL: referralURL,
            referralQueryParams: referralQueryParams,
            country: country
        });
    
        // Set the user with the default free plan
        const freePlan = await Plan.findOne({where: {available: true, price: 0}});
        const freeSubscriptionID = await Subscription.createFreePlan({
            userID: userID, 
            planID: freePlan.id
        });
    
        // create a jwt token that is valid for 30 days
        const token = UserService.signJWT(userID, false, serverRuntimeConfig.JWTSecret);

        // Add the new free subscription to the user
        await User.update({subscriptionID: freeSubscriptionID, freeSubscriptionID: freeSubscriptionID, sessionKey: token}, userID);
    
        // Send a confirmation email
        await SendGrid.register(email).send();
        return LocalUser.toJSON(userID, email, token, source);
    }

    static async verifySessionToken(sessionKey, userID) {
        // Allow unlimited logins
        return true;

        // If this user's subscription only allows 1 login, verify that the sessionKey matches the user's sessionKey so we can log them out otherwise.
        const sessionKeyDoesMatch = await User.findOne({where: {id: userID, sessionKey: sessionKey}});
        return sessionKeyDoesMatch;
    }

    static async finishLogin(user) {
        const token = UserService.signJWT(user.id, user.master, serverRuntimeConfig.JWTSecret);
        await User.update({sessionKey: token}, user.id);
        return LocalUser.toJSON(user.id, user.email, token, user.source);
    }

    static isValidEmail(email) {
        if (!email) return;
        return EmailValidator.validate(email);
    }
}
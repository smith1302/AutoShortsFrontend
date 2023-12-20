import jwt from 'jsonwebtoken';
import AuthHelper from '~/src/Models/AuthHelper';
import { PlanLimitReachedError } from '~/src/errorMessages';
import getConfig from 'next/config';
const requestIp = require('request-ip');
// Accessible from next.config.js
const { serverRuntimeConfig } = getConfig();

export default function apiHandler(loginRequired, handler) {
    return async (req, res) => {
        try {
            
            // Add user to request if logged in
            await appendUserToRequest(req, res);

            // Add IP address to request
            req.IP = requestIp.getClientIp(req); 
            
            // Verify auth token
            if (loginRequired) {
                jwtMiddleware(req, res);
            }

            // route handler
            await handler(req, res);
        } catch (err) {
            console.log(err);
            // global error handler
            errorHandler(err, res);
        }
    }
}

function errorHandler(err, res) {
    if (!err) {
        err = "An unknown error occured";
    }

    if (err === PlanLimitReachedError) {
        return res.status(403).json({message: PlanLimitReachedError});
    }

    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err.message });
    }

    if (err.message === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Login Required' });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
}

function jwtMiddleware(req, res) {
    if (!req.user) {
        throw new Error('UnauthorizedError');
    }
}

/*
    Verify the bearer token exists. If it does, append the decoded user info into the request so it can be used by handler.
*/
async function appendUserToRequest(req, res) {
    try {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            const token = req.headers.authorization.split(' ')[1];

            // 1. Check if the token is a valid format. Example return: { id: 1, iat: 1641528456, exp: 1644120456 }
            const user = jwt.verify(token, serverRuntimeConfig.JWTSecret);

            // 2. Check if token is connected to this user in the DB. Prevents multiple logins.
            const isConnectedToUser = await AuthHelper.verifySessionToken(token, user.id);
            if (!isConnectedToUser) return false;

            req.user = user;
        }
    } catch (err) {
        // console.log(err);
    }
}
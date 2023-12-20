/*
    Helpful wrapper for basic http operations. Automatically includes our JWT token in each request for authentication.
*/

import getConfig from 'next/config';
import UserService from '~/src/Services/UserService';
import CaptchaService from '~/src/Services/CaptchaService';
import { NeedsCaptchaCheckError } from '~/src/errorMessages';

export default {
    get,
    post,
    put,
    delete: _delete
};

function get(url) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(url)
    };
    return fetch(url, requestOptions).then(handleResponse);
}

function post(url, body) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(url) },
        credentials: 'include',
        body: JSON.stringify(body)
    };
    return fetch(url, requestOptions).then(handleResponse);
}

function put(url, body) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(url) },
        body: JSON.stringify(body)
    };
    return fetch(url, requestOptions).then(handleResponse);    
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(url)
    };
    return fetch(url, requestOptions).then(handleResponse);
}

// helper functions

function authHeader(url) {
    // return auth header with jwt if user is logged in and request is to the api url
    const user = UserService.currentUser();
    const isLoggedIn = user && user.token;
    const isApiUrl = url.includes("api/");

    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
}

function handleResponse(response) {
    return response.text().then(text => {
        let data;
        try {
            data = text && JSON.parse(text);
        } catch (err) {}
            
        if (!response.ok) {
            if ([401].includes(response.status)) {
                // Trying to access unauthorized content but not able to view. Force the user to login.
                if (UserService.currentUser()) UserService.logout();
                UserService.showRegisterDialog();
            }

            const error = (data && data.message) || response.statusText;
            if (error == NeedsCaptchaCheckError) {
                CaptchaService.showCaptchaDialog();
            }

            return Promise.reject(error);
        }
        return data;
    });
}
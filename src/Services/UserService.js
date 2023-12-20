import jwt from 'jsonwebtoken';
import FetchWrapper from '~/src/Services/FetchWrapper';
import LocalUser from '~/src/Models/LocalUser';
import globals from '~/src/globals';

export default {
    user: currentUser(),
    login,
    logout,
    register,
    googleAuth,
    signJWT,
    setReferralURL,
    getReferralURL,
    setReferralQueryParams,
    getReferralQueryParams,
    setAuthDialogSubscriber,
    showLoginDialog,
    showRegisterDialog,
    currentUser,
    setUser,
    update,
    updateIP,
};

function currentUser() {
    return LocalUser.current();
}

async function update({email, password}) {
    return FetchWrapper.put(`/api/user/update`, { email, password })
    .then(user => {
        setUser(user);
        return user;
    });
}

async function login(email, password) {
    return FetchWrapper.post(`/api/auth/login`, { email, password })
        .then(user => {
            setUser(user);
            return user;
        });
}

async function register(email, password, authCode, affiliateRef) {
    const params = { 
        email, 
        password, 
        authCode, 
        affiliateRef, 
        referralURL: getReferralURL(),
        referralQueryParams: getReferralQueryParams()
    };
    return FetchWrapper.post(`/api/auth/register`, params)
        .then(user => {
            setUser(user);
            return user;
        });
}

async function googleAuth(googleData, affiliateRef='') {
    if (!googleData.credential) return null;

    const params = { 
        credential: googleData.credential, 
        affiliateRef, 
        referralURL: getReferralURL(),
        referralQueryParams: getReferralQueryParams()
    };
    return FetchWrapper.post(`/api/auth/google`, params)
        .then(user => {
            setUser(user);
            return user;
        });
}

async function updateIP() {
    return FetchWrapper.post(`/api/user/updateIP`, {});
}

function logout() {
    localStorage.removeItem('user');
    authDialogSubscriber.updateUserState(null);
    // window.location = "/";
}

/* Shared JWT token creation between login & signup endpoints */
function signJWT(userID, master, JWTSecret) {
    const randomNumber = Math.floor(Math.random() * 99999999);
    return jwt.sign({ id: userID, master: master, random: randomNumber}, JWTSecret, { expiresIn: '180d' });
}

function setReferralURL(referrer) {
    if (getReferralURL()) return;
    if (referrer && referrer.indexOf(globals.hostname) === -1) {
        localStorage.setItem('referralURL', referrer);
    }
}

function getReferralURL() {
    return _getLocalStorageItem('referralURL');
}

function setReferralQueryParams(params) {
    if (getReferralQueryParams()) return;
    if (params) {
        localStorage.setItem('referralQueryParams', params);
    }
}

function getReferralQueryParams() {
    return _getLocalStorageItem('referralQueryParams');
}

function _getLocalStorageItem(key) {
    if (!process.browser) return null;
    return localStorage.getItem(key);
}

/* Way for child components to communicate with _app to show register/login universally */

let authDialogSubscriber = null;
function showRegisterDialog() {
    authDialogSubscriber.showRegisterDialog();
}

function showLoginDialog() {
    authDialogSubscriber.showLoginDialog();
}

function setAuthDialogSubscriber(subscriber) {
    authDialogSubscriber = subscriber;
}

/* User Updates */

function setUser(user) {
    LocalUser.save(user)
    authDialogSubscriber.updateUserState(user);
}
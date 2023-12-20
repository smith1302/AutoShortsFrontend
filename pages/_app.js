import React, { useEffect, useState, useContext } from "react";
import Router from "next/router";
import { useRouter } from "next/router";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FetchWrapper from "~/src/Services/FetchWrapper";
import AffiliateService from '~/src/Services/AffiliateService';
import CaptchaService from '~/src/Services/CaptchaService';
import UserService from '~/src/Services/UserService';
import PixelService from '~/src/Services/PixelService';
import GTagService from '~/src/Services/GTagService';
import TikTokService from '~/src/Services/TikTokService';
import UserContext from '~/src/Components/UserContext';
import RegisterDialog from "~/src/Components/Common/RegisterDialog";
import CaptchaDialog from "~/src/Components/Common/CaptchaDialog";
import LoginDialog from "~/src/Components/Common/LoginDialog";
import ErrorBoundary from "~/src/Components/Common/ErrorBoundary";
import globals from "~/src/globals";
import paths from "~/src/paths";
import "~/styles/globals.scss";

import getConfig from 'next/config'
const {publicRuntimeConfig} = getConfig();
const {PAYPAL_CLIENT_KEY, GOOGLE_CLIENT_ID} = publicRuntimeConfig;

export default function App({ Component, pageProps }) {

    const router = useRouter();
    const { ref } = router.query;
    const [hasLoaded, setHasLoaded] = useState(false);
    const [user, setUser] = useState(undefined);
    const [subscriptionSummary, setSubscriptionSummary] = useState(undefined);
    const [registerSource, setRegisterSource] = useState(undefined);
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showCaptchaDialog, setShowCaptchaDialog] = useState(false);

    useEffect(() => {
        // Log affiliate clicks
        if (!ref) return;

        AffiliateService.logClick(ref);
        // Save this affiliate so we can attribute it to the user when they sign up
        if (!UserService.currentUser() && !AffiliateService.getAffiliateTracker()) {
            AffiliateService.setAffiliateTracker(ref);
        }
    }, [ref]);

    useEffect(() => {

        const user = UserService.currentUser();
        setUser(user);

        // Allow auth subscribers to open global dialogs
        UserService.setAuthDialogSubscriber({
            showRegisterDialog: () => {
                setShowRegister(true);
            },
            showLoginDialog: () => {
                setShowLogin(true);
            },
            updateUserState: (user) => {
                setUser(user);
            }
        });

        CaptchaService.setCaptchaDialogSubscriber({
            showCaptchaDialog: () => {
                setShowCaptchaDialog(true);
            }
        });

        // Log pageview events
        try {
            const urlModal = new URL(window.location.href);
            const pathname = urlModal.pathname;
            if (pathname === '/dashboard/store') {
                const store = urlModal.searchParams.get('url');
                user && FetchWrapper.post(`/api/event`, {name: 'pageview', data: JSON.stringify({path: pathname, store: store})})
            } else {
                user && FetchWrapper.post(`/api/event`, {name: 'pageview', data: pathname})
            }
        } catch (err) {}

        // Get basic subscription details for the user
        FetchWrapper.get(`/api/user/summary`).then(response => {
            setSubscriptionSummary(response);
            setRegisterSource(response.registerSource);
            setHasLoaded(true);
        });

        // GA stuff
        GTagService.pageview();

        // FB pixel stuff
        PixelService.logPixel('PageView');

        // TikTok stuff
        TikTokService.pageview();

        router.events.on("routeChangeComplete", () => {
            PixelService.logPixel('PageView');
            GTagService.pageview();
            TikTokService.pageview();
        });

        // Set referral URL and query params on first visit
        UserService.setReferralURL(document.referrer);
        UserService.setReferralQueryParams(new URL(window.location.href).search);

    }, []);


    // Make sure user is loaded before loading the rest of the app.
    // This prevents any flashing state while we check localStorage
    if (!hasLoaded) {
        return <CustomHead />;
    }

    return (
        <>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <CustomHead />
                <CssBaseline />
                <PayPalScriptProvider options={{"client-id": PAYPAL_CLIENT_KEY, "intent": "subscription", "vault": true, "disable-funding": "card,paylater"}}>
                        <UserContext.Provider value={{user, subscriptionSummary, registerSource}}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Component {...pageProps} />
                            </LocalizationProvider>
                        </UserContext.Provider>
                </PayPalScriptProvider>

                <RegisterDialog open={showRegister} onClose={() => {
                    setShowRegister(false)
                }} />
                <LoginDialog open={showLogin} onClose={() => {
                    setShowLogin(false);
                }} />
                <CaptchaDialog open={showCaptchaDialog} onClose={() => {
                    setShowCaptchaDialog(false)
                }} />
            </GoogleOAuthProvider>
        </>
    );
}

function CustomHead() {
    return <Head>
        <title>{globals.meta.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
        <meta name="description" content={globals.meta.desc} />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta key="ogtitle" property="og:title" content={globals.meta.appName} />
        <meta key="ogdescription" property="og:description" content={globals.meta.desc} />
        <meta property="og:image" content={`${globals.fullURL}/images/OGImage.png`} />
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png"/>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:100,200,300,400,500,600,700,800" rel="stylesheet"></link>
        <style>{`
            #__next { height: 100% }
        `}
        </style>
    </Head>
}
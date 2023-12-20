import {useEffect, useState} from "react";
import clsx from "clsx";
import { GoogleLogin } from '@react-oauth/google';

import classes from "./index.module.scss";

import AffiliateService from '~/src/Services/AffiliateService';
import UserService from '~/src/Services/UserService';
import PixelService from '~/src/Services/PixelService';
import GTagService from '~/src/Services/GTagService';
import TikTokService from '~/src/Services/TikTokService';
import FetchWrapper from '~/src/Services/FetchWrapper';
import Button from '~/src/Components/Common/Button';

import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

const StateMachine = {
    INPUT_FORM: "start",
    CONFIRM_CODE: "confirmcode",
}

export default function RegisterForm({onRegisterSuccess, dense, useAdordnments}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [flowState, setFlowState] = useState(StateMachine.INPUT_FORM);

    const removeSpaces = (str) => str.replace(/ /g, '');

    // Step 1 of registration: Send confirmation code
    const handleManualRegisterClick = (e) => {
        if (!email || !email.length) return setError("Please enter an email");
        if (!password || !password.length) return setError("Please enter a password");
        if (password != confirmPassword) return setError("Passwords do not match.");

        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/auth/sendCode`, { email, password })
            .then(response => {
                setSuccess("Please enter the 4 digit code we sent to your email.")
                setFlowState(StateMachine.CONFIRM_CODE);
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    // Step 2 of registration: Verify confirmation code and register
    const handleFinishManualRegister = (e) => {
        if (!authCode || authCode.length < 4) return setError("Please enter your 4 digit confirmation code.");

        setSuccess(null);
        setError(null);
        setLoading(true);
        const affiliateRef = AffiliateService.getAffiliateTracker();
        UserService.register(email, password, authCode, affiliateRef)
            .then(user => handleRegisterSuccess(user))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleGoogleLogin = async (googleData) => {
        setError(null);
        setLoading(true);
        const affiliateRef = AffiliateService.getAffiliateTracker();
        UserService.googleAuth(googleData, affiliateRef)
            .then(user => user && handleRegisterSuccess(user))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleRegisterSuccess = (user) => {
        try {
            PixelService.logPixel('CompleteRegistration');
            GTagService.register();
            TikTokService.register();
        } catch (err) {}
        
        setEmail(null); 
        setPassword(null); 
        setConfirmPassword(null);
        setSuccess("Account successfully created!");
        onRegisterSuccess();
    }

    if (flowState == StateMachine.CONFIRM_CODE) {
        return (
            <>
                <img className={classes.logo} src="/images/LogoGradient.png" />
                <div className={classes.title}>Confirm Code</div>
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                {success && !error && <Alert className={classes.alert} severity="success">{success}</Alert>}
                <TextField
                    autoFocus
                    margin={dense ? "dense" : "normal"}
                    required
                    fullWidth
                    key="authCode"
                    id="authCode"
                    label="4 Digit Code"
                    autoFocus 
                    value={authCode}
                    onChange={(e) => {setAuthCode(removeSpaces(e.target.value).substr(0,4))}}
                    />
                <Button className={classes.btn} onClick={handleFinishManualRegister} loading={loading}>Submit</Button>
            </>
        );

    } else if (flowState == StateMachine.INPUT_FORM) {
        return (
            <>
                <img className={classes.logo} src="/images/LogoGradient.png" />
                <div className={classes.title}>Sign Up</div>
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                {success && !error && <Alert className={classes.alert} severity="success">{success}</Alert>}
                <TextField
                    autoFocus
                    margin={dense ? "dense" : "normal"}
                    required
                    fullWidth
                    key="email"
                    id="email"
                    label="Email"
                    value={email}
                    onChange={(e) => {setEmail(removeSpaces(e.target.value))}}
                    InputProps={{startAdornment: useAdordnments && (<InputAdornment position="start"><AccountCircleIcon /></InputAdornment>)}}
                    />
                <TextField
                    margin={dense ? "dense" : "normal"}
                    required
                    fullWidth
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    InputProps={{startAdornment: useAdordnments && (<InputAdornment position="start"><LockIcon /></InputAdornment>)}}
                    onChange={(e) => {setPassword(removeSpaces(e.target.value))}} />
                <TextField
                    margin={dense ? "dense" : "normal"}
                    required
                    fullWidth
                    id="confirm"
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    InputProps={{startAdornment: useAdordnments && (<InputAdornment position="start"><LockIcon /></InputAdornment>)}}
                    onChange={(e) => {setConfirmPassword(removeSpaces(e.target.value))}} />

                <Button className={classes.btn} onClick={handleManualRegisterClick} loading={loading}>Sign Up</Button>
                <div className={classes.or}>or</div>
                <div className={clsx(classes.googleBtn, loading ? classes.disable : null)}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleLogin}
                    />
                </div>
            </>
        );
    }
}
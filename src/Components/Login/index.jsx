import React from 'react';
import { useState, useEffect } from 'react';
import clsx from "clsx";
import { GoogleLogin } from '@react-oauth/google';

import UserService from '~/src/Services/UserService';

import paths from "~/src/paths";
import AuthPage from "~/src/Components/Common/AuthPage";
import classes from "./index.module.scss";

import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import Button from '~/src/Components/Common/Button';

export default function Login({children}) {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleManualLogin = (e) => {
        if (!email || !email.length) return setError("Please enter an email");
        if (!password || !password.length) return setError("Please enter a password");

        setError(null);
        setLoading(true);
        UserService.login(email, password)
            .then(user => window.location = paths.dashboard)
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }

    const handleGoogleLogin = async (googleData) => {
        setError(null);
        setLoading(true);
        UserService.googleAuth(googleData)
            .then(user => window.location = paths.dashboard)
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }

    return (
        <AuthPage pageTitle="Login" headerTitle="">
                <div className={classes.card}>
                    <img className={classes.logo} src="/images/LogoGradient.png" />
                    <div className={classes.title}>Login</div>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        autoFocus 
                        onChange={(e) => {setEmail(e.target.value)}}
                        InputProps={{startAdornment: (<InputAdornment position="start"><AccountCircleIcon /></InputAdornment>)}}
                        />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        type="password"
                        InputProps={{startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>)}}
                        onChange={(e) => {setPassword(e.target.value)}} />
                    <div className={classes.forgotPassword}><a href={paths.forgotPassword}>Forgot password?</a></div>
                    <Button className={classes.btn} onClick={handleManualLogin} loading={loading}>
                        LOGIN
                    </Button>
                    <div className={classes.or}>or</div>
                    <div className={clsx(classes.googleBtn, loading ? classes.disable : null)}>
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={handleGoogleLogin}
                        />
                    </div>
                </div>
                <div className={classes.footnote}>Not registered? <a href={paths.register}>Create an account</a></div>
        </AuthPage>
    )
}
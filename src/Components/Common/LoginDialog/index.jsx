import {useEffect, useState} from "react";
import classes from "./index.module.scss";
import clsx from "clsx";
import { GoogleLogin } from '@react-oauth/google';

import paths from "~/src/paths";
import UserService from '~/src/Services/UserService';
import Button from '~/src/Components/Common/Button';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoginDialog({open, onClose}) {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const onEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const onPasswordChange = (e) => {
        setPassword(e.target.value);
    }

    const handleManualLogin = (e) => {
        if (!email || !email.length) return setError("Please enter an email");
        if (!password || !password.length) return setError("Please enter a password");

        setError(null);
        setLoading(true);
        UserService.login(email, password)
            .then(user => handleLoginSuccess(user))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleGoogleLogin = (googleData) => {
        setError(null);
        setLoading(true);
        UserService.googleAuth(googleData)
        .then(user => user && handleLoginSuccess(user))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleLoginSuccess = (user) => {
        onClose();
        if (new URL(window.location).pathname == "/") {
            window.location = paths.dashboard;
        }
    }
    
    return (
        <Dialog className={classes.root} onClose={onClose} open={open}>
            <DialogTitle>
                <IconButton aria-label="close" id={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <img className={classes.logo} src="/images/LogoGradient.png" />
                <div className={classes.title}>Login</div>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    onChange={onEmailChange}
                />
                <TextField
                    margin="dense"
                    label="Password"
                    type="password"
                    required
                    fullWidth
                    onChange={onPasswordChange}
                />
                <div className={classes.forgotPassword}><a href={paths.forgotPassword}>Forgot password?</a></div>
                <Button 
                    id={classes.loginButton}
                    color="primary"
                    variant="contained"
                    onClick={handleManualLogin}
                    loading={loading}>
                    Login
                </Button>
                <div className={classes.or}>or</div>
                <div className={clsx(classes.googleBtn, loading ? classes.disable : null)}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleLogin}
                    />
                </div>
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                {success && <Alert className={classes.alert} severity="success">{success}</Alert>}
                <div className={classes.subnote}>Don't have an account? <a href='#' onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    UserService.showRegisterDialog();
                }}>Sign up</a></div>
            </DialogContent>
        </Dialog>
    );
}
import {useState, useEffect} from 'react';
import classes from './index.module.scss';
import { useRouter } from "next/router";
import paths from "~/src/paths";

import BasicPage from '~/src/Components/Common/BasicPage'
import Button from '~/src/Components/Common/Button';
import FetchWrapper from '~/src/Services/FetchWrapper';

// Material UI
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isValidToken, setIsValidToken] = useState(undefined);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/auth/verifyResetPasswordCode`, { code: token })
        .then(response => {
            setIsValidToken(true);
        })
        .catch(error => setIsValidToken(false))
        .finally(() => setLoading(false));
    }, [token]);

    const handleSubmit = (e) => {
        if (password.length < 5) return setError("Password should 5 characters or more");
        if (password != confirmPassword) return setError("Passwords do not match");

        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/auth/resetPassword`, { password, code: token })
        .then(response => {
            setFinished(true);
        })
        .catch(error => setError(error))
        .finally(() => setLoading(false));
    }

    const handleChange = (e) => {
        setPassword(e.target.value.slice(0, 200));
    }

    if (finished) {
        return (
            <BasicPage 
                title="Reset Password" 
                heroTitle="Password Updated" 
                heroSubtitle={<>Your password has been updated. You may now <a href={paths.login}>LOGIN.</a></>} 
            />
        );
    } else if (isValidToken == undefined) {
        return (
            <BasicPage title="Reset Password">
                <div className={classes.root}>
                    <CircularProgress size={40} />
                </div>
            </BasicPage>
        );
    } else if (!isValidToken) {
        return (
            <BasicPage 
                title="Reset Password" 
                heroTitle="OOPS!" 
                heroSubtitle="This reset link is either invalid or has expired." 
            />
        );
    } else {
        return (
            <BasicPage title="Reset Password" heroTitle="Reset Password" heroSubtitle="Enter your new desired password.">
                <div className={classes.root}>
                    <div className={classes.vertical}>
                        <TextField
                            label="New Password"
                            type="password"
                            autoFocus
                            onChange={(e) => setPassword(e.target.value.slice(0, 200))}
                            disabled={loading}
                            className={classes.input}
                            />
                        <TextField
                            label="Retype Password"
                            type="password"
                            onChange={(e) => setConfirmPassword(e.target.value.slice(0, 200))}
                            disabled={loading}
                            className={classes.input}
                            />
                        {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                        <Button className={classes.submit} onClick={handleSubmit} loading={loading}>Submit</Button>
                    </div>
                </div>
            </BasicPage>
        );
    }
}
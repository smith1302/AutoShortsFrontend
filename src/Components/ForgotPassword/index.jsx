import {useState} from 'react';
import classes from './index.module.scss';

import BasicPage from '~/src/Components/Common/BasicPage'
import Button from '~/src/Components/Common/Button';
import FetchWrapper from '~/src/Services/FetchWrapper';

// Material UI
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        if (!email || !email.length) return setError("Please enter your account email");

        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/auth/sendPasswordReset`, { email })
            .then(response => {
                setSent(true);
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleChange = (e) => {
        setEmail(e.target.value.slice(0, 200));
    }

    return (
        <BasicPage title="Forgot Password" heroTitle="Forgot Password" heroSubtitle="No worries, we'll send you a password reset link">
            <div className={classes.root}>
                <div className={classes.horizontal}>
                    <TextField
                        label="Account Email"
                        placeholder="Enter your account email"
                        autoFocus
                        onChange={(e) => handleChange(e)}
                        disabled={loading || sent}
                        className={classes.input}
                        />
                    <Button className={classes.submit} onClick={handleSubmit} loading={loading} disabled={sent || loading}>Send</Button>
                </div>
                {sent && <Alert className={classes.alert} severity="success">An email has been sent containing a reset password link.</Alert>}
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
            </div>
        </BasicPage>
    );
}
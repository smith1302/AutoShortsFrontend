import {useEffect, useState, useContext} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import Layout from "../Layout";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import PageHeading from "~/src/Components/Dashboard/PageHeading";
import Button from '~/src/Components/Common/Button';
import UserContext from '~/src/Components/UserContext';
import FetchWrapper from "~/src/Services/FetchWrapper";
import UserService from "~/src/Services/UserService";

import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

function Account({ children }) {
    const {user} = useContext(UserContext);

    useEffect(() => {
        // FetchWrapper.post(`/api/user/billing`)
        // .then(response => {
        // })
        // .catch(err => {
        //     console.log(err);
        // });
    }, []);

	return (
		<Layout>
            <div className={classes.root}>
                <ContentContainer width={700}>
                    <img src='/images/Account.png' className={classes.headerLogo} />
                    
                    <EmailSection defaultEmail={user.email} />
                    <PasswordSection />

                </ContentContainer>
            </div>
		</Layout>
	)
}

function EmailSection({defaultEmail = ''}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [helperText, setHelperText] = useState(null);
    const [email, setEmail] = useState(defaultEmail);

    const handleSubmit = (e) => {
        if (!email || email.length < 5) return setError("Please enter an email");

        setError(null);
        setLoading(true);

        UserService.update({email})
        .then(response => {
            setHelperText("Email updated successfully");
            setTimeout(() => setHelperText(null), 4000);
        })
        .catch(error => setError(error))
        .finally(() => setLoading(false));
    }

    const handleChange = (e) => {
        setEmail(e.target.value.slice(0, 200));
    }

    return (
        <section className={classes.section}>
            <PageHeading title="Update Email" />
            <Paper className={classes.paper}>
                <TextField
                    label="Email"
                    size="small"
                    value={email}
                    error={!!error}
                    helperText={helperText || error}
                    placeholder="Type your new email here"
                    onChange={(e) => handleChange(e)}
                    disabled={loading}
                    className={classes.input}
                    />
                <Button className={classes.submit} onClick={handleSubmit} loading={loading}>Save</Button>
            </Paper>
            <div className={classes.note}>Note: This will be your login email. Make sure to remember it!</div>
        </section>
    )
}

function PasswordSection() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [helperText, setHelperText] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        if (!password || password.length < 5) return setError("Please enter a longer password");
        if (password != confirmPassword) return setError("Passwords do not match");

        setError(null);
        setLoading(true);

        UserService.update({password})
        .then(response => {
            setHelperText("Password updated successfully");
            setTimeout(() => setHelperText(null), 4000);
        })
        .catch(error => setError(error))
        .finally(() => setLoading(false));
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value.slice(0, 200));
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value.slice(0, 200));
    }

    return (
        <section className={classes.section}>
            <PageHeading title="Change Password" />
            <Paper className={clsx(classes.paper, classes.vertical)}>
                <TextField
                    label="New Password"
                    size="small"
                    value={password}
                    error={!!error}
                    type="password"
                    placeholder="Type your new password here"
                    onChange={(e) => handlePasswordChange(e)}
                    disabled={loading}
                    className={classes.input}
                    />
                <TextField
                    label="Confirm Password"
                    size="small"
                    value={confirmPassword}
                    error={!!error}
                    type="password"
                    helperText={helperText || error}
                    placeholder="Retype the new password"
                    onChange={(e) => handleConfirmPasswordChange(e)}
                    disabled={loading}
                    className={classes.input}
                    />
                <Button className={classes.submit} onClick={handleSubmit} loading={loading}>Save</Button>
            </Paper>
            {/* <div className={classes.note}>Note: This will be your login email. Make sure to remember it!</div> */}
        </section>
    )
}

export default withAuthProtection(Account);
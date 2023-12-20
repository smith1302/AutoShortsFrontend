import {useState} from "react";
import classes from "./index.module.scss";
import Button from '~/src/Components/Common/Button';
import globals from '~/src/globals';
import FetchWrapper from '~/src/Services/FetchWrapper';

import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

export default function DashboardGoalCards({ onSaveSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [affiliateID, setAffiliateID] = useState("");

    const handleSubmit = (e) => {
        if (!affiliateID || !affiliateID.length) return setError("Please enter an ID");
        if (affiliateID.includes(" ")) return setError("Affiliate ID cannot contain spaces");
        // Make sure affiliateID does not include special characters
        if (!/^[a-zA-Z0-9]+$/.test(affiliateID)) return setError("Affiliate ID cannot contain special characters");

        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/affiliate/id`, { affiliateID })
            .then(response => {
                onSaveSuccess();
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleChange = (e) => {
        const affiliateID = e.target.value.slice(0, 30).toLowerCase().trim();
        setAffiliateID(affiliateID);
    }

	return (
		<div className={classes.root}>
            <Paper className={classes.paper}>
                <img src='/images/affiliate-header.png' className={classes.logo} />
                <div className={classes.title}>Affiliate Signup</div>
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                <TextField
                    label="Create your URL"
                    autoFocus
                    value={affiliateID}
                    onChange={(e) => handleChange(e)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">https://{globals.displayURL}?ref=</InputAdornment>,
                    }}
                    disabled={loading}
                    />
                <Button className={classes.submit} onClick={handleSubmit} loading={loading}>Create</Button>
            </Paper>
            <div className={classes.note}>Note: This will be the referal URL you share with others.</div>
        </div>
	)
}
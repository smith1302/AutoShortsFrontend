import {useState} from "react";
import classes from "./index.module.scss";
import clsx from "clsx";
import FetchWrapper from '~/src/Services/FetchWrapper';
import Button from '~/src/Components/Common/Button';
import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

export default function PayPalSection({ className, defaultPayPal = '' }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paypal, setPayPal] = useState(defaultPayPal);

    const handleSubmit = (e) => {
        if (!paypal || !paypal.length) return setError("Please enter a PayPal email");

        setError(null);
        setLoading(true);
        FetchWrapper.post(`/api/affiliate/paypal`, { paypal })
            .then(response => {
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const handleChange = (e) => {
        setPayPal(e.target.value.slice(0, 200));
    }

	return (
		<section className={clsx(className, classes.section)}>
            <PageHeading title="PayPal Email" />
            <Paper className={classes.paper}>
                <TextField
                    label="PayPal Email"
                    size="small"
                    value={paypal}
                    error={!!error}
				    helperText={error}
                    placeholder="Type your PayPal email here"
                    onChange={(e) => handleChange(e)}
                    disabled={loading}
                    className={classes.input}
                    />
                <Button className={classes.submit} onClick={handleSubmit} loading={loading}>Update</Button>
            </Paper>
            <div className={classes.note}>Note: This is where your commission payouts will be sent</div>
        </section>
	)
}
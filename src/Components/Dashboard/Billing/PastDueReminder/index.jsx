import classes from "./index.module.scss";
import {useState} from "react";
import { SubscriptionStatus, SubscriptionSource } from '~/src/enums';
import FetchWrapper from "~/src/Services/FetchWrapper";

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

export default function PastDueReminder({ subscriptionStatus, subscriptionSource }) {
	if (subscriptionStatus !== SubscriptionStatus.PAST_DUE) {
		return null;
	}

	const [loading, setLoading] = useState(false);

	const openCustomerPortal = async (e) => {
		setLoading(true);
		e.preventDefault();
		FetchWrapper.post(`/api/billing/stripePortalSession`, {returnURL: window.location.href})
		.then(response => {
			window.location = response.sessionURL;
		});
	}
	
	return (
		<Alert 
			className={classes.alert}
			severity="error"
			action={subscriptionSource == SubscriptionSource.Stripe && (
				<Button color="inherit" size="small" onClick={openCustomerPortal} disabled={loading}>
				  UPDATE CARD
				</Button>
			)}>
				A recent billing attempt failed.
		</Alert>
	)
}
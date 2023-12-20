import {useState} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import InvoiceDialog from "../InvoiceDialog";
import FeedbackDialog from "~/src/Components/Dashboard/Billing/FeedbackDialog";

import Button from "~/src/Components/Common/Button";
import PageHeading from "~/src/Components/Dashboard/PageHeading";

import { SubscriptionStatus, SubscriptionSource, PlanBillingInterval } from '~/src/enums';
import FetchWrapper from "~/src/Services/FetchWrapper";

import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function PlanInfo({ className, currentPeriodEnd, currentPlan, subscriptionPrice, subscriptionStatus, subscriptionSource, paymentHistoryCount }) {
	const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
	const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
	const formattedPeriod = currentPeriodEnd && new Date(currentPeriodEnd).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

	const cancelPlan = async () => {
		const didConfirm = confirm("Are you sure you wish to cancel your current plan?");
		if (didConfirm) {
			setLoading(true);
			FetchWrapper.get(`/api/user/cancel`)
			.then(response => {
				setOpenFeedbackDialog(true);
			})
			.catch(err => {
				setError(err);
				setLoading(false);
			});
		}
	}

	const onFeedbackRequestDialogClose = () => {
		setOpenFeedbackDialog(false);
		if (subscriptionSource == SubscriptionSource.PayPal) {
			setTimeout(() => {
				alert("Success! Please allow a few minutes for your subscription to cancel.");
			}, 500);
		}
		setTimeout(() => {location.reload()}, 1000);
	}

	let billingDateRow;
	if (subscriptionStatus == SubscriptionStatus.ACTIVE) {
		billingDateRow = (<div><b>Next Billing Date:</b> {formattedPeriod}</div>);
	} else if (subscriptionStatus == SubscriptionStatus.CANCELED) {
		billingDateRow = (<div><b>Cancels On:</b> {formattedPeriod}</div>);
	}

	let creditCapRow;
	if (currentPlan && currentPlan.price == 0) {
		// creditCapRow = (<div><b>Plan Limit:</b> {creditCap.toLocaleString()} word trial</div>);
	}

	let cancelButton;
	if (subscriptionStatus == SubscriptionStatus.ACTIVE || subscriptionStatus == SubscriptionStatus.PAST_DUE) {
		cancelButton = <Button className={classes.button} onClick={cancelPlan} loading={loading} small>Cancel Plan</Button>;
	}

	let statusRow;
	if (subscriptionStatus) {
		statusRow = (<div><b>Subscription Status:</b> <span className={classes.status}>{StatusText(subscriptionStatus)}</span></div>);
	}

	return (
		<section className={clsx(classes.root, className)}>
			<PageHeading title="Current Plan" />
			{error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
			<div className={classes.grid}>
				<Paper className={clsx(classes.paper, classes.left)}>
					{currentPlan && <div><b>Current Plan:</b> {currentPlan.name} {currentPlan.billingInterval != PlanBillingInterval.ONCE && `(${currentPlan.billingInterval})`}</div>}
					{creditCapRow}
					{statusRow}
					{billingDateRow}
					{!!subscriptionPrice && <div><b>Price:</b> {subscriptionPrice.toLocaleString('en-US', {style: 'currency',currency: 'USD'})}</div>}
					{cancelButton}
				</Paper>
				{paymentHistoryCount > 0 && <ManageBilling subscriptionSource={subscriptionSource} />}
			</div>

			<FeedbackDialog open={openFeedbackDialog} onClose={onFeedbackRequestDialogClose} />
		</section>
	)
}

function StatusText(status) {
	if (status == SubscriptionStatus.PAST_DUE) {
		return "Past due (Retrying)";
	}
	return status
}

function ManageBilling({subscriptionSource}) {
	const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);

	const openStripeCustomerPortal = async (e) => {
		FetchWrapper.post(`/api/billing/stripePortalSession`, {returnURL: window.location.href})
		.then(response => {
			window.location = response.sessionURL;
		});
	}

	const viewInvoicesClicked = (e) => {
		setOpenInvoiceDialog(true);
	}

	// Always show the invoice option
	const links = [<a href='#' onClick={viewInvoicesClicked} key={"view-invoices"}><ReceiptIcon /> View Invoices</a>];

	// Conditionally show update card for stripe users
	if (subscriptionSource == SubscriptionSource.Stripe) {
		links.push(<a href='#' onClick={openStripeCustomerPortal} key={"update-card"}><CreditCardIcon /> Update Card</a>);
	}

	return (
		<>
			<Paper className={clsx(classes.paper, classes.right)}>
				<div className={classes.header}>Manage Billing</div>
				{links.map(link => link)}
			</Paper>
			<InvoiceDialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} />	
		</>
	)
}
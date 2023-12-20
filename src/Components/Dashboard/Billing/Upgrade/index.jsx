import {useContext, useEffect, useState} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import { SubscriptionStatus } from '~/src/enums';
import UpgradePlans from "./UpgradePlans";
import PageHeading from "~/src/Components/Dashboard/PageHeading";
import FeedbackDialog from "~/src/Components/Dashboard/Billing/FeedbackDialog";

export default function Upgrade({ className, currentPlan, plans, customPlans, subscriptionStatus }) {
	const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);

	// Override to show free plan as selected when canceled
	if (subscriptionStatus == SubscriptionStatus.CANCELED && plans) {
		currentPlan = plans.find(plan => plan.price == 0);
	}

	const handleCancel = () => {
		setOpenFeedbackDialog(true);
	}

	const onFeedbackRequestDialogClose = () => {
		setOpenFeedbackDialog(false);
		setTimeout(() => {
			alert("Success! Please allow a few minutes for your subscription to cancel.");
		}, 500);
		setTimeout(() => {location.reload()}, 2000);
	}

	return (
		<section className={clsx(classes.root, className)}>
			<PageHeading title="Upgrade Plan" />
			<UpgradePlans currentPlan={currentPlan} plans={plans} subscriptionStatus={subscriptionStatus} onCancel={handleCancel} />
			<CustomPlansRow currentPlan={currentPlan} customPlans={customPlans} subscriptionStatus={subscriptionStatus} />
			<FeedbackDialog open={openFeedbackDialog} onClose={onFeedbackRequestDialogClose} />
		</section>
	)
}

function CustomPlansRow({currentPlan, customPlans, subscriptionStatus }) {
	if (!customPlans || !customPlans.length) return null;
	
	return (
		<>
			<PageHeading title="Custom Plans" />
			<UpgradePlans currentPlan={currentPlan} plans={customPlans} subscriptionStatus={subscriptionStatus} />
		</>
	)
}
import {useContext, useEffect, useState} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import paths from "~/src/paths";
import { PlanBillingInterval, RefillPaymentSource } from '~/src/enums';
import { PayPalButtons } from "@paypal/react-paypal-js";
import PriceCard from "~/src/Components/Common/PriceCard";
import UserContext from '~/src/Components/UserContext';
import LocalUser from '~/src/Models/LocalUser';

import PixelService from '~/src/Services/PixelService';
import GTagService from '~/src/Services/GTagService';
import TikTokService from '~/src/Services/TikTokService';
import FetchWrapper from "~/src/Services/FetchWrapper";

import BillingIntervalSwitch from "~/src/Components/Common/BillingIntervalSwitch";

import Alert from '@mui/material/Alert';

export default function Upgrade({ currentPlan, plans, onCancel }) {
	const [error, setError] = useState(null);
    const [loadingPlanID, setLoadingPlanID] = useState(null);
	const [selectedInterval, setSelectedInterval] = useState(PlanBillingInterval.MONTHLY);
	const {user} = useContext(UserContext);
	const enableIntervalSwitch = plans && plans.some(plan => plan.billingInterval == PlanBillingInterval.YEARLY);

	useEffect(() => {
		if (currentPlan) {
			const interval = currentPlan.billingInterval == PlanBillingInterval.ONCE ? PlanBillingInterval.MONTHLY : currentPlan.billingInterval;
			setSelectedInterval(interval);
		}
	}, [currentPlan]);

	const handleSelectClick = async (planID) => {
        setLoadingPlanID(planID);
		setError(null);

		try {
			const selectedPlan = plans.find(plan => plan.id === planID);
			if (selectedPlan.price == 0) {
				await cancel();
			} else {
				await stripeCheckout(selectedPlan.id);
			}
		} catch (err) {
			setError(err);
		}

		setLoadingPlanID(null);
		logInitiateCheckout();
    }

	const stripeCheckout = async (planID) => {
		const response = await FetchWrapper.post(`/api/billing/stripeSubscriptionCheckoutSession`, { cancelURL: window.location.href, planID: planID})
		window.location.href = response.sessionURL;
	}

	const cancel = async () => {
		const didConfirm = confirm("Downgrading to the free plan will cancel your current subscription. Do you wish to proceed?");
		if (!didConfirm) return;

		await FetchWrapper.get(`/api/user/cancel`);
		onCancel && onCancel();
	}

	const handleIntervalChange = (interval) => {
		setSelectedInterval(interval);
	}

	const logInitiateCheckout = () => {
		PixelService.logPixel('InitiateCheckout');
		GTagService.initiateCheckout();
		TikTokService.initiateCheckout();
	}

	const makeCardFromPlan = (p) => {
		const isFreePlan = p.price == 0;
		// Show the free plan and plans that match our selected interval
		if (!isFreePlan && p.billingInterval !== selectedInterval) return null;

		// Expected behavior is for the clicked button to show "loading" while the others are disabled.
		// Also current plan is disabled and says "Current"
		const isCurrentPlan = currentPlan.id == p.id;
		const planInfoUnavailable = currentPlan.id == null;
		const isLoading = loadingPlanID != null;
		let disableBtn = (
			isCurrentPlan || 
			planInfoUnavailable || 
			isLoading
		);

		// If we're on an annual plan, disable downgrades and monthly.
		let tooltipText = "";
		if (currentPlan.billingInterval == PlanBillingInterval.YEARLY) {
			const isDowngrade = ((p.billingInterval === PlanBillingInterval.MONTHLY) || (p.price < currentPlan.price)) && !isFreePlan;
			disableBtn = isDowngrade || disableBtn;
			tooltipText = isDowngrade ? "You must cancel your plan to downgrade" : "";
		}

		let buttonText;
		if (isCurrentPlan) {
			buttonText = "Current";
		} else if (isFreePlan) {
			buttonText = "Select";
		} else {
			buttonText = "Buy";
		}

		return (
			<PriceCard
				className={classes.card}
				key={p.id}
				plan={p.name}
				planID={p.id}
				price={p.price}
				trackedStores={p.trackedStores}
				topProducts={p.topProducts}
				topStores={p.topStores}
				interval={p.billingInterval}
				onClick={handleSelectClick}
				loading={p.id == loadingPlanID}
				disabled={disableBtn}
				buttonText={buttonText}
				tooltipText={tooltipText}
				extraButton={
					<CustomPayPalButton 
						logInitiateCheckout={logInitiateCheckout} 
						setLoadingPlanID={setLoadingPlanID} 
						setError={setError} 
						user={user}
						disabled={disableBtn}
						plan={p} />
				}
			/>
		)
	}

	return (
		<>
			{plans && enableIntervalSwitch && <BillingIntervalSwitch onChange={handleIntervalChange} className={classes.switch} interval={selectedInterval} />}
			{error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
			<div className={classes.cards}>
				{plans && plans.map(makeCardFromPlan)}
			</div>
		</>
	)
}

function CustomPayPalButton({logInitiateCheckout, setLoadingPlanID, setError, plan, user, disabled}) {

	// Don't show PayPal button for free plan
	if (plan.price <= 0) return null;

	const handlePayPalClicked = async (data, actions, planID) => {
		setLoadingPlanID(planID);
		setError(null);
		logInitiateCheckout();

		try {
			// Create or get the paypal plan
			const response = await FetchWrapper.post(`/api/billing/paypalPlanID`, {planID: planID});
			// Return the subscription info to the smart button
			return actions.subscription.create({
				'plan_id': response.paypalPlanID,
				'custom_id': user.id,
			});
		} catch (err) {
			setError(err);
			setLoadingPlanID(null);
		}
	}

	return (
		<PayPalButtons 
			className={classes.paypalBtn}
			fundingSource="paypal"
			style={{height: 40}}
			disabled={disabled}
			forceReRender={[plan.id]}
			createSubscription={(data, actions) => {
				return handlePayPalClicked(data, actions, plan.id);
			}}
			onApprove={(data, actions) => {
				window.location.href = `${paths.billingSuccess}?source=${RefillPaymentSource.PayPal}&payment=subscription`;
			}}
			onError={(err) => {
				setError("Could not initiate PayPal checkout");
				setLoadingPlanID(null);
			}}
			onCancel={(data, actions) => {
				setLoadingPlanID(null);
			}}
		/>
	)
}
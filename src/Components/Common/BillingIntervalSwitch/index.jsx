import {useContext, useEffect, useState} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import { PlanBillingInterval } from '~/src/enums';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const CustomSwitch = styled(Switch)(({ theme }) => ({
	'& .MuiSwitch-track': {
		background: 'var(--background-gradient)'
	},
	'& .MuiSwitch-thumb': {
		backgroundColor: 'var(--single-brand-color)'
	},
}));
  
export default function BillingIntervalSwitch({className, onChange, interval = PlanBillingInterval.MONTHLY}) {
	const allowedIntervals = [PlanBillingInterval.MONTHLY, PlanBillingInterval.YEARLY];
	interval = allowedIntervals.includes(interval) ? interval : PlanBillingInterval.MONTHLY;

	const handleChange = (event) => {
		const interval = event.target.checked ? PlanBillingInterval.YEARLY : PlanBillingInterval.MONTHLY;
		onChange && onChange(interval);
	};

	return (
		<div className={clsx(classes.root, className)}>
			<div className={classes.label}>Monthly</div>
			<CustomSwitch checked={interval == PlanBillingInterval.YEARLY} onChange={handleChange} />
			<div className={classes.label}>
				Yearly
				<div className={clsx(classes.pill, interval == PlanBillingInterval.YEARLY ? classes.show : null)}>2 months free!</div>
			</div>
		</div>
	)
}
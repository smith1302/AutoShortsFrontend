import React from "react";
import clsx from "clsx";
import globals from "~/src/globals";
import {PlanBillingInterval} from '~/src/enums';
import Button from '~/src/Components/Common/Button';
import classes from "./index.module.css";

import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

const formatNum = (num) => parseFloat(num).toLocaleString({minimumFractionDigits: 6});

export default function Card({ children, className, plan, planID, price, interval, popular, buttonText, frequency, onClick, loading, disabled, extraButton, tooltipText }) {

    const isDisabled = disabled || loading;
    const isFreePlan = price == 0;

    const purchaseClicked = (e) => {
        e.preventDefault();
        if (onClick && !isDisabled) onClick(planID);
    }

    let normalizedPrice = price;
    if (interval == PlanBillingInterval.YEARLY) {
        normalizedPrice = Math.ceil(price / 12);
    }

    const postsPerWeekText = (frequency) => {
        if (frequency == 0) return "Unlimited";
        if (frequency < 7) return (<span>Posts <b>{frequency} time{frequency > 1 ? 's' : ''} a week</b></span>);
        if (frequency == 7) return (<span>Posts <b>once a day</b></span>);
        if (frequency == 14) return (<span>Posts <b>twice a day</b></span>);
    }

    return (
        <div className={clsx(classes.root, className)}>
            <Paper sx={{height: '100%'}}>
                <Tooltip title={tooltipText || ""}>
                    <div className={classes.content}>
                        {popular && <div className={classes.popular}>Most Popular</div>}
                        <div className={classes.planName}>{plan.toUpperCase()}</div>
                        <div className={classes.pricing}>
                            <div>
                                <span className={classes.price}>${normalizedPrice}</span>{!isFreePlan && <span className={classes.interval}>/month</span>}
                            </div>
                            <div className={clsx(classes.perSeries, isFreePlan ? classes.invisible : null)}>Per Series</div>
                        </div>
                        <div className={classes.features}>
                            <FeatureRow>{postsPerWeekText(frequency)}</FeatureRow>
                            <FeatureRow>Auto-posts to channel</FeatureRow>
                            <FeatureRow>Edit & preview videos</FeatureRow>
                            <FeatureRow strikethrough={isFreePlan}>Priority video rendering</FeatureRow>
                            <FeatureRow strikethrough={isFreePlan}>Newest features</FeatureRow>
                        </div>
                        {buttonText && <Button className={classes.btn} loading={loading} disabled={isDisabled} onClick={purchaseClicked}>{buttonText}</Button>}
                        {extraButton}
                    </div>
                </Tooltip>
            </Paper>
        </div>
    )
}

function FeatureRow({children, strikethrough=false}) {
    const icon = strikethrough ? <CancelIcon /> : <CheckIcon sx={{ color: "#58ba82" }} />;
    return (
        <div className={strikethrough ? classes.strike : null}>
            <div className={classes.check}>{icon}</div>
            {children}
        </div>
    )
}
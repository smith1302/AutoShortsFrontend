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

export default function Card({ children, className, plan, planID, price, interval, popular, buttonText, trackedStores, topProducts, topStores, onClick, loading, disabled, extraButton, tooltipText }) {

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

    return (
        <div className={clsx(classes.root, className)}>
            <Paper sx={{height: '100%'}}>
                <Tooltip title={tooltipText || ""}>
                    <div className={classes.content}>
                        {popular && <div className={classes.popular}>Most Popular</div>}
                        <div className={classes.planName}>{plan.toUpperCase()}</div>
                        <div className={classes.pricing}>
                            <span className={classes.price}>${normalizedPrice}</span>{!isFreePlan && <span className={classes.interval}>/month</span>}
                        </div>
                        <div className={classes.features}>
                            <FeatureRow>{`${trackedStores} Tracked Stores`}</FeatureRow>
                            <FeatureRow>{`Top ${topProducts} Global Products`}</FeatureRow>
                            <FeatureRow>{`Top ${topStores} Global Stores`}</FeatureRow>
                            <FeatureRow>Real Time Sales</FeatureRow>
                            <FeatureRow strikethrough={isFreePlan}>Product Filters</FeatureRow>
                            <FeatureRow strikethrough={isFreePlan}>Newest features</FeatureRow>
                            {/* {!isFreePlan && <FeatureRow>Billed {interval}</FeatureRow>} */}
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
import {useState} from "react";
import classes from "./index.module.scss";

import URLDisplay from "./URLDisplay";
import PayPalSection from "./PayPalSection";
import StatDisplay from "./StatDisplay";
import FAQ from "./FAQ";
import Assets from "./Assets";

export default function Main({ affiliateID, paypal, stats }) {
	return (
		<div className={classes.root}>
            <img src='/images/affiliate-header.png' className={classes.headerLogo} />
            <StatDisplay className={classes.section} stats={stats} />
            <URLDisplay className={classes.section} affiliateID={affiliateID} />
            <PayPalSection className={classes.section} defaultPayPal={paypal} />
            <Assets className={classes.section} />
            <FAQ className={classes.section} defaultPayPal={paypal} />
        </div>
	)
}
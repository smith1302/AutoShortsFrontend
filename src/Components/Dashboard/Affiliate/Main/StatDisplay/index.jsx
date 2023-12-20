import classes from "./index.module.scss";
import clsx from "clsx";
import globals from '~/src/globals';

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Paper from '@mui/material/Paper';

export default function StatDisplay({ className, stats }) {
	return (
		<section className={clsx(className, classes.section)}>
            <PageHeading title="Your Stats" />
            <Paper className={classes.paper}>
                <div className={classes.statItem}>
                    <div className={classes.num}>{numFormat(stats.clicks)}</div>
                    <div className={classes.label}>Clicks</div>
                </div>
                <div className={classes.statItem}>
                    <div className={classes.num}>{numFormat(stats.registers)}</div>
                    <div className={classes.label}>Sign Ups</div>
                </div>
                <div className={classes.statItem}>
                    <div className={classes.num}>{numFormat(stats.conversions)}</div>
                    <div className={classes.label}>Conversions</div>
                </div>
                <div className={classes.statItem}>
                    <div className={classes.num}>{currencyFormat(stats.unpaid)}</div>
                    <div className={classes.label}>Unpaid Commission</div>
                </div>
            </Paper>
        </section>
	)
}

function numFormat(num) {
    return num.toLocaleString();
}

function currencyFormat(num) {
    return `$${numFormat(num)}`;
}
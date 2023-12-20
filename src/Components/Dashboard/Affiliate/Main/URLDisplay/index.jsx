import classes from "./index.module.scss";
import clsx from "clsx";
import globals from '~/src/globals';

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Paper from '@mui/material/Paper';

export default function URLDisplay({ className, affiliateID }) {
	return (
		<section className={clsx(className, classes.section)}>
            <PageHeading title="Your Affiliate URL" />
            <Paper className={classes.paper}>
                <span className={classes.affiliateURL}>{globals.fullURL}?ref={affiliateID}</span>
            </Paper>
        </section>
	)
}
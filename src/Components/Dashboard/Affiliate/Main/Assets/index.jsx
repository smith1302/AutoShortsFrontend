import classes from "./index.module.scss";
import clsx from "clsx";
import globals from '~/src/globals';

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Paper from '@mui/material/Paper';

export default function Assets({ className, affiliateID }) {
    return null;
	return (
		<section className={clsx(className, classes.section)}>
            <PageHeading title="Marketing Assets" />
            <Paper className={classes.paper}>
                <Image name="Cover Photo" url="https://nichescraperbucket.s3.us-east-2.amazonaws.com/ecomwave_affiliate/CoverAlt2.png" />
                <Image name="Logo" url="https://nichescraperbucket.s3.us-east-2.amazonaws.com/ecomwave_affiliate/LogoV2.png" />
                <Image name="Logo 2" url="https://nichescraperbucket.s3.us-east-2.amazonaws.com/ecomwave_affiliate/SocialProfile.png" />
                <Video name="Promo Video" url="https://nichescraperbucket.s3.us-east-2.amazonaws.com/ecomwave_affiliate/TestimonialFullProduct.mp4" />
            </Paper>
        </section>
	)
}

function Image({url, name}) {
    return (
        <div className={classes.col}>
            <div className={classes.title}>{name}</div>
            <a href={url} download>
                <img src={url} alt="Logo" />
            </a>
            <a href={url} className={classes.download} download>Download</a>
        </div>
    )
}

function Video({url, name}) {
    return (
        <div className={classes.col}>
            <div className={classes.title}>{name}</div>
            <a href={url} download>
                <video controls>
                    <source src={url} type="video/mp4" />
                </video>
            </a>
            <a href={url} className={classes.download} download>Download</a>
        </div>
    )
}
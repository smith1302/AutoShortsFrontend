import React from "react";
import clsx from "clsx";

import globals from '~/src/globals';
import paths from "~/src/paths";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import classes from "./index.module.css";

export default function Footer({ children }) {
    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.column}>
                    <div className={clsx(classes.title, classes.brand)}>
                        <img src='/images/LogoWhite.png' alt="Logo" />{globals.appNameFull}
                    </div>
                    <div className={classes.body}>
                    {globals.appName} is a groundbreaking platform designed to simplify and enhance your TikTok content strategy.
                    {/* {globals.appName} is a groundbreaking platform designed to simplify and enhance your TikTok content strategy. Our innovative technology turns your niche topics, like "Scary Stories", into captivating, faceless videos. Whether you're hands-on or prefer automation, AutoShorts.ai is your partner in content creation. */}
                    <br /><br />
                    <span style={{opacity: 0.8}}>{globals.appName} © {(new Date().getUTCFullYear())}</span>
                    </div>
                </div>
                <div className={classes.column}>
                    <div className={clsx(classes.title, classes.category)}>Company</div>
                    <div className={classes.body}>
                        <a href={paths.pricing}>Pricing</a>
                        <a href={paths.partners}>Affiliates</a>
                        <a href={paths.contact}>Contact Us</a>
                    </div>
                </div>
                <div className={classes.column}>
                    <div className={clsx(classes.title, classes.category)}>Support</div>
                    <div className={classes.body}>
                        <a href={paths.faq}>FAQ</a>
                        <a href={paths.terms}>Terms & Conditions</a>
                        <a href={paths.privacy}>Privacy Policy</a>
                    </div>
                </div>
                <div className={classes.column}>
                    <div className={clsx(classes.title, classes.category)}>Social</div>
                    <div className={classes.body}>
                        <a href={paths.facebook} target="_blank"><FacebookIcon /> Facebook</a>
                        <a href={paths.youtube} target="_blank"><YouTubeIcon /> YouTube</a>
                        <a href={paths.instagram}><InstagramIcon /> Instagram</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
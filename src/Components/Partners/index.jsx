import { useContext } from 'react';
import globals from '~/src/globals';
import paths from '~/src/paths';
import BasicPage from '~/src/Components/Common/BasicPage';
import Hero from "./Hero";
import SectionHeader from "./SectionHeader";
import UserContext from '~/src/Components/UserContext';
import Router from 'next/router';

import classes from './index.module.scss'

export default function Partners() {
    const {user} = useContext(UserContext);
    if (user) {
        Router.replace(paths.affiliate);
        return null;
    }

    return (
        <BasicPage title="Affiliate Program">
            <Hero />
            <img src='/images/SquigleArrowShort.png' className={classes.squigle} />
            <section className={classes.stepSection}>
                <div className={classes.step}>
                    <div className={classes.pill}>Step 1</div>
                    <h3 className={classes.contentTitle}>Register an Account</h3>
                    <p className={classes}>
                        Create a <a href={paths.affiliate}>free account</a> to get started. You'll be able to track your earnings and see how much you've earned.
                    </p>
                </div>
                <div className={classes.step}>
                    <div className={classes.pill}>Step 2</div>
                    <h3 className={classes.contentTitle}>Create your Link</h3>
                    <p className={classes}>
                        Once you've registered, you'll be able to create your affiliate link. This link will track all your referrals.
                    </p>
                </div>
                <div className={classes.step}>
                    <div className={classes.pill}>Step 3</div>
                    <h3 className={classes.contentTitle}>Start Earning</h3>
                    <p className={classes}>
                        You'll receive a <b>30% recurring</b> commission for each new customer you refer with no earning cap.
                    </p>
                </div>
            </section>
            <section className={classes.whyus}>
                <img src='/images/awards.png' className={classes.awards} />
                <SectionHeader title="WHY JOIN US?" subtitle="Great reasons to join our affiliate team" />
                <div className={classes.well}>
                    <ul>
                        <li>
                            <b>High Earning Potential.</b><br />Our commissions are recurring, meaning you'll earn 30% of every payment your referral makes for as long as they're a customer. For example,
                            if your referral purchases our unlimited yearly plan, that is <b>$237 that goes straigh to your pocket.</b>
                        </li>
                        <li>
                            <b>No Capped Earnings.</b><br />There's no limit to how much you can earn. The more customers you refer, the more you'll earn so you can steadily build up your passive income.
                        </li>
                        <li>
                            <b>High Converting Landing Pages.</b><br />We've spent a lot of time and money creating high converting landing pages that will help you earn more.
                        </li>
                        <li>
                            <b>Customers Love Us!</b><br />Our customers love us and we love them. By promoting {globals.appName}, you'll be helping people get the best possible results.
                        </li>
                        <li>
                            <b>Ready To Get Started?</b><br /><a href={paths.affiliate}>Sign up</a> and get your affiliate URL in minutes.
                        </li>
                    </ul>
                </div>
            </section>
        </BasicPage>
    );
}
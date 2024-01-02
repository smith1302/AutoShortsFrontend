import {useEffect, useState, useContext} from "react";
import Layout from "../Layout";
import classes from "./index.module.scss";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import UserContext from '~/src/Components/UserContext';
import FetchWrapper from "~/src/Services/FetchWrapper";
import OnboardService from "~/src/Services/OnboardService";

import Videos from "./Videos";
import Announcements from "./Announcements";

import SeriesViewAll from "~/src/Components/Dashboard/Series";

import Paper from '@mui/material/Paper';

export default withAuthProtection(SeriesViewAll);

/*

function DashboardHome({ children }) {
    const {user, subscriptionSummary} = useContext(UserContext);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [announcements, setAnnouncements] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [nextRefresh, setNextRefresh] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [email, setEmail] = useState("");

    useEffect(() => {
        setEmail(user.email);

        FetchWrapper.post(`/api/user/dashboard`)
        .then(response => {
            setHasLoaded(true);
            setAnnouncements(response.announcements);
            setCurrentPlan(response.currentPlan);
            setNextRefresh(response.nextRefresh);
            setSubscriptionStatus(response.subscriptionStatus);
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

	return (
		<Layout loading={!hasLoaded}>
            <div className={classes.root}>
                <ContentContainer width={1100}>
                    <img src='/images/remote-team.png' className={classes.headerLogo} />
                    <Paper className={classes.paper}>
                        Welcome back, {email}
                    </Paper>
                    <Announcements announcements={announcements} />
                    <Videos />
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(DashboardHome);
*/
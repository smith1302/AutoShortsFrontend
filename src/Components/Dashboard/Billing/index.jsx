import {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import Layout from "../Layout";
import Upgrade from "./Upgrade";
import PlanInfo from "./PlanInfo";
import Testimonials from "./Testimonials";
import PastDueReminder from "./PastDueReminder";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';

import FetchWrapper from "~/src/Services/FetchWrapper";

function Billing({ children }) {
    const [hasLoaded, setHasLoaded] = useState(false);
	const [currentPlan, setCurrentPlan] = useState(null);
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);
    const [nextRefresh, setNextRefresh] = useState(null);
    const [subscriptionPrice, setSubscriptionPrice] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [subscriptionSource, setSubscriptionSource] = useState(null);
    const [paymentHistoryCount, setPaymentHistoryCount] = useState(null);
    const [plans, setPlans] = useState(null);
    const [customUserPlans, setCustomUserPlans] = useState(null);

    useEffect(() => {
        FetchWrapper.post(`/api/user/billing`)
        .then(response => {
            setHasLoaded(true);
			setCurrentPlan(response.currentPlan);
            setCurrentPeriodEnd(response.currentPeriodEnd);
            setNextRefresh(response.nextRefresh);
            setSubscriptionPrice(response.subscriptionPrice);
            setSubscriptionStatus(response.subscriptionStatus);
            setSubscriptionSource(response.subscriptionSource);
            setPaymentHistoryCount(response.paymentHistoryCount);
            setPlans(response.plans);
            setCustomUserPlans(response.customUserPlans);
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

	return (
		<Layout loading={!hasLoaded}>
            <div className={classes.root}>
                <ContentContainer>
                    <img src='/images/billing.png' className={classes.headerLogo} />
                    <PastDueReminder subscriptionStatus={subscriptionStatus} subscriptionSource={subscriptionSource} />
                    <PlanInfo 
                        className={classes.sectionMargin} 
                        subscriptionStatus={subscriptionStatus} 
                        subscriptionSource={subscriptionSource}
                        subscriptionPrice={subscriptionPrice} 
                        currentPlan={currentPlan} 
                        currentPeriodEnd={currentPeriodEnd} 
                        paymentHistoryCount={paymentHistoryCount} />
					<Upgrade 
                        className={classes.sectionMargin} 
                        currentPlan={currentPlan} 
                        subscriptionStatus={subscriptionStatus} 
                        customPlans={customUserPlans}
                        plans={plans} />
                    <Testimonials subscriptionStatus={subscriptionStatus} />
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(Billing);
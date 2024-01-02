import {useContext, useState} from "react";
import PriceCard from "~/src/Components/Common/PriceCard";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import UserContext from '~/src/Components/UserContext';
import BillingIntervalSwitch from "~/src/Components/Common/BillingIntervalSwitch";
import LocalUser from '~/src/Models/LocalUser';
import { PlanBillingInterval } from '~/src/enums';

import paths from '~/src/paths';
import classes from "./index.module.scss";

export default function Pricing({ children, plans }) {
    const {user} = useContext(UserContext);
    const [selectedInterval, setSelectedInterval] = useState(PlanBillingInterval.MONTHLY);
    const relevantPlans = plans.filter(plan => plan.webEnabled);

    const clickHandler = () => {
        window.location.href = paths.register;
    }

    const handleIntervalChange = (interval) => {
		setSelectedInterval(interval);
	}

    return (
        <div className={classes.root} id="pricing">
            <ContentContainer className={classes.content} fade={true}>
                <SectionHeader title="PRICING" subtitle="PAY FOR WHAT YOU NEED" />
                {/* <BillingIntervalSwitch onChange={handleIntervalChange} className={classes.switch} interval={selectedInterval} /> */}
                <div className={classes.cards}>
                    {relevantPlans && relevantPlans.map(p => {
                        // Show the free plan and plans that match our selected interval
                        const isFreePlan = p.price == 0;
					    if (!isFreePlan && p.billingInterval !== selectedInterval) return null;
                        return (
                            <PriceCard
                                className={classes.card}
                                key={p.id}
                                plan={p.name}
                                planID={p.id}
                                price={p.price}
                                frequency={p.frequency}
                                interval={p.billingInterval}
                                onClick={clickHandler}
                                buttonText="Try Now!"
                            />
                        )
                    })}
                </div>
            </ContentContainer>
        </div>
    )
}
import classes from "./index.module.scss";
import { SubscriptionStatus } from '~/src/enums';
import SectionHeader from "~/src/Components/Landing/SectionHeader";

export default function Testimonials({ subscriptionStatus }) {
	
	if (subscriptionStatus === SubscriptionStatus.ACTIVE) {
		return null;
	}

	return null;
	return (
		<>
			<SectionHeader title="A Game Changer" subtitle="Why Hundreds of Members Are Loving EcomWave" />
			<img src='/images/Testimonials.png' className={classes.testimonials} />
		</>
	)
}
import classes from "./index.module.scss";
import clsx from "clsx";
import globals from '~/src/globals';

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Paper from '@mui/material/Paper';

export default function StatDisplay({ className, stats }) {
	return (
		<section className={clsx(className, classes.section)}>
            <PageHeading title="Frequently Asked" />
            <div>
                <QABlock 
                    question="How does this work?"
                    answer="The way it works is simple! We give you a unique affiliate URL to share. If someone registers an account and purchases a membership within 30 days after clicking the link, we'll give you a cut of the sale!"
                />
                <QABlock 
                    question="What commissions do I get?"
                    answer="Our affiliate program offers a 30% recurring commission. Our recurring model means great passive income for you."
                />
                <QABlock 
                    question="When are payouts sent out?"
                    answer="Payouts will be sent on the 1st of every month through PayPal."
                />
                <QABlock 
                    question="Is there a minimum payout requirement?"
                    answer='Yes. You need to have a minimum "unpaid commissions" of $30 before receiving your payout in order to keep transaction fees low.'
                />
                <QABlock 
                    question="How does affiliate tracking work?"
                    answer='The way the EcomWave affiliate tracking works is if someone clicks on your link, a 30 day cookie is attached in their browser. This tracks them so when they register an account they are locked-in to be attributed to you forever.'
                />
                <QABlock 
                    question={`Can I run ads to promote ${globals.appName}?`}
                    answer={<>In general, you can. However, <u>we do not allow promotion through Google Search ads.</u> You can run ads on other platforms such as Facebook, Instagram, TikTok, Reddit, YouTube, etc.</>}
                />
            </div>
        </section>
	)
}

function QABlock({question, answer}) {
    return (
        <div className={classes.qa}>
            <h3 className={classes.question}>{question}</h3>
            <div className={classes.answer}>
                {answer}
            </div>
        </div>
    )
}
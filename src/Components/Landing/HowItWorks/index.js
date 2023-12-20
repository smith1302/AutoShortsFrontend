import React from "react";
import clsx from "clsx";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import globals from '~/src/globals';
import classes from "./index.module.scss";

export default function Explainer({ children }) {
    return (
        <div className={classes.root}>
            <ContentContainer className={classes.content} fade={true}>
                {/* <SectionHeader title={"Features You'll Love"} subtitle="Helping you make smart business decisions." /> */}
                <SectionHeader title={"Track Your Competitors"} subtitle="Stop The Guesswork" />

                <div className={clsx(classes.grid, classes.topspacing)}>
                    <div className={classes.left}>
                        <div className={classes.imgContainer}>
                            <img src='/images/HowItWorks1.png' className={classes.img}/>
                        </div>
                    </div>
                    <div className={classes.right}>
                        <div className={classes.pill}>Feature 1</div>
                        <h3 className={classes.contentTitle}>Global Top Products</h3>
                        <p className={classes}>Easily discover the most sold products of the day - across thousands of Shopify stores. Get unlimited ideas using these invaluable insights to find products that are dominating the market.</p>
                    </div>
                </div>

                <img className={classes.connector} src='/images/ConnectorLR.png' />

                <div className={clsx(classes.grid, classes.reverse)}>
                    <div className={classes.left}>
                        <div className={classes.imgContainer}>
                            <img src='/images/HowItWorks2.png' className={classes.img}/>
                        </div>
                    </div>
                    <div className={classes.right}>
                        <div className={classes.pill}>Feature 2</div>
                        <h3 className={classes.contentTitle}>Competitor Analysis</h3>
                        <p className={classes}>Ever wonder if that <b><i>TikTok or Facebook ad is actually profitable</i></b>? Just enter the product link and track a competitor's real-time sales, revenue, and order history for each of their products. No more guessing!</p>
                    </div>
                </div>

                <img className={classes.connector} src='/images/ConnectorRL.png' />

                <div className={classes.grid}>
                    <div className={classes.left}>
                        <div className={classes.imgContainer}>
                            <img src='/images/HowItWorks3.png' className={classes.img}/>
                        </div>
                    </div>
                    <div className={classes.right}>
                        <div className={classes.pill}>Feature 3</div>
                        <h3 className={classes.contentTitle}>Global Top Stores</h3>
                        <p className={classes}>Need a place to start? See which stores are actually making sales by viewing our global leaderboard. Then, analyze the stores to see which products are making the bulk of their sales.</p>
                    </div>
                </div>

            </ContentContainer>
        </div>
    )
}
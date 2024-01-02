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
                <SectionHeader title={"Manage The Entire Flow"} subtitle="So You Can Focus On Growing" />

                <div className={clsx(classes.grid, classes.topspacing)}>
                    <div className={classes.left}>
                        <div className={classes.imgContainer}>
                            <img src='/images/HowItWorks1.png' className={classes.img}/>
                        </div>
                    </div>
                    <div className={classes.right}>
                        <div className={classes.pill}>Feature 1</div>
                        <h3 className={classes.contentTitle}>Create Your Series</h3>
                        <p className={classes}>Simply choose a topic that your Faceless video series will be about. Our AI will begin creating your first video to preview and edit.</p>
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
                        <h3 className={classes.contentTitle}>Schedule Videos</h3>
                        <p className={classes}>You can preview and edit the contents of your video at anytime before they are scheduled to publish.</p>
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
                        <h3 className={classes.contentTitle}>Manage Your Series</h3>
                        <p className={classes}>Easily manage, delete, and preview all of your Faceless Video series in one place.</p>
                    </div>
                </div>

            </ContentContainer>
        </div>
    )
}
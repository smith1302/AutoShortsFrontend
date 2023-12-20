import React from "react";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import globals from '~/src/globals';
import classes from "./index.module.scss";

export default function Explainer({ children }) {
    return (
        <div className={classes.root}>
            <ContentContainer className={classes.content} fade={true}>
                <SectionHeader title={"WHAT IS "+globals.appName+"?"} subtitle="In a nutshell" />

                <div className={classes.grid}>
                    <div className={classes.left}>
                        <img src='/images/ExampleResultLandingWide2.png' className={classes.textblock}/>
                    </div>
                    <div className={classes.right}>
                        {globals.appName} is a highly trained artificial intelligence tool that can write content for you. All content is <b>completely original and SEO friendly.</b> In fact, this whole page was written with A.I.<br />
                        <p>Tired of writing product descriptions? Just give {globals.appName} a few details about your product and watch it generate incredible, <b>high-converting descriptions.</b></p>
                        <p>Trouble creating Facebook or Google ad copy? We've got you covered.</p>
                    </div>
                </div>
            </ContentContainer>
        </div>
    )
}
import React from "react";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import paths from '~/src/paths';
import classes from "./index.module.scss";

export default function Reviews({ children, plans }) {

    return (
        <div className={classes.root}>
            <ContentContainer className={classes.content} fade={true}>
                <SectionHeader title="Don't Take Our Word For It" subtitle="Take The Word Of Our Hundreds Of Members" />
                <img src='/images/Testimonials.png' className={classes.testimonials} />
            </ContentContainer>
        </div>
    )
}
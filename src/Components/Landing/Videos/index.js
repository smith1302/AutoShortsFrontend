import React from "react";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import globals from '~/src/globals';
import classes from "./index.module.scss";

export default function Videos({ children }) {
    return (
        <div className={classes.root}>
            <img src='/images/FunkySquare.svg' className={classes.squareLeft} />
            <img src='/images/FunkySquare.svg' className={classes.squareRight} />
            <ContentContainer className={classes.content} fade={true}>
                <SectionHeader title="See it in action" subtitle="Video Guides" />

                <div className={classes.grid}>
                    <div className={classes.videoContainer}>
                        <iframe src="https://www.youtube.com/embed/XzjilUjfN-c" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                    <div className={classes.videoContainer}>
                        <iframe src="https://www.youtube.com/embed/zGYJt5Khh2E" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                </div>
            </ContentContainer>
        </div>
    )
}
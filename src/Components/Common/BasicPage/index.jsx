import React from "react";

import Page from "~/src/Components/Common/Page";
import NavBar from "~/src/Components/Common/NavBar";
import Footer from "~/src/Components/Common/Footer";
import ContentContainer from "~/src/Components/Common/ContentContainer";

import classes from "./index.module.scss";

export default function BasicPage({ children, title, heroTitle, heroSubtitle, light=true }) {

    return (
        <Page title={title} light={light}>
            <NavBar light={!light} />
            <ContentContainer className={classes.contentContainer}>
                {hero(heroTitle, heroSubtitle)}
                {children}
            </ContentContainer>
            <Footer />
        </Page>
    );
}

function hero(title, subtitle) {
    if (!title && !subtitle) {
        return null;
    }

    return (
        <div className={classes.headerContainer}>
            {title && <h1 className={classes.header}>{title}</h1>}
            {subtitle && <h3 className={classes.subheader}>{subtitle}</h3>}
        </div>
    )
}
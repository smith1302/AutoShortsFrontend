import React, { useEffect } from "react";

import NavBar from "~/src/Components/Common/NavBar";
import Hero from "./Hero";
import Pricing from "./Pricing";
import Explainer from "./Explainer";
import HowItWorks from "./HowItWorks";
import Videos from "./Videos";
import Reviews from "./Reviews";
import Footer from "~/src/Components/Common/Footer";

import classes from "./index.module.css";

export default function Landing({ children, plans }) {

    return (
        <div className={classes.root}>
            <NavBar />
            <Hero />
            <img src='/images/SquigleArrowShort.png' className={classes.squigle} />
            <HowItWorks />
            {/* <Videos /> */}
            <Pricing plans={plans} />
            {/* <Reviews /> */}
            <Footer />
        </div>
    )
}
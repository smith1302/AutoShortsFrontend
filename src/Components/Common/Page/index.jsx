import React from "react";
import Head from 'next/head';
import clsx from 'clsx';
import globals from "~/src/globals";

import classes from "./index.module.css";

export default function BasicPage({ children, title, light=true }) {
    return (
        <div className={clsx(classes.root, light ? classes.light : classes.dark)}>
            <Head>
                <title>{title} | {globals.appName}</title>
            </Head>
            {children}
        </div>
    );
}
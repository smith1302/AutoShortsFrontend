import React from "react"

import clsx from "clsx"
import classes from "./index.module.scss"

export default function SectionHeader({ className, title, subtitle, onDark = false }) {
    return (
        <div className={clsx(className, classes.root, onDark ? classes.onDark : classes.onLight)}>
            <div className={classes.title}>{title}</div>
            <div className={classes.subtitle}>{subtitle}</div>
        </div>
    )
}
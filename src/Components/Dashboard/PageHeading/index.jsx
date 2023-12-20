import {useState} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

export default function PageHeading({ className, title, right, light=false }) {
	return (
        <div className={clsx(classes.row, className, light ? classes.light : null)}>
            <h1>{title}</h1>
            {right}
        </div>
	)
}
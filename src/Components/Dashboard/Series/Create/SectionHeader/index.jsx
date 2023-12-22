import classes from "./index.module.scss";
import clsx from "clsx";

export default function SectionHeader({step, title, subtitle, condense, customClass}) {
    return (
        <div className={clsx(classes.root, condense ? classes.condense : null, customClass)}>
            {step && <div className={classes.pill}>Step {step}</div>}
            <h2 className={classes.title}>{title}</h2>
            <h4 className={classes.subtitle}>{subtitle}</h4>
        </div>
    );
}
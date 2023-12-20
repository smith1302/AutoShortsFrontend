import clsx from "clsx";
import { Fade } from "react-awesome-reveal";
import classes from "./index.module.css";

export default function ContentContainer({children, className, width, fade}) {
    let style = {};
    if (width) {
        style["maxWidth"] = `${width}px`;
    }

    return (
        <div className={clsx(classes.root, className)} style={style}>
            {fade ? <Fade>{children}</Fade> : children}
        </div>
    )
}
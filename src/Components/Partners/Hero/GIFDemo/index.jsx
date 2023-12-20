import React from "react"
import classes from "./index.module.scss"

export default function GIFDemo({ children }) {
    return (
        <div className={classes.root}>
            {/* <img src='/images/gifs/herodemov3.gif' /> */}
            <iframe src="https://www.youtube.com/embed/GdzYWAtZ078" className={classes.videoContainer} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
    )
}
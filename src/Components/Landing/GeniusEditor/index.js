import React from "react";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import SectionHeader from "~/src/Components/Landing/SectionHeader";
import globals from '~/src/globals';
import classes from "./index.module.scss";

export default function GeniusEditor({ children }) {
    return (
        <div className={classes.root}>
            <ContentContainer className={classes.content} fade={true}>
                <SectionHeader title="Genius Editor" subtitle="Need more than our templates?" />

                <div className={classes.grid}>
                    <div className={classes.left}>
                        <img src='/images/gifs/GeniusEditorGif.gif' className={classes.gif}/>
                    </div>
                    <div className={classes.right}>
                        <p>
                            Unleash the full potential of A.I. with our <b>Genius Editor</b>.
                        </p>
                        <p>
                            Our A.I. is built into this smart text editor to analyze <b>your writing style and tone of voice</b> to auto-write the next sentence or paragraph for you.
                        </p>
                        <p>From stories, to blogs, to recipes, the Genius Editor can do it all!</p>
                    </div>
                </div>
            </ContentContainer>
        </div>
    )
}
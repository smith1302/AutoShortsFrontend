import classes from "./index.module.scss";
import PageHeading from "~/src/Components/Dashboard/PageHeading";

import Box from '@mui/material/Box';

export default function DashboardVideos({ children, className }) {
	return (
		<section className={className}>
            <PageHeading title="Video Guides" />
            <Box className={classes.cardGrid}>
                <div className={classes.cardGridItem}>
                    <iframe src="https://www.youtube.com/embed/lhw0sbLEo_0" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <div className={classes.cardGridItem}>
                    <iframe src="https://www.youtube.com/embed/GdzYWAtZ078" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
            </Box>
        </section>
	)
}
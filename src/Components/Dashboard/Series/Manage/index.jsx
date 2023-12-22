import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import SeriesService from "~src/Services/SeriesService";

import Layout from "~/src/Components/Dashboard/Layout";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import Button from '~/src/Components/Common/Button';
import UserContext from '~/src/Components/UserContext';
import SlantBGBox from "~/src/Components/Dashboard/SlantBGBox";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import PageHeading from "~/src/Components/Dashboard/PageHeading";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

const Series = ({id}) => {
    const [series, setSeries] = useState(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await SeriesService.get({seriesID: id});
            setSeries(data.series);
            setVideo(data.video);
            setLoading(false);
        })();
    }, []);

    return (
        <Layout>
            <div className={classes.root}>
                <SlantBGBox />
                <ContentContainer className={classes.contentContainer}>
                    {series && <PageHeading title={series.title} light={true} />}
                    <Paper className={classes.paper}>
                        {(video && series) ? (
                            <MainContent series={series} video={video} />
                        ) : (
                            <EmptyState loading={loading} />
                        )}
                    </Paper>
                </ContentContainer>
            </div>
        </Layout>
    );
};

const EmptyState = ({loading}) => {
    return (
        <div className={classes.emptyState}>
            <div className={classes.loadingContainer}>
                <CircularProgress size={27} />
            </div>
        </div>
    );
}

const MainContent = ({series, video}) => {

    // Display a video from video.Url
    const videoContent = () => {
        if (video.videoUrl && false) {
            return (
                <div className={classes.videoContainer}>
                    <video className={classes.video} controls>
                        <source src={`${paths.renderedVideos}/${video.videoUrl}`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        } else {
            return (
                <div className={classes.emptyVideoContainer}>
                    <div className={classes.noVideo}>Video will appear here shortly</div>
                </div>
            );
        }
    }
    return (
        <div className={classes.mainContent}>
            {videoContent()}
            <div className={classes.info}>
                <div><b>Title:</b> {video.title}</div>
                <div><b>Caption:</b> {video.caption}</div>
                <div><b>Script:</b> {video.script}</div>
                <div><b>Scheduled:</b> {video.scheduledDate}</div>
            </div>
        </div>
    );
}

export default withAuthProtection(Series);
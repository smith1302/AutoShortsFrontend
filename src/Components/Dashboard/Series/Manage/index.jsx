import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import SeriesService from "~src/Services/SeriesService";

import Layout from "~/src/Components/Dashboard/Layout";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import UserContext from '~/src/Components/UserContext';
import SlantBGBox from "~/src/Components/Dashboard/SlantBGBox";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import PageHeading from "~/src/Components/Dashboard/PageHeading";

import UpcomingVideo from "./UpcomingVideo";

const ManageSeries = ({id}) => {
    const [series, setSeries] = useState(null);
    const [video, setVideo] = useState(null);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        try {
            setLoading(true);
            const data = await SeriesService.get({seriesID: id});
            setSeries(data.series);
            setVideo(data.video);
            setCreatorInfo(data.creatorInfo);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleUpcomingVideoUpdated = () => {
        fetchSeries();
    }

    return (
        <Layout>
            <div className={classes.root}>
                <SlantBGBox />
                <a href={paths.viewAllSeries} className={classes.back}>BACK</a>
                <ContentContainer className={classes.contentContainer}>
                    {series && <PageHeading title={series.title} light={true} />}
                    <UpcomingVideo 
                        video={video} 
                        creatorInfo={creatorInfo}
                        onVideoUpdated={handleUpcomingVideoUpdated} />
                </ContentContainer>
            </div>
        </Layout>
    );
};

export default withAuthProtection(ManageSeries);
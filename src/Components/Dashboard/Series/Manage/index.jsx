import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import SeriesService from "~src/Services/SeriesService";

import Layout from "~/src/Components/Dashboard/Layout";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import UserContext from '~/src/Components/UserContext';
import Button from '~/src/Components/Common/Button';
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
            alert(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this series?")) {
            try {
                await SeriesService.deleteSeries({seriesID: id});
                window.location.href = paths.viewAllSeries;
            } catch (err) {
                alert(err);
            }
        }
    }

    return (
        <Layout>
            <div className={classes.root}>
                <SlantBGBox />
                <a href={paths.viewAllSeries} className={classes.back}>BACK</a>
                <ContentContainer className={classes.contentContainer}>
                    {series && <PageHeading title={series.title} light={true} right={<Button small={true} onClick={handleDelete}>Delete</Button>} />}
                    <UpcomingVideo 
                        series={series}
                        video={video} 
                        creatorInfo={creatorInfo}
                        onVideoUpdated={fetchSeries} />

                </ContentContainer>
            </div>
        </Layout>
    );
};

export default withAuthProtection(ManageSeries);
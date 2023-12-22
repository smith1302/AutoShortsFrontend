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

const Series = () => {
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const series = await SeriesService.getAll();
            setSeries(series);
            setLoading(false);
        })();
    }, []);

    const handleSelectSeries = (series) => {
        window.location.href = paths.manageSeries(series.id);
    };

    return (
        <Layout>
            <div className={classes.root}>
                <SlantBGBox />
                <ContentContainer className={classes.contentContainer}>
                    <PageHeading title={`Your Series`} light={true} />
                    <Paper className={classes.paper}>
                        {(series && series.length > 0) ? (
                            <SeriesList series={series} handleSelectSeries={handleSelectSeries} />
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
            {loading ? (
                <div className={classes.loadingContainer}>
                    <CircularProgress size={27} />
                </div>
            ) : (
                <>
                    <div className={classes.emptyStateText}>
                    You haven't started a Faceless Video series yet.
                    </div>
                    <Button className={classes.emptyStateButton} variant="contained" color="primary">
                        Create your series
                    </Button>
                </>
            )}
        </div>
    );
}

const SeriesList = ({series, handleSelectSeries}) => {

    return (
        <List className={classes.selector}>
            {series.map((item, index) => (
                <Fragment key={item.id}>
                    <ListItem
                        button
                        className={clsx(classes.listItem)}
                        onClick={() => handleSelectSeries(item)}
                    >
                        <ListItemText className={classes.listItemText} primary={item.title} />
                    </ListItem>
                    {index < series.length - 1 && <Divider />}
                </Fragment>
            ))}
        </List>
    );
}

export default withAuthProtection(Series);
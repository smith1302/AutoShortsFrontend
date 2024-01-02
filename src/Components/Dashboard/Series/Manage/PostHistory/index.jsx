import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

const PostHistory = ({videoHistory}) => {
    if (!videoHistory || !videoHistory.length) return null;

    const postedOn = (date) => {
        const d = new Date(date);
        return `Posted on ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    return (
        <div className={classes.root}>
            <PageHeading title={`Post History`} light={false} className={classes.heading} />
            <Paper>
                <List className={classes.selector}>
                    {videoHistory.map((item, index) => (
                        <Fragment key={item.id}>
                            <ListItem
                                button
                                className={clsx(classes.listItem)}
                            >
                                <ListItemText className={classes.listItemText} primary={item.title} secondary={postedOn(item.postedDate)} />
                            </ListItem>
                            {index < videoHistory.length - 1 && <Divider />}
                        </Fragment>
                    ))}
                </List>
            </Paper>
        </div>
    );
};

export default PostHistory;
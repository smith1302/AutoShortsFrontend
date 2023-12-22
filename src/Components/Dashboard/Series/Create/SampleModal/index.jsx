import {useEffect, useState} from "react";
import clsx from 'clsx';
import classes from "./index.module.css";
import Router from "next/router";
import SeriesService from '~/src/Services/SeriesService';
import Button from "~/src/Components/Common/Button";

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

const sampleCache = {};

export default function ImportModal({open, onClose, contentType}) {
    const [sample, setSample] = useState(null);

    useEffect(() => {
        (async () => {
            if (!open || !contentType) return;

            const sampleCacheKey = `${contentType.id}-${contentType.prompt}`;
            if (contentType.editable) {
                if (sampleCacheKey in sampleCache) {
                    // setSample(sampleCache[sampleCacheKey]);
                    // return
                }

                try {
                    setSample(null);
                    const response = await SeriesService.getSample({sampleDetails: contentType.prompt});
                    setSample(response.sample);
                    sampleCache[sampleCacheKey] = response.sample;
                } catch (err) {
                    alert(err);
                }
            } else {
                setSample(contentType.sample);
            }
        })();
    }, [open, contentType]);
    
    return (
        <Dialog className={classes.root} onClose={onClose} open={open} fullWidth>
            <DialogTitle>
                <Box className={classes.dialogTitle}>
                    <span>Sample Story</span>
                </Box>
                <IconButton aria-label="close" id={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                {sample ? (
                    <div style={{whiteSpace: 'pre-wrap'}}>{sample}</div>
                )
                : (
                    <div className={classes.progress}>
                        <CircularProgress size={26} />
                        <Box mb={2} />
                        Generating AI Script...
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
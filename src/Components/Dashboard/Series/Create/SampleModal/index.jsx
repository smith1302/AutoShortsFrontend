import {useEffect, useState} from "react";
import clsx from 'clsx';
import classes from "./index.module.css";
import Router from "next/router";
import FetchWrapper from '~/src/Services/FetchWrapper';
import Button from "~/src/Components/Common/Button";

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function ImportModal({open, onClose, contentType}) {
    
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
                {contentType ? contentType.sample : ''}
            </DialogContent>
        </Dialog>
    );
}
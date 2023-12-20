import {useEffect, useState, useRef} from "react";
import classes from "./index.module.scss";
import clsx from "clsx";
import CAPTCHA from "react-google-recaptcha"

import FetchWrapper from '~/src/Services/FetchWrapper';

import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import getConfig from 'next/config'
const {publicRuntimeConfig} = getConfig();
const {RECAPTCHA_SITE_KEY} = publicRuntimeConfig;

export default function CaptchaDialog({open, onClose}) {
    const captchaRef = useRef(null);
    const [error, setError] = useState(null);
    
    const onChange = async (value) => {
        try {
            await FetchWrapper.post(`/api/verifyCaptcha`, { token: value });
            onClose();
        } catch (e) {
            console.log(e);
            setError("Unable to verify captcha");
        }
    }

    return (
        <Dialog className={classes.root} onClose={onClose} open={open}>
            <DialogTitle>
                <IconButton aria-label="close" id={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                <CAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY} 
                    ref={captchaRef}
                    onChange={onChange}
                />
            </DialogContent>
        </Dialog>
    );
}
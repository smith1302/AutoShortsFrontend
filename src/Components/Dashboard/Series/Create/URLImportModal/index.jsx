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

export default function ImportModal({open, onClose, onImport, logo, placeholder, title, importEndpont}) {
    const [url, setURL] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const onURLChange = (e) => {
        setURL(e.target.value);
    }

    const onSubmit = async (e) => {
        setError(null);
        if (!url || !url.length) return setError("Please enter a URL");

        setLoading(true);
        FetchWrapper.get(`${importEndpont}?url=${url}`)
        .then((response) => {
            onImport && onImport({name: response.name, description: response.description});
        })
        .catch(err => {
            setError((typeof err === 'string') ? err : err.message);
        })
        .finally(() => {
            setLoading(false)
        });
    }

    const handleClose = () => {
        setURL(null);
        setError(null);
        onClose();
    }
    
    return (
        <Dialog className={classes.root} onClose={handleClose} open={open} fullWidth>
            <DialogTitle>
                <Box className={classes.dialogTitle}>
                    <div className={classes.logoBG}>
                        <img className={classes.logo} src={logo} />
                    </div>
                    <span>{title}</span>
                </Box>
                <IconButton aria-label="close" id={classes.closeButton} onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <TextField
                    className={classes.textfield}
                    autoFocus
                    margin="dense"
                    label="Product URL"
                    placeholder={placeholder}
                    fullWidth
                    onChange={onURLChange}
                />
                {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
                {success && <Alert className={classes.alert} severity="success">{success}</Alert>}
                <Button 
                    id={classes.submitButton}
                    color="primary"
                    variant="contained"
                    onClick={onSubmit}
                    loading={loading}>
                    Import Product
                </Button>
            </DialogContent>
        </Dialog>
    );
}
import {useEffect, useState, useRef} from "react";
import classes from "./index.module.scss";
import PropTypes from 'prop-types';
import globals from "~/src/globals";
import FetchWrapper from "~/src/Services/FetchWrapper";
import Button from "~/src/Components/Common/Button";

import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

const options = [
    "I am not satisfied with available features",
    "The cost is too high",
    "I found a better alternative",
    "I was just trying it out",
    "I no longer make videos",
    "None",
];

FeedbackDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default function FeedbackDialog({open, onClose}) {
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const radioGroupRef = useRef(null);

    const handleOk = () => {
        if (!value) {
            return setError("Please select an option");
        }

        setLoading(true);
        setError(null);
        FetchWrapper.post("/api/user/feedback", {feedback: value})
        .then(() => {
            onClose();
        }).catch((err) => {
            setError(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Dialog className={classes.root} onClose={onClose} open={open} fullWidth={true}>
            <DialogTitle><span className={classes.title}>Feedback</span></DialogTitle>
            <DialogContent className={classes.dialogContent} dividers>
                <div className={classes.note}>We are sorry to see you go! Please help us improve by sharing any feedback:</div>
                <RadioGroup
                    ref={radioGroupRef}
                    aria-label="ringtone"
                    name="ringtone"
                    value={value}
                    onChange={handleChange}
                    className={classes.radioGroup}
                    >
                    {options.map((option) => (
                        <FormControlLabel
                            value={option}
                            key={option}
                            control={<Radio />}
                            label={option}
                            disabled={loading}
                        />
                    ))}
                </RadioGroup>
                {error && <Alert severity="error" className={classes.error}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
            <Button onClick={handleOk} loading={loading}>Submit</Button>
        </DialogActions>
        </Dialog>
    );
}

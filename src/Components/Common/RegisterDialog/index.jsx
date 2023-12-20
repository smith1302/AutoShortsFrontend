import classes from "./index.module.scss";
import paths from "~/src/paths";
import UserService from '~/src/Services/UserService';
import RegisterForm from '~/src/Components/Common/RegisterForm';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function RegisterDialog({open, onClose}) {
    const handleRegisterSuccess = (user) => {
        setTimeout(() => {
            onClose();
            if (new URL(window.location).pathname == "/") {
                window.location = paths.dashboard;
            }
        }, 1000);
    }
    
    return (
        <Dialog className={classes.root} onClose={onClose} open={open}>
            <DialogTitle>
                <IconButton aria-label="close" id={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} dense />
                <div className={classes.subnote}>Already have an account? <a href='#' onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    UserService.showLoginDialog();
                }}>Sign in</a></div>
            </DialogContent>
        </Dialog>
    );
}
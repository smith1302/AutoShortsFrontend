import classes from "./index.module.scss";
import * as React from 'react';

import CustomButton from '~/src/Components/Common/Button';
import paths from '~/src/paths';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function UpgradeDialog({onClose, open, message, title}) {
	return (
		<Dialog
		open={open}
		onClose={onClose}
		aria-labelledby="alert-dialog-title"
		aria-describedby="alert-dialog-description"
		>
			<DialogTitle className={classes.title}>
				<VerifiedIcon className={classes.badge} />
				{title || `Plan Limit Reached`}
				<IconButton
				aria-label="close"
				onClick={onClose}
				className={classes.closeBtn}
				sx={{position: 'absolute', right: 8, top: 8,}}>
          			<CloseIcon />
        		</IconButton>
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{message || `You've reached the tracked stores limit on your current plan. Upgrade your plan to track more stores.`}
				</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button sx={{marginRight: '14px'}} onClick={onClose}>Close</Button>

					<CustomButton href={paths.billing}>
					Select a Plan
					</CustomButton>
				</DialogActions>
		</Dialog>
		);
	}
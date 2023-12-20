import {useEffect, useState} from "react";
import classes from "./index.module.scss";
import globals from "~/src/globals";
import FetchWrapper from "~/src/Services/FetchWrapper";

import easyinvoice from 'easyinvoice';

import Alert from '@mui/material/Alert';
import DownloadIcon from '@mui/icons-material/Download';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function InvoiceDialog({open, onClose}) {
    const [error, setError] = useState(null);

    return (
        <Dialog className={classes.root} onClose={onClose} open={open} fullWidth={true}>
            <DialogTitle>
                <IconButton aria-label="close" id={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <div className={classes.title}>Invoice History</div>
                {error && <Alert severity="error" className={classes.alert}>{error}</Alert>}
                <DialogBody onError={setError} />
            </DialogContent>
        </Dialog>
    );
}

const DialogBody = ({onError}) => {
    const [invoices, setInvoices] = useState(undefined);
    useEffect(() => {
        FetchWrapper.get(`/api/user/invoices`)
        .then(response => {
            setInvoices(response.invoices);
        })
        .catch(err => {
            setInvoices(null);
            onError(err);
        });
    }, []);

    if (invoices == undefined) {
        return <CircularProgress size={24} className={classes.progress} />
    } else if (!invoices || invoices.length == 0) {
        return <EmptyState />
    }
    return <InvoiceList invoices={invoices} onError={onError} />
}

const EmptyState = () => {
    return (
        <div className={classes.emptyState}>
            No payments have been made yet.
        </div>
    )
}

const InvoiceList = ({invoices, onError}) => {
    if (!invoices) return null;

    const [downloadingInvoiceIDs, setDownloadingInvoiceIDs] = useState([]);
    const formatDateString = (ds) => new Date(ds).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

    const downloadInvoice = async (invoice) => {
        if (downloadingInvoiceIDs.includes(invoice.id)) return;

        setDownloadingInvoiceIDs(prevData => [...prevData, invoice.id]);
        
        const description = `EcomWave Plan`;
        const date = formatDateString(invoice.created);
        const data = {
            "images": {
                "logo": "https://ecomwave.io/images/LogoGradient.png",
            },
            "sender": {
                "company": globals.appName,
                "address": "Donnelley Drive",
                "zip": "78744",
                "city": "Austin, Texas",
                "country": "United States",
                "custom1": "https://ecomwave.io",
            },
            "client": {
                "company": invoice.email,
                "custom1": invoice.custom1 || null,
                "custom2": invoice.custom2 || null,
                "custom3": invoice.custom3 || null
            },
            "information": {
                "number": invoice.id,
                "due-date": date,
            },
            "products": [
                {
                    "quantity": 1,
                    "description": description,
                    "tax-rate": 0,
                    "price": invoice.amount,
                },
            ],
            "bottom-notice": "Status: Invoice Paid",
            "settings": {"currency": "USD"},
            "translate": {},
        };
        
        try {
            const result = await easyinvoice.createInvoice(data);
            easyinvoice.download('myInvoice.pdf', result.pdf);
        } catch (err) {
            onError(err.message);
        }
        
        setDownloadingInvoiceIDs(prevData => prevData.filter(id => id !== invoice.id));
    }

    return (
        <>
        {invoices.map(invoice => (
            <div onClick={() => downloadInvoice(invoice)} className={classes.row} key={invoice.id}>
                <div className={classes.column}>{formatDateString(invoice.created)}</div>
                {downloadingInvoiceIDs.includes(invoice.id)
                ? <CircularProgress size={24} className={classes.progress} />
                : <DownloadIcon sx={{ color: 'var(--primary-text-color)' }} className={classes.downloadIcon} />}
            </div>    
        ))}
        </>
    )

}


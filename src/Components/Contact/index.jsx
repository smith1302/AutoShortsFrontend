import {useState} from 'react';
import { useRouter } from "next/router";
import classes from './index.module.css';

import BasicPage from '~/src/Components/Common/BasicPage'
import Button from '~/src/Components/Common/Button';
import FetchWrapper from '~/src/Services/FetchWrapper';

// Material UI
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

export default function Contact() {
    const router = useRouter();
    const { source } = router.query;
    const prefillFeedback = source === 'feedback';
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);
    const [subject, setSubject] = useState(prefillFeedback ? "[Feedback] I have a template suggestion" : "");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(prefillFeedback ? "The template I would like to see is: \n" : "");
    const [loading, setLoading] = useState(false);
    const maxCharacters = 1000;

    let onSubjectChange = (e) => {
        setSubject(e.target.value.substring(0, 100));
    }

    let onNameChange = (e) => {
        setName(e.target.value.substring(0, 100));
    }

    let onEmailChange = (e) => {
        setEmail(e.target.value.substring(0, 255));
    }

    let onMessageChange = (e) => {
        setMessage(e.target.value.substring(0, maxCharacters));
    }

    let onSend = async (e) => {
        let error;
        if (email.length <= 0) {
            error = 'Please enter an email.';
        } else if (subject.length <= 0) {
            error = 'Please enter an subject.';
        } else if (name.length <= 0) {
            error = 'Please enter a name.';
        } else if (message.length <= 3) {
            error = 'Please enter an message.';
        } else if (message.length > maxCharacters) {
            error = 'Message too long.';
        }

        if (error) {
            return setError(error);
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        FetchWrapper.post(`/api/contact`, {
            email: email,
            subject: subject,
            name: name,
            message: message
        })
        .then(response => {
            setSuccessMessage("Your email has been sent! Someone from our team will get back to you within 24 hours.")
            setEmail("");
            setMessage("");
            setSubject("");
            setName("");
        })
        .catch(error => {
            setError(error);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    let charactersRemainingText = () => {
        const remaining = maxCharacters - message.length; 
        return `${remaining} characters remaining`;
    }

    return (
        <BasicPage title="Contact" heroTitle="Contact Us" heroSubtitle="We're happy to help">
            <div className={classes.root}>
                <Box className={classes.contactFormBox} display="flex" flexDirection="column">
                    {successMessage && <Alert severity="success" sx={{mb: 3}}>{successMessage}</Alert>}
                    <TextField 
                        margin="dense"
                        required 
                        id="subject" 
                        label="Subject" 
                        value={subject}
                        variant="outlined"
                        onChange={onSubjectChange}
                        disabled={loading} />
                    <TextField 
                        margin="dense"
                        required 
                        id="name" 
                        label="Name" 
                        placeholder="Your name"
                        value={name}
                        variant="outlined"
                        onChange={onNameChange}
                        disabled={loading} />
                    <TextField 
                        margin="dense"
                        required 
                        id="email" 
                        label="Email" 
                        placeholder="Your email address"
                        value={email}
                        variant="outlined"
                        onChange={onEmailChange}
                        disabled={loading} />
                    <TextField 
                        margin="dense"
                        required 
                        id="message" 
                        label="Message"
                        focused
                        variant="outlined" 
                        value={message}
                        multiline
                        rows={5}
                        placeholder="How can we help you?"
                        onChange={onMessageChange} 
                        disabled={loading} />
                    {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                    <div className={classes.submit}>
                        <div className={classes.characterLimit}>
                            {charactersRemainingText()}
                        </div>
                        <Button 
                            className={classes.submitButton}
                            onClick={onSend}
                            loading={loading}>
                                Send Message
                        </Button>
                    </div>
                </Box>
            </div>
        </BasicPage>
    );
}
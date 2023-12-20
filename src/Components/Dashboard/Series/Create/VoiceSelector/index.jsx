import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import PageHeading from "~/src/Components/Dashboard/PageHeading";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import Paper from '@mui/material/Paper';

const VoiceSelector = ({ voices, onVoiceSelected }) => {
    const [selectedVoice, setSelectedVoice] = useState(voices[0]);
    const [playingVoice, setPlayingVoice] = useState(null);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        onVoiceSelected(selectedVoice); // Inform the parent component of the default selection
    
        const audio = audioRef.current;
        audio.addEventListener('ended', handleAudioEnded);
    
        return () => {
          audio.removeEventListener('ended', handleAudioEnded);
        };
    }, []);

    const handleAudioEnded = () => {
        setPlayingVoice(null);
    };

    const handleSelectVoice = (voice) => {
        setSelectedVoice(voice);
        onVoiceSelected(voice);
        if (playingVoice) {
            stopVoice();
        }
    };

    const playVoice = (voice) => {
        setPlayingVoice(voice);
        audioRef.current.src = voice.audioUrl;
        audioRef.current.play();
    };

    const stopVoice = () => {
        setPlayingVoice(null);
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio to start
    };

    return (
        <div className={classes.root}>
            <PageHeading title="Choose a Voice" />
            <Paper className={classes.paper}>
                <List className={classes.voiceSelector}>
                    {voices.map((voice, index) => (
                        <Fragment key={voice.name}>
                            <ListItem
                                key={index}
                                button
                                className={clsx(classes.voiceItem, selectedVoice === voice ? classes.selected : '')}
                                onClick={() => handleSelectVoice(voice)}
                            >
                                <ListItemIcon>
                                    <IconButton className={classes.iconButton} onClick={(e) => {
                                        e.stopPropagation();
                                        playingVoice === voice ? stopVoice() : playVoice(voice);
                                    }}>
                                        {playingVoice === voice ? <StopCircleIcon /> : <PlayCircleOutlineIcon />}
                                    </IconButton>
                                </ListItemIcon>
                                <ListItemText className={classes.listItemText} primary={voice.name} />
                                {selectedVoice === voice && <CheckIcon className={classes.checkIcon} />}
                            </ListItem>
                            {index < voices.length - 1 && <Divider />}
                        </Fragment>
                    ))}
                </List>
            </Paper>
        </div>
    );
};

export default VoiceSelector;
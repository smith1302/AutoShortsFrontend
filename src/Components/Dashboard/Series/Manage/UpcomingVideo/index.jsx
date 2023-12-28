import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import SeriesService from "~src/Services/SeriesService";

import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import Button from '~/src/Components/Common/Button';
import TikTokPostForm from "../TikTokPostForm";

import { TextField, InputAdornment } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import EventIcon from '@mui/icons-material/Event';

const UpcomingVideo = ({video, creatorInfo, onVideoUpdated}) => {

    if (!video) {
        return (
            <Paper className={classes.paper}>
                <EmptyState />
            </Paper>
        );
    }
 
    return (
        <Paper className={classes.paper}>
            <MainContent 
                video={video} 
                creatorInfo={creatorInfo}
                onSave={onVideoUpdated} />
        </Paper>
    );
};

const EmptyState = ({loading}) => {
    return (
        <div className={classes.emptyState}>
            <div className={classes.loadingContainer}>
                <CircularProgress size={27} />
            </div>
        </div>
    );
}

const isVideoReady = (video) => {
    return video && video.videoUrl;
};

const MainContent = ({video, creatorInfo, onSave}) => {
    const [videoAvailable, setVideoAvailable] = useState(isVideoReady(video));
    const [loading, setLoading] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [tiktokUploadAllowed, setTiktokUploadAllowed] = useState(false);
    const [editableFields, setEditableFields] = useState({
        title: video.title,
        caption: video.caption,
        script: video.script,
    });
    const [fieldErrors, setFieldErrors] = useState({
        title: null,
        caption: null,
        script: null,
    });

    const maxLengths = {
        title: Math.max(75, video.title.length),
        caption: Math.max(150, video.caption.length),
        script: Math.max(1200, video.script.length),
    };

    // Update the state when the original video prop changes
    useEffect(() => {
        setEditableFields({
            title: video.title,
            caption: video.caption,
            script: video.script,
            scheduledDate: video.scheduledDate
        });
        setVideoAvailable(isVideoReady(video));
    }, [video]);

    // Function to check if any field has changed from the original
    const checkIfChangedFromOriginal = (newFields) => {
        return newFields.title !== video.title ||
               newFields.caption !== video.caption ||
               newFields.script !== video.script ||
               newFields.scheduledDate !== video.scheduledDate;
    };

    const checkIfAnyErrors = () => {
        const hasErrors = Object.values(fieldErrors).some(val => val);
        return hasErrors;
    };

    // Handlers for text changes
    const handleTextChange = (field, value) => {
        if (!value || value.length <= 5) {
            setFieldErrors({ ...fieldErrors, [field]: '5 characters minimum' });
        } else if (fieldErrors[field]) {
            setFieldErrors({ ...fieldErrors, [field]: null });
        }

        const updatedFields = { ...editableFields, [field]: value };
        setEditableFields(updatedFields);
        setIsChanged(checkIfChangedFromOriginal(updatedFields));
    };

    const handleUploadAllowedChange = ({allow}) => {
        setTiktokUploadAllowed(allow);
    }

    // Save button handler
    const handleSave = async () => {
        try {
            setLoading(true);
            await SeriesService.updateVideo({
                videoID: video.id,
                title: editableFields.title,
                caption: editableFields.caption,
                script: editableFields.script,
            });
            onSave();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const disableControls = loading || !videoAvailable;

    return (
        <div className={classes.mainContent}>
            <div className={classes.title}>
                <UpcomingIcon /> Upcoming Video
            </div>
            <div className={classes.subtitle}>
                Edit the details of your upcoming video
            </div>
            <div className={classes.flexRow}>
                <Video video={video} />
                <div className={classes.infoSection}>
                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}>Title</div>
                        <TextField 
                            variant="outlined" 
                            value={editableFields.title} 
                            helperText={fieldErrors.title}
                            error={!!fieldErrors.title}
                            onChange={(e) => handleTextChange('title', e.target.value)} 
                            size="small"
                            className={classes.textField}
                            InputProps={{ 
                                inputProps: { maxLength: maxLengths.title },
                                endAdornment: (<InputAdornment position="end"><div className={classes.charsLeft}>{editableFields.title.length} / {maxLengths.title}</div></InputAdornment>)
                            }}
                            disabled={disableControls}
                        />
                    </div>
                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}>Caption</div>
                        <TextField 
                            variant="outlined" 
                            value={editableFields.caption} 
                            helperText={fieldErrors.caption}
                            error={!!fieldErrors.caption}
                            onChange={(e) => handleTextChange('caption', e.target.value)} 
                            size="small"
                            className={classes.textField}
                            InputProps={{ 
                                inputProps: { maxLength: maxLengths.caption },
                                endAdornment: (<InputAdornment position="end"><div className={classes.charsLeft}>{editableFields.caption.length} / {maxLengths.caption}</div></InputAdornment>)
                            }}
                            disabled={disableControls}
                        />
                    </div>
                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}>Script</div>
                        <TextField 
                            variant="outlined" 
                            value={editableFields.script} 
                            helperText={fieldErrors.script}
                            error={!!fieldErrors.script}
                            multiline 
                            rows={Math.min(9, Math.max(3, Math.floor(editableFields.script.length / 75)))}
                            onChange={(e) => handleTextChange('script', e.target.value)} 
                            size="small"
                            className={classes.textField}
                            InputProps={{ 
                                inputProps: { maxLength: maxLengths.script },
                                endAdornment: (<InputAdornment position="end"><div className={classes.charsLeft}>{editableFields.script.length} / {maxLengths.script}</div></InputAdornment>)
                            }}
                            disabled={disableControls}
                        />
                    </div>
                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}><EventIcon /> Scheduled to Post:</div>
                        <div className={classes.scheduledTime}>{convertToReadableLocalTime(video.scheduledDate)} (Local)</div>
                    </div>

                    <TikTokPostForm creatorInfo={creatorInfo} onUploadAllowedChange={handleUploadAllowedChange} />

                    <Button onClick={handleSave} disabled={!isChanged || checkIfAnyErrors() || !videoAvailable || !tiktokUploadAllowed} loading={loading} className={classes.saveButton}>
                        Update Video
                    </Button>
                    <div className={classes.saveButtonNote}>
                        Note: Updating will queue your video for re-rendering
                    </div>
                </div>
            </div>
        </div>
    );
}

const Video = ({video}) => {
    if (isVideoReady(video)) {
        return (
            <div className={classes.videoContainer}>
                <video className={classes.video} controls controlsList="nodownload">
                    <source src={`${paths.renderedVideos}/${video.videoUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    } else {
        return (
            <div className={classes.emptyVideoContainer}>
                <CircularProgress size={30} className={classes.videoLoading} />
                <div className={classes.noVideo}>
                    {(video && video.jobID) ? (
                        <>Video will appear here once it is rendered</>
                    ) : (
                        <>Video is queued for rendering</>
                    )}
                </div>
            </div>
        );
    }
}

function convertToReadableLocalTime(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    };
    return date.toLocaleString([], options);
}

export default withAuthProtection(UpcomingVideo);
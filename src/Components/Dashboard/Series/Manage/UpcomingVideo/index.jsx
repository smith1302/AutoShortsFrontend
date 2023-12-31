import { useEffect, useState } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import SeriesService from "~src/Services/SeriesService";

import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import Button from '~/src/Components/Common/Button';
import AccountSelector from "~/src/Components/Dashboard/Series/AccountSelector";
import TikTokPostSettings from "~/src/Components/Dashboard/Series/Manage/TikTokPostSettings";
import { PUBLISH_STATUS } from '~/src/Enums/VideoPublishStatus';

import useVideoSeriesState from "./useVideoSeriesState";

import { TextField, InputAdornment, Snackbar } from "@mui/material";
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';

const UpcomingVideo = ({series, video, creatorInfo, onVideoUpdated}) => {

    if (!video || !series) {
        return (<Paper className={classes.paper}><EmptyState /></Paper>);
    }
 
    return (
        <Paper className={classes.paper}>
            <MainContent 
                series={series}
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

const MainContent = ({series, video, creatorInfo, onSave}) => {
    const {
        privacy, setPrivacy,
        allowComment, setAllowComment,
        allowDuet, setAllowDuet,
        allowStitch, setAllowStitch,
        selectedAccount, setSelectedAccount,
        editableFields, setEditableFields,
        fieldErrors, setFieldErrors,
        videoAvailable, setVideoAvailable,
        videoFieldsDidChange, setVideoFieldsDidChange,
        tikTokPostSettingsDidChange, setTikTokPostSettingsDidChange,
    } = useVideoSeriesState(video, series);

    const [validTikTokSettings, setValidTikTokSettings] = useState(true);
    const [loading, setLoading] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);

    const maxLengths = {
        title: Math.max(75, video.title.length),
        caption: Math.max(150, video.caption.length),
        script: Math.max(1200, video.script.length),
    };

    const checkIfAnyErrors = () => Object.values(fieldErrors).some(val => val);

    const handleTextChange = (field, value) => {
        // Set or remove any field errors
        if (!value || value.length <= 5) {
            setFieldErrors({ ...fieldErrors, [field]: '5 characters minimum' });
        } else if (fieldErrors[field]) {
            setFieldErrors({ ...fieldErrors, [field]: null });
        }

        const updatedFields = { ...editableFields, [field]: value };
        setEditableFields(updatedFields);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (videoFieldsDidChange) {
                await SeriesService.updateVideo({
                    videoID: video.id,
                    title: editableFields.title,
                    caption: editableFields.caption,
                    script: editableFields.script,
                });
            }
            if (tikTokPostSettingsDidChange) {
                await SeriesService.updateSeries({
                    seriesID: series.id,
                    privacy: privacy,
                    commentDisabled: !allowComment,
                    duetDisabled: !allowDuet,
                    stitchDisabled: !allowStitch,
                    openID: selectedAccount,
                });
            }
            await onSave();
            setOpenSuccess(true);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const videoIsPosting = video && video.publishID;
    const disableAllControls = videoIsPosting;
    const disableVideoControls = loading || !videoAvailable || disableAllControls;
    const noChanges = !videoFieldsDidChange && !tikTokPostSettingsDidChange;
    const disableSaveButton = (
        noChanges 
        || checkIfAnyErrors() 
        || (!videoAvailable && videoFieldsDidChange) // Can't edit video while it is rendering
        || !validTikTokSettings
        || disableAllControls
    );

    return (
        <div className={classes.mainContent}>

            <div className={classes.title}><UpcomingIcon /> Upcoming Video</div>
            <div className={classes.subtitle}>Edit the details of your upcoming video</div>

            <div className={classes.flexRow}>
                <Video video={video} videoAvailable={videoAvailable} />
                <div className={classes.infoSection}>
                    <PublishStatus video={video} />
                    <CustomTextField
                        title="Title"
                        value={editableFields.title}
                        helperText={fieldErrors.title}
                        error={!!fieldErrors.title}
                        onChange={(e) => handleTextChange('title', e.target.value)}
                        maxLength={maxLengths.title}
                        disabled={disableVideoControls}
                    />

                    <CustomTextField
                        title="Caption"
                        value={editableFields.caption}
                        helperText={fieldErrors.caption}
                        error={!!fieldErrors.caption}
                        onChange={(e) => handleTextChange('caption', e.target.value)}
                        maxLength={maxLengths.caption}
                        disabled={disableVideoControls}
                    />

                    <CustomTextField
                        title="Script"
                        value={editableFields.script}
                        helperText={fieldErrors.script}
                        error={!!fieldErrors.script}
                        multiline
                        rows={Math.min(9, Math.max(3, Math.floor(editableFields.script.length / 75)))}
                        onChange={(e) => handleTextChange('script', e.target.value)}
                        maxLength={maxLengths.script}
                        disabled={disableVideoControls}
                    />
                    <div className={classes.scriptNote}>
                        <b>Note:</b> Always verify AI generated scripts for accuracy.
                    </div>

                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}><EventIcon /> Scheduled to Post:</div>
                        <div className={classes.scheduledTime}>{convertToReadableLocalTime(video.scheduledDate)} (Local)</div>
                    </div>

                    <div className={classes.infoItem}>
                        <div className={classes.infoTitle}>Account</div>
                        <AccountSelector 
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                            size={'small'}
                            disabled={loading || disableAllControls} />
                    </div>

                    <TikTokPostSettings 
                        privacy={privacy}
                        setPrivacy={setPrivacy}
                        allowComment={allowComment}
                        setAllowComment={setAllowComment}
                        allowDuet={allowDuet}
                        setAllowDuet={setAllowDuet}
                        allowStitch={allowStitch}
                        setAllowStitch={setAllowStitch}
                        creatorInfo={creatorInfo}
                        validTikTokSettings={validTikTokSettings}
                        setValidTikTokSettings={setValidTikTokSettings}
                        disabled={loading || disableAllControls} />

                    <Button onClick={handleSave} disabled={disableSaveButton} loading={loading} className={classes.saveButton}>
                        Update Video
                    </Button>
                    {videoFieldsDidChange && <div className={classes.saveButtonNote}><InfoIcon /> Updating will queue your video for re-rendering</div>}

                    <Snackbar open={openSuccess} autoHideDuration={4000} onClose={() => setOpenSuccess(false)} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
                        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
                            Video updated successfully
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </div>
    );
}

const PublishStatus = ({video}) => {
    if (video.publishStatus === PUBLISH_STATUS.PUBLISHED) {
        return (
            <Alert severity="success" className={classes.publishStatus}>
                This video has been posted and cannot be edited.
            </Alert>
        );
    } else if (video.publishStatus === PUBLISH_STATUS.FAILED) {
        return (
            <Alert severity="error" className={classes.publishStatus}>
                This video failed to post. {video.publishFailReason}
            </Alert>
        );
    } else if (video.publishStatus === PUBLISH_STATUS.PROCESSING) {
        return (
            <Alert severity="info" className={classes.publishStatus}>
                This video is currently being uploaded and cannot be edited.
            </Alert>
        );
    }
    return null;
}

const CustomTextField = ({ title, value, maxLength, ...props }) => {
    return (
        <div className={classes.infoItem}>
            <div className={classes.infoTitle}>{title}</div>
            <TextField
                variant="outlined"
                value={value}
                size="small"
                className={classes.textField}
                InputProps={{
                    inputProps: { maxLength: maxLength },
                    endAdornment: (
                        <InputAdornment position="end">
                            <div className={classes.charsLeft}>{value.length} / {maxLength}</div>
                        </InputAdornment>
                    )
                }}
                {...props}
            />
        </div>
    );
};

const Video = ({video, videoAvailable}) => {
    if (video && videoAvailable && false) {
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
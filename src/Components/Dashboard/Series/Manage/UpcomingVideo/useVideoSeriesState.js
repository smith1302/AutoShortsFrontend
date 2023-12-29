import { useEffect, useState, useCallback } from "react";

const isVideoReady = (video) => {
    return video && video.videoUrl;
};

/*
    Moved this here because it makes setting the initial state and resetting the state easier when the video/series is updated.
*/
const useVideoSeriesState = (video, series) => {
    const getInitialPrivacy = () => series.privacy;
    const getInitialCommentSetting = () => !series.commentDisabled;
    const getInitialDuetSetting = () => !series.duetDisabled;
    const getInitialStitchSetting = () => !series.stitchDisabled;
    const getInitialAccount = () => series.openID;
    const getInitialVideoReady = () => isVideoReady(video);
    const getInitialVideoFieldsDidChange = () => false;
    const getInitialTikTokPostSettingsDidChange = () => false;
    const getInitialVideoFields = () => ({
        title: video.title,
        caption: video.caption,
        script: video.script,
    });
    const getInitialFieldErrors = () => ({
        title: null,
        caption: null,
        script: null,
    });

    const [privacy, setPrivacy] = useState(getInitialPrivacy());
    const [allowComment, setAllowComment] = useState(getInitialCommentSetting());
    const [allowDuet, setAllowDuet] = useState(getInitialDuetSetting());
    const [allowStitch, setAllowStitch] = useState(getInitialStitchSetting());
    const [selectedAccount, setSelectedAccount] = useState(getInitialAccount());
    const [editableFields, setEditableFields] = useState(getInitialVideoFields());
    const [fieldErrors, setFieldErrors] = useState(getInitialFieldErrors());
    const [videoAvailable, setVideoAvailable] = useState(getInitialVideoReady());
    const [videoFieldsDidChange, setVideoFieldsDidChange] = useState(getInitialVideoFieldsDidChange());
    const [tikTokPostSettingsDidChange, setTikTokPostSettingsDidChange] = useState(getInitialTikTokPostSettingsDidChange());

    const checkIfVideoFieldsDidChange = useCallback(() => {
        return editableFields.title !== video.title ||
               editableFields.caption !== video.caption ||
               editableFields.script !== video.script;
    }, [editableFields, video]);
    
    
    useEffect(() => {
        setVideoFieldsDidChange(checkIfVideoFieldsDidChange());
    }, [checkIfVideoFieldsDidChange]);

    useEffect(() => {
        const hasChanged = (privacy !== series.privacy) || (allowComment == series.commentDisabled) || (allowDuet == series.duetDisabled) || (allowStitch == series.stitchDisabled) || (selectedAccount !== series.openID);
        setTikTokPostSettingsDidChange(hasChanged);
    }, [series, privacy, allowComment, allowDuet, allowStitch, selectedAccount]);

    useEffect(() => {
        setPrivacy(getInitialPrivacy());
        setAllowComment(getInitialCommentSetting());
        setAllowDuet(getInitialDuetSetting());
        setAllowStitch(getInitialStitchSetting());
        setSelectedAccount(getInitialAccount());
        setEditableFields(getInitialVideoFields());
        setFieldErrors(getInitialFieldErrors());
        setVideoAvailable(getInitialVideoReady());
        setVideoFieldsDidChange(getInitialVideoFieldsDidChange());
        setTikTokPostSettingsDidChange(getInitialTikTokPostSettingsDidChange());
    }, [video, series]);

    return {
        privacy, setPrivacy,
        allowComment, setAllowComment,
        allowDuet, setAllowDuet,
        allowStitch, setAllowStitch,
        selectedAccount, setSelectedAccount,
        editableFields, setEditableFields,
        fieldErrors, setFieldErrors,
        videoAvailable, setVideoAvailable,
        videoFieldsDidChange, setVideoFieldsDidChange,
        tikTokPostSettingsDidChange, setTikTokPostSettingsDidChange
    };
};

export default useVideoSeriesState;
import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import Button from '~/src/Components/Common/Button';

import { TextField, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Switch, Typography, Stack, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

/*
    creatorInfo: {
        stitch_disabled: true,
        comment_disabled: false,
        creator_avatar_url: 'https://p19-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/a8a5b2a3e11d6c916a599d5e91028f5e~c5_168x168.webp?lk3s=a5d48078&x-expires=1703901600&x-signature=Ux6i35XMpc0LVysP3GH2wXN5CzI%3D',
        creator_nickname: 'TheMemeMaestro',
        creator_username: 'burbanheimerman',
        duet_disabled: true,
        max_video_post_duration_sec: 600,
        privacy_level_options: [ 'PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY' ]
    }
*/

// const PrivacyOptions = {
//     'Public': 'PUBLIC_TO_EVERYONE',
//     'Private': 'SELF_ONLY',
//     'Friends': 'MUTUAL_FOLLOW_FRIENDS',
//     'Followers': 'FOLLOWER_OF_CREATOR'
// }

const PrivacyOptions = {
    "PUBLIC_TO_EVERYONE": "Public",
    "SELF_ONLY": "Private",
    "MUTUAL_FOLLOW_FRIENDS": "Friends",
    "FOLLOWER_OF_CREATOR": "Followers"
}


const TikTokPostForm = ({creatorInfo, onUploadAllowedChange}) => {
    const [privacy, setPrivacy] = useState('');
    const [allowComment, setAllowComment] = useState(!creatorInfo.comment_disabled);
    const [allowDuet, setAllowDuet] = useState(!creatorInfo.duet_disabled);
    const [allowStitch, setAllowStitch] = useState(!creatorInfo.stitch_disabled);
    const [commercialContent, setCommercialContent] = useState(false);
    const [yourBrand, setYourBrand] = useState(false);
    const [brandedContent, setBrandedContent] = useState(false);
    const [disableUpload, setDisableUpload] = useState(true);

    useEffect(() => {
        if (!commercialContent) {
            setDisableUpload(false);
        } else if (commercialContent && (!yourBrand && !brandedContent)) {
            setDisableUpload(true);
        } else {
            setDisableUpload(false);
        }

        if (commercialContent && brandedContent && privacy === 'private') {
            setPrivacy('public');
        }
    }, [commercialContent, yourBrand, brandedContent, privacy]);

    useEffect(() => {
        if (onUploadAllowedChange) {
            onUploadAllowedChange({allow: !disableUpload});
        }
    }, [disableUpload]);

    const handlePrivacyChange = (event) => {
        setPrivacy(event.target.value);
    };

    const renderDisclaimer = () => {
        const musicAnchor = <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Music Usage Confirmation</a>;
        const brandedAnchor = <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer">Branded Content Policy</a>;
        if (commercialContent) {
            if (brandedContent) {
                return <>By posting, you agree to TikTok's {brandedAnchor} and {musicAnchor}.</>;
            } else if (yourBrand) {
                return <>By posting, you agree to TikTok's {musicAnchor}.</>;
            }
        }
        return null;
    };

    return (
        <div className={classes.root}>
            <Stack direction="column" sx={{ marginBottom: 2 }}>
                <div className={classes.sectionTitle} style={{ marginBottom: 7 }}>
                    Who can view this video
                </div>
                <Select value={privacy} onChange={handlePrivacyChange} size="small">
                    {creatorInfo.privacy_level_options.map((option, index) => {
                        const isPrivate = option === 'SELF_ONLY';
                        const isDisabled = isPrivate && (commercialContent && brandedContent);
                        let menuText = PrivacyOptions[option];
                        if (isPrivate && isDisabled) {
                            menuText += ' (Branded content cannot be private)';
                        }
                        return (
                            <MenuItem key={option} value={option} disabled={isDisabled}>{menuText}</MenuItem>
                        );
                    })}
                </Select>
            </Stack>

            <InteractionAbilities
                allowComment={allowComment}
                allowCommentDisabled={creatorInfo.comment_disabled}
                setAllowComment={setAllowComment}
                allowDuet={allowDuet}
                allowDuetDisabled={creatorInfo.duet_disabled}
                setAllowDuet={setAllowDuet}
                allowStitch={allowStitch}
                allowStitchDisabled={creatorInfo.stitch_disabled}
                setAllowStitch={setAllowStitch}
            />

            <Stack direction="row" alignItems="center">
                <div className={classes.sectionTitle}>
                    Disclose Video Content
                </div>
                <Switch checked={commercialContent} onChange={(e) => setCommercialContent(e.target.checked)} />
            </Stack>
            {commercialContent && (<div className={classes.disclaimer}>
                <InfoIcon /> Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
            </div>)}
            <Typography variant="caption" display="block" gutterBottom>
                Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.
            </Typography>

            {commercialContent && (
                <div>
                    <FormGroup>
                        <Stack direction="row" alignItems="center">
                            <Checkbox checked={yourBrand} onChange={(e) => setYourBrand(e.target.checked)} />
                            <div className={classes.sectionTitle}>
                                Your Brand
                            </div>
                        </Stack>
                        <Typography variant="caption" display="block" gutterBottom>
                            You are promoting yourself or your own business. This video will be classified as Brand Organic.
                        </Typography>

                        <Stack direction="row" alignItems="center">
                            <Checkbox checked={brandedContent} onChange={(e) => setBrandedContent(e.target.checked)} />
                            <div className={classes.sectionTitle}>
                                Branded content
                            </div>
                        </Stack>
                        <Typography variant="caption" display="block" gutterBottom>
                            You are promoting another brand or a third party. This video will be classified as Branded Content.
                        </Typography>
                    </FormGroup>
                </div>
            )}

            <Typography variant="body2" style={{ margin: '20px 0' }}>
                {renderDisclaimer()}
            </Typography>
        </div>
    );
};

const InteractionAbilities = ({ 
    allowComment, 
    allowCommentDisabled,
    setAllowComment, 
    allowDuet, 
    allowDuetDisabled,
    setAllowDuet, 
    allowStitch, 
    allowStitchDisabled,
    setAllowStitch 
}) => {

    return (
        <Stack direction="column" sx={{ marginBottom: 1 }}>
            <div className={classes.sectionTitle} style={{ marginBottom: 7 }}>
                Allow users to
            </div>
            <FormGroup row>
                <FormControlLabel
                    control={<Checkbox checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} name="allowComment" disabled={allowCommentDisabled} />}
                    label="Comment"
                />
                <FormControlLabel
                    control={<Checkbox checked={allowDuet} onChange={(e) => setAllowDuet(e.target.checked)} name="allowDuet" disabled={allowDuetDisabled} />}
                    label="Duet"
                />
                <FormControlLabel
                    control={<Checkbox checked={allowStitch} onChange={(e) => setAllowStitch(e.target.checked)} name="allowStitch" disabled={allowStitchDisabled} />}
                    label="Stitch"
                />
            </FormGroup>
        </Stack>
    );
};

export default TikTokPostForm;
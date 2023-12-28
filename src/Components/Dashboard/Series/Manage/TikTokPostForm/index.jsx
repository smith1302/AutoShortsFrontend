import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import paths from "~/src/paths";
import Button from '~/src/Components/Common/Button';

import { TextField, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Switch, Typography, Stack, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const TikTokPostForm = ({onUploadAllowedChange}) => {
    const [title, setTitle] = useState('');
    const [privacy, setPrivacy] = useState('');
    const [allowComment, setAllowComment] = useState(false);
    const [allowDuet, setAllowDuet] = useState(false);
    const [allowStitch, setAllowStitch] = useState(false);
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
            setPrivacy('public'); // Automatically switch to public if branded content is selected
        }
    }, [commercialContent, yourBrand, brandedContent, privacy]);

    useEffect(() => {
        if (onUploadAllowedChange) {
            onUploadAllowedChange({allow: !disableUpload});
        }
    }, [disableUpload]);

    const tooltipTitle = commercialContent && !(yourBrand || brandedContent)
        ? "You need to indicate if your content promotes yourself, a third party, or both."
        : "";

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
                    {/* Options populated based on creator_info API */}
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private" disabled={commercialContent && brandedContent}>Private {(commercialContent && brandedContent) ? '(Branded content cannot be private)' : ''}</MenuItem>
                    <MenuItem value="friends">Friends</MenuItem>
                </Select>
            </Stack>

            <InteractionAbilities
                allowComment={allowComment}
                setAllowComment={setAllowComment}
                allowDuet={allowDuet}
                setAllowDuet={setAllowDuet}
                allowStitch={allowStitch}
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

const InteractionAbilities = ({ allowComment, setAllowComment, allowDuet, setAllowDuet, allowStitch, setAllowStitch }) => {
    // Assuming `allowDuet` and `allowStitch` might be disabled based on some condition, which you should replace with actual logic
    const duetDisabled = false; // replace with actual condition
    const stitchDisabled = false; // replace with actual condition

    return (
        <Stack direction="column" sx={{ marginBottom: 1 }}>
            <div className={classes.sectionTitle} style={{ marginBottom: 7 }}>
                Allow users to
            </div>
            <FormGroup row>
                <FormControlLabel
                    control={<Checkbox checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} name="allowComment" />}
                    label="Comment"
                />
                <FormControlLabel
                    control={<Checkbox checked={allowDuet} onChange={(e) => setAllowDuet(e.target.checked)} name="allowDuet" disabled={duetDisabled} />}
                    label="Duet"
                />
                <FormControlLabel
                    control={<Checkbox checked={allowStitch} onChange={(e) => setAllowStitch(e.target.checked)} name="allowStitch" disabled={stitchDisabled} />}
                    label="Stitch"
                />
            </FormGroup>
        </Stack>
    );
};

export default TikTokPostForm;
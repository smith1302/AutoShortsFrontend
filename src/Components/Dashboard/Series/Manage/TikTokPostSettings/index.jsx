import { useEffect, useState, useRef, Fragment } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import { PrivacyOptions, PrivacyOptionTitles } from '~/src/Enums/TikTokPrivacy';

import { Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Switch, Typography, Stack, Tooltip } from '@mui/material';
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

/* 
    The defaults are what's currently set in our Database, first selected at the time of series creation.
    creatorInfo is the up to date data returned from TikTok's API. So if they don't match, we need to update the defaults.
*/
const TikTokPostSettings = ({ privacy, setPrivacy, allowComment, setAllowComment, allowStitch, setAllowStitch, allowDuet, setAllowDuet, creatorInfo, validTikTokSettings, setValidTikTokSettings, disabled }) => {
    if (!creatorInfo) return null;

    const [commercialContent, setCommercialContent] = useState(false);
    const [yourBrand, setYourBrand] = useState(false);
    const [brandedContent, setBrandedContent] = useState(false);

    useEffect(() => {
        /* 
            Rules required by TikTok:
            https://developers.tiktok.com/doc/content-sharing-guidelines
        */
        if (commercialContent && (!yourBrand && !brandedContent)) {
            setValidTikTokSettings(false);
        } else if (!validTikTokSettings) {
            setValidTikTokSettings(true);
        }

        if (commercialContent && brandedContent && privacy === PrivacyOptions.PRIVATE) {
            setPrivacy(PrivacyOptions.PUBLIC);
        }
    }, [commercialContent, yourBrand, brandedContent, privacy]);

    return (
        <div className={classes.root}>
            <PrivacySelector
                privacy={privacy}
                setPrivacy={setPrivacy}
                commercialContent={commercialContent}
                brandedContent={brandedContent}
                privacyOptions={creatorInfo.privacy_level_options}
                disabled={disabled}
            />

            <InteractionAbilities
                allowComment={allowComment}
                allowCommentDisabled={creatorInfo.comment_disabled || disabled}
                setAllowComment={setAllowComment}
                allowDuet={allowDuet}
                allowDuetDisabled={creatorInfo.duet_disabled || disabled}
                setAllowDuet={setAllowDuet}
                allowStitch={allowStitch}
                allowStitchDisabled={creatorInfo.stitch_disabled || disabled}
                setAllowStitch={setAllowStitch}
            />

            {false && <DiscloseVideoContent
                commercialContent={commercialContent}
                setCommercialContent={setCommercialContent}
                yourBrand={yourBrand}
                setYourBrand={setYourBrand}
                brandedContent={brandedContent}
                setBrandedContent={setBrandedContent}
            />}
        </div>
    );
};

/* 
    Allow users to select who can view their video i.e. "Public", "Private", "Followers", "Friends" 
*/

const PrivacySelector = ({ privacy, setPrivacy, commercialContent, brandedContent, privacyOptions, disabled }) => {
    const hasPublic = privacyOptions.includes(PrivacyOptions.PUBLIC);
    return (
        <Stack direction="column" sx={{ marginBottom: 2 }}>
            <div className={classes.sectionTitle} style={{ marginBottom: 7 }}>
                Who can view this video
            </div>
            <Select value={privacy} onChange={(e) => setPrivacy(e.target.value)} size="small" disabled={disabled}>
                {privacyOptions.map((option) => {
                    const isPrivate = option === PrivacyOptions.PRIVATE;
                    const isDisabled = isPrivate && commercialContent && brandedContent;
                    return (
                        <MenuItem key={option} value={option} disabled={isDisabled}>
                            {isDisabled ? `${PrivacyOptionTitles[option]} (Branded content cannot be private)` : PrivacyOptionTitles[option]}
                        </MenuItem>
                    );
                })}
            </Select>
            {!hasPublic && (
                <Typography variant="caption" display="block" gutterBottom sx={{ marginTop: 1 }} className={classes.faded}>
                    If "Public" is not an option, you may need to change your privacy settings in the TikTok app.
                </Typography>
            )}
        </Stack>
    );
};

/* 
    Allow users to select whether or not to allow comments, duets, and stitches 
*/

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
            <div className={classes.sectionTitle} style={{ marginBottom: 7 }}>Allow users to</div>
            <FormGroup row>

                <Tooltip title="Your TikTok settings currently do not allow comments" disableHoverListener={!allowCommentDisabled} arrow>
                <FormControlLabel
                    control={<Checkbox checked={allowComment && !allowCommentDisabled} onChange={(e) => setAllowComment(e.target.checked)} name="allowComment" disabled={allowCommentDisabled} />}
                    label="Comment"
                />
                </Tooltip>

                <Tooltip title="Your TikTok settings currently do not allow duets" disableHoverListener={!allowDuetDisabled} arrow>
                <FormControlLabel
                    control={<Checkbox checked={allowDuet && !allowDuetDisabled} onChange={(e) => setAllowDuet(e.target.checked)} name="allowDuet" disabled={allowDuetDisabled} />}
                    label="Duet"
                />
                </Tooltip>

                <Tooltip title="Your TikTok settings currently do not allow stitching" disableHoverListener={!allowStitchDisabled} arrow>
                <FormControlLabel
                    control={<Checkbox checked={allowStitch && !allowStitchDisabled} onChange={(e) => setAllowStitch(e.target.checked)} name="allowStitch" disabled={allowStitchDisabled} />}
                    label="Stitch"
                />
                </Tooltip>
            </FormGroup>
        </Stack>
    );
};

const DiscloseVideoContent = ({ commercialContent, setCommercialContent, yourBrand, setYourBrand, brandedContent, setBrandedContent }) => {
    const renderDisclaimer = () => {
        const musicAnchor = <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Music Usage Confirmation</a>;
        const brandedAnchor = <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer">Branded Content Policy</a>;
        if (commercialContent) {
            if (brandedContent) {
                return <Typography variant="body2" style={{ margin: '20px 0' }}>By posting, you agree to TikTok's {brandedAnchor} and {musicAnchor}.</Typography>;
            } else if (yourBrand) {
                return <Typography variant="body2" style={{ margin: '20px 0' }}>By posting, you agree to TikTok's {musicAnchor}.</Typography>;
            }
        }
        return null;
    };

    return (
        <>
            <Stack direction="row" alignItems="center">
                <div className={classes.sectionTitle}>Disclose Video Content</div>
                <Switch checked={commercialContent} onChange={(e) => setCommercialContent(e.target.checked)} />
            </Stack>
            {commercialContent && (
                <>
                    <div className={classes.disclaimer}>
                        <InfoIcon /> Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                    </div>
                    <Typography variant="caption" display="block" gutterBottom className={classes.faded}>
                        Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.
                    </Typography>
                    <FormGroup>
                        <Stack direction="row" alignItems="center">
                            <Checkbox checked={yourBrand} onChange={(e) => setYourBrand(e.target.checked)} />
                            <div className={classes.sectionTitle}>
                                Your Brand
                            </div>
                        </Stack>
                        <Typography variant="caption" display="block" gutterBottom className={classes.faded}>
                            You are promoting yourself or your own business. This video will be classified as Brand Organic.
                        </Typography>

                        <Stack direction="row" alignItems="center">
                            <Checkbox checked={brandedContent} onChange={(e) => setBrandedContent(e.target.checked)} />
                            <div className={classes.sectionTitle}>
                                Branded content
                            </div>
                        </Stack>
                        <Typography variant="caption" display="block" gutterBottom className={classes.faded}>
                            You are promoting another brand or a third party. This video will be classified as Branded Content.
                        </Typography>
                    </FormGroup>
                </>
            )}
            {renderDisclaimer()}
        </>
    );
};  

export default TikTokPostSettings;
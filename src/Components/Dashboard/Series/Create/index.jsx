import {useEffect, useState, useContext} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import Layout from "~/src/Components/Dashboard/Layout";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import Button from '~/src/Components/Common/Button';
import UserContext from '~/src/Components/UserContext';
import SlantBGBox from "~/src/Components/Dashboard/SlantBGBox";
import ContentContainer from "~/src/Components/Common/ContentContainer";

import ContentType from '~/src/Models/ContentType';
import Voice from '~/src/Models/Voice';
import SeriesService from '~/src/Services/SeriesService';

import ContentSelector from "./ContentSelector";
import VoiceSelector from "./VoiceSelector";
import AccountSelector from "./AccountSelector";
import SectionHeader from "./SectionHeader";

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const allContentTypes = ContentType.all();
const allVoices = Voice.all();

function SeriesCreate({ children }) {
    const {user} = useContext(UserContext);
    const [contentType, setContentType] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contentData, setContentData] = useState(null);

    const handleContentSelected = (newContentType) => {
        setContentType(newContentType);
    };

    const handledContentDataChanged = (data) => {
        setContentData(data);
    }

    const handleVoiceSelected = (voice) => {
        setSelectedVoice(voice);
    };

    const handleAccountSelected = (accountOpenID) => {
        setSelectedAccount(accountOpenID);
    };

    const createSeries = async () => {
        
        setLoading(true);
        try {
            await SeriesService.create({
                contentTypeID: contentType.id,
                customPrompt: contentType.editable ? contentType.prompt : null,
                voiceID: selectedVoice.id,
                accountID: selectedAccount,
            });
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

    const hasRequiredFields = () => {
        return selectedAccount && (contentType && contentType.hasSufficientInformation()) && selectedVoice;
    }

	return (
		<Layout>
            <div className={classes.root}>
                <SlantBGBox />
                <ContentContainer className={classes.contentContainer}>
                    <div className={classes.header}>Create a Series</div>
                    <div className={classes.subheader}>Start your Faceless Video series.</div>
                    {/* <div className={classes.grid}> */}
                        <Paper className={classes.gridContent}>
                            <SectionHeader step={1} title="Destination" subtitle="The account where your video series will be posted" customClass={clsx(classes.firstSectionHeader, classes.sectionHeader)} />
                            <AccountSelector onAccountSelected={handleAccountSelected} />

                            {selectedAccount && (
                                <>
                                    <SectionHeader step={2} title="Content" subtitle="What will your video series be about?" customClass={classes.sectionHeader} />
                                    <ContentSelector contentTypes={allContentTypes} onContentSelected={handleContentSelected} onContentDataChanged={handledContentDataChanged} />
                                    <VoiceSelector voices={allVoices} onVoiceSelected={handleVoiceSelected} />

                                    <SectionHeader step={3} title="Create" subtitle="You will be able to preview your upcoming videos before posting" customClass={classes.sectionHeader} />
                                    <Button className={classes.createButton} onClick={createSeries} loading={loading} disabled={!hasRequiredFields()}>Create Series +</Button>
                                </>
                            )}
                        </Paper>
                        {/* <div className={classes.gridItemRight}>
                            <div className={classes.videoHeader}>Example</div>
                            <div className={classes.videoSubheader}>This is an example of what a video may look like</div>
                            <video className={classes.video} controls>
                                <source src="https://autoshorts.ai/storage/videos/test2.mp4" type="video/mp4" />
                                Your browser does not support HTML video.
                            </video>
                        </div> */}
                    {/* </div> */}
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(SeriesCreate);
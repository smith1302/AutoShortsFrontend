import {useEffect, useState, useContext} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import paths from "~/src/paths";
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
import AccountSelector from "~/src/Components/Dashboard/Series/AccountSelector";
import SectionHeader from "./SectionHeader";

import Paper from '@mui/material/Paper';

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

    const createSeries = async () => {
        
        setLoading(true);
        try {
            const response = await SeriesService.create({
                contentTypeID: contentType.id,
                customPrompt: contentType.editable ? contentType.prompt : null,
                voiceID: selectedVoice.id,
                accountID: selectedAccount,
            });
            const seriesID = response.seriesID;
            window.location.href = paths.manageSeries(seriesID);
        } catch (e) {
            alert(e);
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
                    <Paper className={classes.gridContent}>
                        <SectionHeader step={1} title="Destination" subtitle="The account where your video series will be posted" customClass={clsx(classes.firstSectionHeader, classes.sectionHeader)} />
                        <AccountSelector selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} label={"Select Account"} disabled={loading} />

                        {selectedAccount && (
                            <>
                                <SectionHeader step={2} title="Content" subtitle="What will your video series be about?" customClass={classes.sectionHeader} />
                                <ContentSelector contentTypes={allContentTypes} onContentSelected={handleContentSelected} onContentDataChanged={handledContentDataChanged} disabled={loading} />
                                <VoiceSelector voices={allVoices} onVoiceSelected={handleVoiceSelected} disabled={loading} />

                                <SectionHeader step={3} title="Create" subtitle="You will be able to preview your upcoming videos before posting" customClass={classes.sectionHeader} />
                                <Button className={classes.createButton} onClick={createSeries} loading={loading} disabled={!hasRequiredFields()}>Create Series +</Button>
                            </>
                        )}
                    </Paper>
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(SeriesCreate);
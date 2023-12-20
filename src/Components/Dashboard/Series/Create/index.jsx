import {useEffect, useState, useContext} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";
import Layout from "~/src/Components/Dashboard/Layout";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import Button from '~/src/Components/Common/Button';
import UserContext from '~/src/Components/UserContext';

import ContentType from '~/src/Models/ContentType';
import Voice from '~/src/Models/Voice';
import SeriesService from '~/src/Services/SeriesService';

import ContentSelector from "./ContentSelector";
import VoiceSelector from "./VoiceSelector";
import AccountSelector from "./AccountSelector";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const allContentTypes = ContentType.all();
const allVoices = Voice.all();

function SeriesCreate({ children }) {
    const {user} = useContext(UserContext);
    const [contentType, setContentType] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleContentSelected = (newContentType) => {
        setContentType(newContentType);
    };

    const handleVoiceSelected = (voice) => {
        setSelectedVoice(voice);
    };

    const createSeries = async () => {
        console.log(selectedVoice);
        console.log(contentType);
        
        setLoading(true);
        try {
            await SeriesService.create({
                contentTypeID: contentType.id,
                contentDetails: contentType.prompt,
                voiceID: selectedVoice.id,
            });
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

	return (
		<Layout>
            <div className={classes.root}>
                <ContentContainer width={700}>
                    <AccountSelector />
                    <div className={classes.headerText}>Create a Series</div>
                    <div className={classes.subHeaderText}>What kind of content do you want to create?</div>
                    <ContentSelector contentTypes={allContentTypes} onContentSelected={handleContentSelected} />

                    <VoiceSelector voices={allVoices} onVoiceSelected={handleVoiceSelected} />

                    <div className={classes.flexContainer}>
                        <Button className={classes.createButton} onClick={createSeries} loading={loading}>Create Series +</Button>
                    </div>
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(SeriesCreate);
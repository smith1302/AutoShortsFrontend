import {useEffect, useState, useContext} from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import URLImportModal from '../URLImportModal';
import SampleModal from '../SampleModal';
import ContentType from '~/src/Models/ContentType';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

function ContentSelector({ children, onContentSelected, contentTypes }) {
    const [contentType, setContentType] = useState(null);
    const [openImportModal, setOpenImportModal] = useState(false);
    const [openSampleModal, setOpenSampleModal] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        onContentSelected(null); // Inform the parent component of the default selection
    }, []);

    const handleContentChange = (newContentType) => {
        setContentType(newContentType);
        onContentSelected(newContentType);

        if (newContentType.id == ContentType.ID.SHOPIFY_PRODUCT_PROMOTION) {
            setOpenImportModal(true);
        }
    };

    const handleTextAreaChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleImport = ({name, description}) => {
		setOpenImportModal(false);
        setPrompt(`Name: ${name}\nDescription: ${validateDescription(description)}`);
	}

    // Force a re-render of textarea to use the new prompt
    const setPrompt = (prompt) => {
        contentType.setPrompt(prompt);
        setForceUpdate(forceUpdate + 1);
    }

	const validateDescription = (description) => {
		const span = document.createElement('span');
    	span.innerHTML = description;
    	let text = span.textContent || span.innerText;
		text = text.replace(/  +/g, ' ');
		// Replace consecutive linebreaks with a single.
		text = text.replace(/\n\s*\n/g, '\n');
		return text;
	}

    return (
        <div className={classes.root}>
            <FormControl fullWidth>
                <InputLabel id="labelID">Choose Content</InputLabel>
                <Select
                    labelId="labelID"
                    value={contentType ? contentType.id : ''}
                    label="Choose Content"
                    onChange={(e) => {
                        const selectedOption = contentTypes.find(option => option.id == e.target.value);
                        handleContentChange(selectedOption);
                    }}
                    className={classes.selector}
                    displayEmpty
                >
                    {contentTypes.map(option => {
                        return (
                            <MenuItem value={option.id} key={option.id}>{option.name}</MenuItem>
                        )
                    })}
                </Select>
            </FormControl>
            {(contentType && contentType.editable) && (
                <TextField
                    className={classes.textarea}
                    label={contentType.editLabel || "Custom Prompt"}
                    placeholder={contentType.editPlaceholder || "Example: Write about an interesting, factual event that occured in history that most people do not know about. Keep it short and engaging, in the style of a story."}
                    onChange={handleTextAreaChange}
                    value={contentType.prompt}
                    multiline={true}
                    rows={Math.min(6, Math.max(3, Math.floor(contentType.prompt.length/75)))}
                    InputProps={{ 
                        inputProps: { maxLength: contentType.maxPromptLength },
                        endAdornment: (<InputAdornment position="end"><div className={classes.charsLeft}>{contentType.prompt.length} / {contentType.maxPromptLength}</div></InputAdornment>)
                    }}
                    fullWidth 
                    type="text"
                    focused
                />     
            )}
            {(contentType && contentType.sample) && <a href='#' className={classes.showSample} onClick={()=>setOpenSampleModal(true)}>Show Sample</a>}

            <SampleModal open={openSampleModal} onClose={() => setOpenSampleModal(false)} contentType={contentType} />

            <URLImportModal 
                    open={openImportModal} 
                    onClose={() => setOpenImportModal(false)} 
                    onImport={handleImport}
                    logo={'/images/social/Shopify.png'}
                    title={'Import from Shopify'}
                    placeholder={'https://yourstore.com/products/dogcollar'}
                    importEndpont={'/api/import/shopify'} 
                />
        </div>
    )
}

export default ContentSelector;
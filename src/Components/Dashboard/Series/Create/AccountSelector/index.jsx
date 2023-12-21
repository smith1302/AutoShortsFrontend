import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import TikTokOAuthService from "~/src/Services/TikTokOAuthService";

import InputLabel from '@mui/material/InputLabel';
import {MenuItem, Select} from '@mui/material';
import FormControl from '@mui/material/FormControl';

const AccountSelector = () => {
    const [accounts, setAccounts] = useState(['Link new account']);

    useEffect(() => {
        // Fetch linked accounts from your database and update the state
    }, []);

    const handleAccountChange = async (event) => {
        const selectedAccount = event.target.value;
        if (selectedAccount === 'Link new account') {
            const response = await TikTokOAuthService.getOAuthURL();
            console.log(response);
            try {
                const authUrl = response.authUrl;
                window.location.href = authUrl;
            } catch (error) {
                alert("Could not get TikTok auth url");
            }
        } else {
            // Set the current account
        }
    };

    return (
        <div className={classes.root}>
            <FormControl fullWidth>
                <InputLabel id="labelID">Select Account</InputLabel>
                <Select
                    label="Select Account"
                    labelId="labelID"
                    onChange={handleAccountChange}
                    className={classes.selector}
                >
                    {accounts.map(account => (
                        <MenuItem key={account} value={account}>{account}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default AccountSelector;
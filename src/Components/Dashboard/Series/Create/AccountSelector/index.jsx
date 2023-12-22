import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import TikTokOAuthService from "~/src/Services/TikTokOAuthService";

import InputLabel from '@mui/material/InputLabel';
import {MenuItem, Select} from '@mui/material';
import FormControl from '@mui/material/FormControl';

const linkAccount = {openID: -1, name: 'Link a new account +'};

const AccountSelector = ({onAccountSelected}) => {
    const [accounts, setAccounts] = useState([linkAccount, {openID: 1, name: 'Account 1'}, {openID: 2, name: 'Account 2'}]);

    useEffect(() => {
        // Fetch linked accounts from your database and update the state
    }, []);

    const handleAccountChange = async (event) => {
        const selectedOpenID = event.target.value;
        if (selectedOpenID === linkAccount.openID) {
            linkNewAccount();
        } else {
            onAccountSelected(selectedOpenID);
        }
    };

    const linkNewAccount = async () => {
        const response = await TikTokOAuthService.getOAuthURL();
        try {
            const authUrl = response.authUrl;
            window.location.href = authUrl;
        } catch (error) {
            alert("Could not get TikTok auth url");
        }
    }

    return (
        <div className={classes.root}>
            <FormControl fullWidth>
                <InputLabel id="labelID">Select Account</InputLabel>
                <Select
                    label="Select Account"
                    labelId="labelID"
                    onChange={handleAccountChange}
                    className={classes.selector}
                    displayEmpty
                >
                    {accounts.map(account => (
                        <MenuItem key={account.openID} value={account.openID}>{account.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default AccountSelector;
import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import TikTokOAuthService from "~/src/Services/TikTokOAuthService";
import UserService from "~/src/Services/UserService";

import InputLabel from '@mui/material/InputLabel';
import {MenuItem, Select, Avatar} from '@mui/material';
import FormControl from '@mui/material/FormControl';

const linkAccount = {openID: -1, displayName: 'Link a TikTok Account +', avatarURL: null};

const AccountSelector = ({onAccountSelected}) => {
    const [accounts, setAccounts] = useState([linkAccount]);

    useEffect(() => {
        (async () => {
            const accounts = await UserService.getAccountList();
            if (accounts && accounts.tiktok) {
                setAccounts([...accounts.tiktok, linkAccount]);
            }
        })();
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
                        <MenuItem key={account.openID} value={account.openID}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    alt={account.displayName} 
                                    src={account.avatarURL}
                                    style={{ marginRight: 10, width: 30, height: 30 }}
                                />
                                {account.displayName}
                            </div>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default AccountSelector;
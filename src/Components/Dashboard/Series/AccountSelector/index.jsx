import { useEffect, useState, useContext } from "react";
import clsx from "clsx";
import classes from "./index.module.scss";

import TikTokOAuthService from "~/src/Services/TikTokOAuthService";
import UserService from "~/src/Services/UserService";

import CircularProgress from '@mui/material/CircularProgress';
import InputLabel from '@mui/material/InputLabel';
import {MenuItem, Select, Avatar} from '@mui/material';
import FormControl from '@mui/material/FormControl';

const linkAccount = {openID: -1, displayName: 'Link a TikTok Account +', avatarURL: null};

const AccountSelector = ({selectedAccount = null, setSelectedAccount, size = null, label = null, disabled}) => {
    const [accounts, setAccounts] = useState([linkAccount]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const accounts = await UserService.getAccountList();
            if (accounts && accounts.tiktok) {
                setAccounts([...accounts.tiktok, linkAccount]);
            }
            setLoading(false);
        })();
    }, []);

    const handleAccountChange = async (event) => {
        const selectedOpenID = event.target.value;
        if (selectedOpenID === linkAccount.openID) {
            linkNewAccount();
        } else {
            setSelectedAccount(selectedOpenID);
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

    const avatarSize = size === 'small' ? 20 : 25;

    return (
        <div className={classes.root}>
            <FormControl fullWidth size={size}>
                {label && <InputLabel id="labelID">{label}</InputLabel>}
                <Select
                    label={label}
                    labelId="labelID"
                    value={selectedAccount}
                    onChange={handleAccountChange}
                    className={classes.selector}
                    displayEmpty
                    disabled={disabled}
                >
                    {loading && (
                        <MenuItem value={"loading"} disabled>
                            <CircularProgress size={avatarSize * 0.75} style={{ marginRight: 12 }}/>
                            <div>Loading Accounts</div>
                        </MenuItem>
                    )}
                    {accounts.map(account => (
                        <MenuItem key={account.openID} value={account.openID}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    alt={account.displayName} 
                                    src={account.avatarURL}
                                    style={{ marginRight: 8, width: avatarSize, height: avatarSize }}
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
import { useState, useContext } from 'react';
import classes from "./index.module.scss"
import clsx from 'clsx';
import paths from '~/src/paths';
import globals from '~/src/globals';
import { SubscriptionStatus } from '~/src/enums';
import ContentContainer from "~/src/Components/Common/ContentContainer";
import LocalUser from '~/src/Models/LocalUser';
import useIsMobile from '~/src/Hooks/useIsMobile';
import UserService from '~/src/Services/UserService';
import UserContext from '~/src/Components/UserContext';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import VerifiedIcon from '@mui/icons-material/Verified';

/*
    How the navbar works...

    Depending on if we are on mobile (by using the isMobile hook), we will either show the
    `DesktopMenu` or the `MobileMenu` component. The mobile menu is more condensed and has a toggle open/close.

    We use the links map below to create the elements so that there is consistency between the desktop & mobile links.

    I'm sure there is a better way...
*/

function DesktopMenu({user, links}) {
    const makeElementsFromLinkList = (list) => {
        return (
            <>{list.map(link => <a key={link.href+link.text} href={link.href} onClick={link.onClick} className={link.pill ? classes.pill : null}>{link.text}</a>)}</>
        );
    }
    return (
        <div className={classes.menu}>
            {makeElementsFromLinkList(links.common)}
            {user ? makeElementsFromLinkList(links.loggedInLinks) : makeElementsFromLinkList(links.loggedOutLinks)}
        </div>
    )
}

function MobileMenu({ user, links }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const makeElementsFromLinkList = (list) => {
        return (
            list.map(link => {
                return (
                    <a key={link.href+link.text} href={link.href} onClick={link.onClick} className={classes.menuLink}>
                        <MenuItem>{link.text}</MenuItem>
                    </a>
                )
            })
        );
    }

    return (
        <div className={classes.menu}>
            <Button 
                variant="outlined"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className={classes.mobileMenuBtn}>
                <MenuIcon />
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {makeElementsFromLinkList(links.common)}
                {user ? makeElementsFromLinkList(links.loggedInLinks) : makeElementsFromLinkList(links.loggedOutLinks)}
            </Menu>
        </div>
    )
}

export default function NavBar({ children, light, fullWidth=false, links }) {
    const {user, subscriptionSummary} = useContext(UserContext);
    const isMobile = useIsMobile();
    const showUpgradeUpsell = (subscriptionSummary.subscriptionStatus != SubscriptionStatus.ACTIVE);

    const defaultLinks = {
        common: [
        ],
        loggedOutLinks: [
            {href: paths.pricing, text: "Pricing", onClick: null},
            {href: "#", text: "Login", onClick: (e) => { e.preventDefault(); UserService.showLoginDialog()}},
            {href: "#", text: "Sign Up", onClick: (e) => { e.preventDefault(); UserService.showRegisterDialog()}, pill: true},
        ],
        loggedInLinks: [
            {href: paths.dashboard, text: "Dashboard", onClick: null, pill: false},
            {href: paths.affiliate, text: "Affiliates", onClick: null},
            {href: "#", text: "Logout", onClick: (e) => { e.preventDefault(); UserService.logout()}}
        ]
    }
    if (showUpgradeUpsell) {
        defaultLinks.loggedInLinks.unshift({href: paths.billing, text: (<><VerifiedIcon /> Upgrade</>), onClick: null, pill: true});
    }

    links = links || defaultLinks;

    return (
        <div className={clsx(classes.root, light ? classes.light : classes.dark)}>
            <VariableWidthContainer fullWidth={fullWidth}>
                <div className={classes.content}>
                    <div className={classes.logo}>
                        <a href="/">
                        {light ? <img src='/images/LogoWhite.png' alt="Logo" /> : <img src='/images/LogoGradient.png' alt="Logo" />}{globals.appName}
                        </a>
                    </div>
                    {isMobile ? <MobileMenu user={user} links={links} /> : <DesktopMenu user={user} links={links} />}
                </div>
            </VariableWidthContainer>
        </div>
    )
}

function VariableWidthContainer({children, fullWidth}) {
    if (fullWidth) {
        return (
            <Box px={'20px'} width={'100%'}>
            {children}
            </Box>
        )
    }

    return (
        <ContentContainer>
            {children}
        </ContentContainer>
    )
}
import { useState, useContext } from 'react';
import clsx from 'clsx';
import paths from "~/src/paths";
import { RegisterSource } from '~/src/enums';
import { useRouter } from 'next/router'
import classes from "./index.module.scss";

import { SubscriptionStatus } from '~/src/enums';
import OnboardService from "~/src/Services/OnboardService";
import UserContext from '~/src/Components/UserContext';

import Collapse from '@mui/material/Collapse';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import FaceIcon from '@mui/icons-material/Face';
import StreamIcon from '@mui/icons-material/Stream';
import StoreIcon from '@mui/icons-material/Store';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import InsightsIcon from '@mui/icons-material/Insights';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';

export default function Layout({ children }) {
    const {user, subscriptionSummary, registerSource} = useContext(UserContext);
    const router = useRouter();
    const isUpgraded = (subscriptionSummary.subscriptionStatus === SubscriptionStatus.ACTIVE);


    const links = [
        {text: 'Home', icon: <HomeIcon />, path: paths.dashboard},
        {text: 'Series', icon: <SlowMotionVideoIcon />, defaultOpen: true, children: [
            {text: 'View', icon: <InsightsIcon />, path: paths.viewAllSeries},
            {text: 'Create', icon: <AddCircleOutlineIcon />, path: paths.createSeries},
        ]},
        // {text: 'Stores', icon: <StoreIcon />, children: [
        //     {text: 'Popular', icon: <WhatshotIcon />, path: paths.topStores},
        //     {text: 'My Tracked', icon: <FavoriteIcon />, path: paths.favorites},
        // ], extraOpenPaths: (currentPathName) => {
        //     return falsepaths.storeAnalysis().includes(currentPathName);
        // }},
        {text: 'Billing', icon: <PaymentIcon />, path: paths.billing, divider: true},
        {text: 'Account', icon: <FaceIcon />, path: paths.account}
    ];

    const isCurrentPath = (targetPath) => router.pathname == targetPath;
    const linkHasSelectedChildren = (link) => link.children.some((childLink) => isCurrentPath(childLink.path));

	return (
		<div className={classes.root}>
            {
                links.map((link) => {
                    return link.children ? (
                        <CollapseLink link={link} key={link.text} defaultOpen={link.defaultOpen || linkHasSelectedChildren(link) || (link.extraOpenPaths && link.extraOpenPaths(router.pathname))} />
                    ) : (
                        <Link link={link} key={link.text} />
                    )
                })
            }
		</div>
	);
}

function CollapseLink({link, defaultOpen=false}) {
    const [open, setOpen] = useState(defaultOpen);
    const router = useRouter();
    const icon = link.icon ? link.icon : <StreamIcon sx={{opacity: 0}} />;
    // const isCurrentPath = (targetPath) => router.pathname == targetPath;
    // const isSelected = isCurrentPath(link.path) || link.children.some((childLink) => isCurrentPath(childLink.path));

    return (
        <>
            <a href={link.path} className={clsx(link.divider ? classes.divider : null)} key={link.text} onClick={() => setOpen(!open)}>
                {icon}
                <span className={classes.title}>
                    {link.showDot ? (
                        <Badge variant="dot" color="secondary" className={classes.badgeContainer} classes={{ badge: classes.badge }}>{link.text}</Badge>
                    ) : (
                        link.text
                    )}
                </span>
                <span className={classes.expandIcon}>
                {open ? <ExpandLess /> : <ExpandMore />}
                </span>
            </a>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {link.children.map((childLink) => {
                    return <Link link={childLink} key={childLink.text} isChild={true} />
                })}
            </Collapse>
        </>
    )
}

function Link({link, isChild = false}) {
    const router = useRouter();
    const isSelected = (targetPath) => {
        return router.pathname == targetPath ? classes.selected : null;
    }

    const icon = link.icon ? link.icon : <StreamIcon sx={{opacity: 0}} />;

    return (
        <a href={link.path} className={clsx(isSelected(link.path), (link.divider || isChild) ? classes.divider : null, isChild ? classes.isChild : null)} key={link.text} onClick={link.onClick}>
            {icon}
            <span className={classes.title}>
                {link.showDot ? (
                    <Badge variant="dot" color="secondary" className={classes.badgeContainer} classes={{ badge: classes.badge }}>{link.text}</Badge>
                ) : (
                    link.text
                )}
            </span>
        </a>
    )
}
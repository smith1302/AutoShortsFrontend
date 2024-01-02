import {useContext} from "react"
import classes from "./index.module.scss";

import paths from '~/src/paths';
import globals from '~/src/globals';
import UserContext from '~/src/Components/UserContext';
import ContentContainer from "~/src/Components/Common/ContentContainer";
import GIFDemo from "./GIFDemo"
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function Hero({ children }) {
    const {user} = useContext(UserContext);

    return (
        <ContentContainer className={classes.root}>
            <div className={classes.grid}>
                <div className={classes.left}>
                    <h1 className={classes.title}>
                        Faceless Video Creation
                    </h1>
                    <div className={classes.subtitle}>
                        Our powerful AI video creation platform allows you to create, edit, and schedule faceless videos in seconds.
                    </div>
                    <div className={classes.btnContainer}>
                        <HeroButton user={user} />
                    </div>
                </div>
                <div className={classes.right}>
                    <GIFDemo />
                </div>
            </div>
        </ContentContainer>
    )
}

const HeroButton = ({user}) => {
    if (user) {
        return <a href={paths.dashboard} className={classes.btn}><DashboardIcon sx={{marginRight: '8px'}} /> Visit Dashboard</a>;
    } else {
        return (
            <>
                <a href={paths.dashboard} className={classes.btn}>Try {globals.appName} for Free</a>
                <div className={classes.noCardRequired}>(No credit card required)</div>
            </>
        );
    }
}
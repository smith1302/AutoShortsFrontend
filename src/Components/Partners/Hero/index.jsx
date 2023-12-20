import {useContext} from "react"
import classes from "./index.module.scss";

import paths from '~/src/paths';
import globals from '~/src/globals';
import UserContext from '~/src/Components/UserContext';
import ContentContainer from "~/src/Components/Common/ContentContainer";
import GIFDemo from "./GIFDemo"

import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Hero({ children }) {
    const {user} = useContext(UserContext);

    return (
        <ContentContainer className={classes.root}>
            <div className={classes.grid}>
                <div className={classes.left}>
                    <h1 className={classes.title}>
                        Affiliate Program
                    </h1>
                    <div className={classes.subtitle}>
                        Ready to start making passive income? Earn a recurring commission by spreading the word about {globals.appName}.
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
        return <a href={paths.affiliate} className={classes.btn}><DashboardIcon sx={{marginRight: '8px'}} /> Visit Dashboard</a>;
    } else {
        return (
            <>
                <a href={`${paths.register}?destination=${paths.affiliate}`} className={classes.btn}>Get Started <ArrowForwardIcon sx={{marginLeft: '8px'}}/></a>
            </>
        );
    }
}
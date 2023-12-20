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
                        {/* Unleash eCommerce Potential */}
                        {/* Shopify Sales Uncovered */}
                        {/* Real-Time Sales Tracking */}
                        Discover Products That Sell.
                    </h1>
                    <div className={classes.subtitle}>
                        {/* We track real-time sales across thousands of stores to show you which products actually sell. */}
                        {/* With {globals.appNameFull}, track live sales data from thousands of stores and discover viral & winning products. */}
                        Track live sales data from thousands of stores to discover winning products, research competition, and validate product ideas.
                        {/* Track the sales of any Shopify store to discover winning products, research competition, and validate product ideas. */}
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
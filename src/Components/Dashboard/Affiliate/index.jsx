import {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import Layout from "~/src/Components/Dashboard/Layout";
import paths from '~/src/paths';

import SetIDCard from "./SetIDCard";
import Main from "./Main";
import AffiliateBanPage from "./AffiliateBanPage";

import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import UserContext from '~/src/Components/UserContext';

import FetchWrapper from "~/src/Services/FetchWrapper";

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

function Affiliate({ children }) {
    const {user} = useContext(UserContext);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [affiliateID, setAffiliateID] = useState(null);
    const [paypal, setPayPal] = useState(null);
    const [stats, setStats] = useState(null);

    const [isBanned, setIsBanned] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        checkForAffiliateInfo();
    }, []);

    const checkForAffiliateInfo = async () => {
        FetchWrapper.get(`/api/user/affiliate`)
        .then(response => {
            setIsBanned(response.banned);
            setMessage(response.message);
            setAffiliateID(response.affiliateID);
            setPayPal(response.paypal);
            setStats(response.stats);
            // Important that this comes after we so don't render components before state is set.
            setHasLoaded(true);
        })
        .catch(err => {
            console.log(err);
        });
    }

    if (isBanned && message) {
        return <AffiliateBanPage body={message.body} title={message.title} />
    }

    let messageComponent = null;
    if (message) {
        messageComponent = (
            <Alert severity="warning" className={classes.message}>
                <AlertTitle>{message.title}</AlertTitle>
                <span className={classes.preWrap}>{message.body}</span>
            </Alert>
        );
    }

	return (
		<Layout loading={!hasLoaded}>
            <div className={classes.root}>
                <ContentContainer>
                    {messageComponent}
                    {affiliateID ? (
                        <Main affiliateID={affiliateID} paypal={paypal} stats={stats} />
                    ) : (
                        <SetIDCard onSaveSuccess={() => checkForAffiliateInfo()}/>
                    )}
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(Affiliate, `${paths.register}?destination=${paths.affiliate}`);
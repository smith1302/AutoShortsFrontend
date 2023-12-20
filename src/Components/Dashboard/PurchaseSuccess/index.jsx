import {useEffect, useState} from "react";
import classes from "./index.module.scss";
import paths from "~/src/paths";
import Layout from "../Layout";
import { SubscriptionSource } from '~/src/enums';
import Button from "~/src/Components/Common/Button";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';
import FetchWrapper from "~/src/Services/FetchWrapper";
import PixelService from '~/src/Services/PixelService';
import GTagService from '~/src/Services/GTagService';
import TikTokService from '~/src/Services/TikTokService';
import Paper from '@mui/material/Paper';

function PurchaseSuccess({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FetchWrapper.post(`/api/user/billing`)
        .then(response => {
            const value = response.subscriptionPrice;
            PixelService.logPixel('Purchase', {currency: "USD", value: value}, `purchase_${response.subscriptionID}`);
            GTagService.purchase(value);
            TikTokService.purchase(value);
        })
        .catch(err => {
            PixelService.logPixel('Purchase');
            GTagService.purchase();
            TikTokService.purchase();
        });

        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

	return (
		<Layout>
            <div className={classes.root}>
                <ContentContainer width={1000} className={classes.content}>
                    <Paper className={classes.paper}>
                        <div className={classes.emoji}>🙌</div>
                        <h1 className={classes.header}>Thank You For Your Purchase</h1>
                        <h4 className={classes.subHeader}>Please allow a few minutes for your subscription to activate.</h4>
                        <Button href={paths.billing} className={classes.btn} variant="contained" disableElevation loading={loading}>Back to Billing</Button>
                    </Paper>
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(PurchaseSuccess);
import {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import Layout from "~/src/Components/Dashboard/Layout";
import paths from '~/src/paths';

import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

function AffiliateBanPage({ body, title }) {
	return (
		<Layout loading={false}>
            <div className={classes.root}>
                <ContentContainer>
                    <Alert severity="error">
                        <AlertTitle>{title}</AlertTitle>
                        <span className={classes.preWrap}>{body}</span>
                    </Alert>
                </ContentContainer>
            </div>
		</Layout>
	)
}

export default withAuthProtection(AffiliateBanPage, `${paths.register}?destination=${paths.affiliate}`);
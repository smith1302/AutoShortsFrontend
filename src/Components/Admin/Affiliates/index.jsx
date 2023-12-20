import {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';

import FetchWrapper from "~/src/Services/FetchWrapper";

import Paper from '@mui/material/Paper';

function AffiliatesComponent() {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch();
    }, []);

    const fetch = async () => {
        setLoading(true);
        FetchWrapper.get(`/api/admin/affiliates`)
        .then(response => {
            setAffiliates(response.affiliates);
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const payAll = async () => {
        setLoading(true);
        FetchWrapper.get(`/api/admin/affiliates/payall`)
        .then(response => {
            fetch();
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const paySingle = async (affiliateID) => {
        setLoading(true);
        FetchWrapper.post(`/api/admin/affiliates/markPaid`, {affiliateID})
        .then(response => {
            fetch();
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const totalPayout = !affiliates.length ? 0 : affiliates.reduce((total, affiliate) => {
        return total + affiliate.unpaid;
    }, 0);

	return (
        <div className={classes.root}>
            <ContentContainer>
                <h1><a href='/admin'>Back to Events</a></h1>
                <div>
                    <div className={classes.actionRow}>
                        <button onClick={payAll} disabled={loading || !totalPayout}>Pay All ${Number(totalPayout).toLocaleString()}</button>
                    </div>
                    {affiliates && affiliates.map((affiliate) => {
                        return (
                            <div key={affiliate.affiliateID}>
                                <Paper className={classes.paper}>
                                    <div><b>UserID:</b> <div><a href={`/admin/events/user/${affiliate.id}`}>{affiliate.id}</a></div></div>
                                    <div><b>Affiliate ID:</b> <div>{affiliate.affiliateID}</div></div>
                                    <div><b>PayPal:</b> <div>{affiliate.affiliatePayPal}</div></div>
                                    <div><b>Unpaid:</b> <div>${Number(affiliate.unpaid).toLocaleString()}</div></div>
                                    <div><b>Pay:</b> 
                                        <div><button onClick={() => paySingle(affiliate.affiliateID)} disabled={loading || !affiliate.unpaid}>Pay ${affiliate.unpaid}</button></div>
                                    </div>
                                </Paper>
                            </div>
                        )
                    })}
                </div>
            </ContentContainer>
        </div>
	)
}

export default withAuthProtection(AffiliatesComponent);
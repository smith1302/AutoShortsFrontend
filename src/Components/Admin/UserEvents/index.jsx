import {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';

import FetchWrapper from "~/src/Services/FetchWrapper";

import Paper from '@mui/material/Paper';

function UserEvents({ userID }) {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [similarAccounts, setSimilarAccounts] = useState(null);

    useEffect(() => {
        FetchWrapper.get(`/api/admin/events/user/${userID}`)
        .then(response => {
            setEvents(response.events);
            setUser(response.user);
            setSimilarAccounts(response.similarAccounts);
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

    const subLink = (subscriptionID) => {
        if (subscriptionID.includes('sub')) {
            return `https://dashboard.stripe.com/subscriptions/${user.subscriptionID}`
        } else if (subscriptionID.includes('I-')) {
            return `https://www.paypal.com/billing/subscriptions/${user.subscriptionID}`;
        }
        return null;
    }

	return (
        <div className={classes.root}>
            <ContentContainer>
                <h1><a href='/admin'>Back to Events</a></h1>
                {user && (<>
                    <p>
                        <div><b>Email: </b>{user.email} {user.IP && (<>(IP: {user.IP})</>)}</div>
                        <div>
                            <b>Subscription: </b>
                            <a href={subLink(user.subscriptionID)} target="_blank">{user.subscriptionID}</a>
                        </div>
                        <div><b>Similar Accounts: </b>
                            {similarAccounts && similarAccounts.map((account) => {
                                return <a href={`/admin/events/user/${account.id}`} target="_blank" key={account.id}>{account.id}</a>
                            })}
                        </div>
                        <div><b>All: </b>
                            <pre>
                                {JSON.stringify(user, undefined, 2)}
                            </pre>
                        </div>
                    </p>
                    <hr />
                    <br />
                </>)}

                <div>
                    {events.map((event) => {
                        return (
                            <>
                                <div className={classes.created}>{event.created}</div>
                                <Paper className={classes.paper}>
                                    <div><b>Event:</b> <div>{event.name}</div></div>
                                    <div><b>Data:</b> <div className={classes.dataCol}>{formatData(event.name, event.data)}</div></div>
                                </Paper>
                                <div className={classes.line}></div>
                            </>
                        )
                    })}
                    {user && user.referralURL && (<>
                        <div className={classes.created}></div>
                        <Paper className={classes.paper}>
                            <div><b>Event:</b> <div>First Visit</div></div>
                            <div><b>Referral URL:</b> <div className={classes.dataCol}>{user.referralURL}</div></div>
                        </Paper>
                    </>)}
                </div>
            </ContentContainer>
        </div>
	)
}

const formatData = (event, data) => {
    let json;
    try {
        json = JSON.parse(data);
    } catch (err) {}

    if (!json) {
        return data;
    }

    if (event == "pageview") {
        return Object.entries(json).map(([key, value]) => {
            return (
                <div key={value}>{value}</div>
            )
        });
    } else if (event == "Edit") {
        return (
            <div>
                <p><i><u>Action:</u></i></p>
                <p>{json.action}</p>
                <p><i><u>Input:</u></i></p>
                <p>{json.input}</p>
                <p><i><u>Output:</u></i></p>
                <p>{json.output}</p>
            </div>
        );
    } else {
        return (
            <div>
                <p><i><u>Form Parms:</u></i></p>
                <p>
                    {json.formParams && Object.entries(json.formParams).map(([key, value]) => {
                        return (
                            <div key={value}><b>{key}</b>: {value}</div>
                        )
                    })}
                </p>
                <hr />
                <p><i><u>Copy:</u></i></p>
                <p className={classes.preWrap}>
                    {json.content?.map((item) => {
                        return (<div key={item.id}><div dangerouslySetInnerHTML={{__html: item.copy}} className={classes.copy}></div><hr /></div>)
                    })}
                </p>
            </div>
        );
    }
}

export default withAuthProtection(UserEvents);
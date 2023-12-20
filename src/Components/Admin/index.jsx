import React, {useEffect, useState, useContext} from "react";
import classes from "./index.module.scss";
import clsx from "clsx";
import {formatNum} from "~/src/Utils/common";
import ContentContainer from "~/src/Components/Common/ContentContainer";
import Button from "~/src/Components/Common/Button";
import withAuthProtection from '~/src/Components/Common/withAuthProtection';

import FetchWrapper from "~/src/Services/FetchWrapper";

import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';

function AdminHome({ children }) {
    const [events, setEvents] = useState([]);
    const [recentAccounts, setRecentAccounts] = useState(0);
    const [revenueStats, setRevenueStats] = useState(null);
    const [affiliateStats, setAffiliateStats] = useState(null);
    const [recentSubscribers, setRecentSubscribers] = useState(null);
    const [growthTable, setGrowthTable] = useState(null);
    const [paymentSum, setPaymentSum] = useState(null);

    useEffect(() => {
        FetchWrapper.get(`/api/admin`)
        .then(response => {
            setEvents(response.events);
            setRevenueStats(response.revenueStats);
            setAffiliateStats(response.affiliateStats);
            setRecentAccounts(response.recentAccounts);
            setRecentSubscribers(response.recentSubscribers);
            setGrowthTable(response.growthTable);
            setPaymentSum(response.paymentSum);
        })
        .catch(err => {
            if (err == "Not admin") {
                window.location = "/";
            }
            console.log(err);
        });
    }, []);


	return (
        <div className={classes.root}>
            <ContentContainer>
                
                <StatsSection revenueStats={revenueStats} recentAccounts={recentAccounts} paymentSum={paymentSum} />
                <UserSearch />
                <QuickLinks />
                <GrowthTable growthTable={growthTable} />
                <AffiliateStats affiliateStats={affiliateStats} />
                <RecentSubscribers subscribers={recentSubscribers} />
                <Events events={events} />
                
            </ContentContainer>
        </div>
	)
}

function RecentSubscribers({subscribers}) {
    const [visitedIds, setVisitedIds] = useState([]);
    return (
        <>
            <h1>Recent Subscribers</h1>
            <div>
                {subscribers?.length && subscribers.map((subscriber) => {
                    const alreadyVisited = visitedIds.includes(subscriber.userID);
                    let source;
                    if (subscriber.referralQueryParams?.includes('fbclid')) {
                        source = 'Facebook Ad';
                    } else if (subscriber.referralQueryParams?.includes('gclid')) {
                        source = 'Google Ad';
                    } else if (subscriber.referralURL?.includes('nichescraper')) {
                        source = 'Niche Scraper';
                    } else if (subscriber.affiliateRef) {
                        source = subscriber.affiliateRef;
                    } else if (subscriber.referralURL?.includes('google')) {
                        source = 'Google Search';
                    } else if (subscriber.referralURL?.includes('facebook')) {
                        source = 'Facebook Social';
                    }
                    return (
                        <div key={subscriber.id}>
                            <div className={classes.created}>{subscriber.created}</div>
                            <a href={`/admin/events/user/${subscriber.userID}`} target="_blank" onClick={() => {setVisitedIds([...visitedIds, subscriber.userID])}}>
                            <Paper className={clsx(classes.paper, alreadyVisited ? classes.visited : null)}>
                                    <div>
                                        <div><b>User:</b> {subscriber.email} ({subscriber.userID}) </div>
                                        <div className={classes.subID}>Plan: ${subscriber.amount} {subscriber.name}</div>
                                    </div>
                                    {source && <div><b>Source:</b> {source}</div>}
                                </Paper>
                            </a>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

function Events({events}) {
    const [visitedIds, setVisitedIds] = useState([]);
    return (
        <>
            <h1>Events</h1>
            <div>
                {events?.length && events.map((event) => {
                    const alreadyVisited = visitedIds.includes(event.userID);
                    return (
                        <div key={event.userID}>
                            <div className={classes.created}>{event.lastEvent}</div>
                            <a href={`/admin/events/user/${event.userID}`} target="_blank" onClick={() => {setVisitedIds([...visitedIds, event.userID])}}>
                                <Paper className={clsx(classes.paper, alreadyVisited ? classes.visited : null)}>
                                    <div>
                                        <div><b>UserID:</b> {event.userID}</div>
                                        <div className={classes.subID}>{event.subscriptionID}</div>
                                    </div>
                                    <div><b>Events:</b> {event.eventCount}</div>
                                </Paper>
                            </a>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

function AffiliateStats({affiliateStats}) {
    return (
        <>
            <h1>Affiliate Stats</h1>
            <Paper className={classes.paper} style={{flexDirection:"column"}}>
                {affiliateStats && affiliateStats.map((row) => {
                    return (
                        <div key={row.affiliateID}>
                            ${formatNum(row.unpaid)} - {row.affiliateID}<br />
                        </div>
                    )
                })}
            </Paper>
        </>
    );
}

function QuickLinks() {
    return (
        <>
            <h1>Quick Links</h1>
            <Paper className={clsx(classes.paper, classes.quickLinks)}>
                <a href='/admin/affiliates'>Affiliates</a>
            </Paper>
        </>
    )
}

function StatsSection({revenueStats, recentAccounts, paymentSum}) {
    return (
        <>
            <h1>Stats</h1>
            <Paper className={classes.paper}>
                {revenueStats ? (
                    <>
                        Subscribers: {revenueStats.subscriberCount}<br />
                        MRR: ${formatNum(revenueStats.MRR)}<br />
                        Payments Received: ${formatNum(paymentSum)}<br />
                    </>
                ) : (null)}
                Accounts last 24 hours: {recentAccounts}
            </Paper>
        </>
    )
}

function UserSearch() {
    const [input, setInput] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onInputChange = (e) => {
        setInput(e.target.value.trim());
    }

    const handleSearch = () => {
        if (!input) return;

        setLoading(true);
        setError(null);
        
        if (!isNaN(input)) {
            window.location.href = `/admin/events/user/${input}`;
            return;
        }

        FetchWrapper.get(`/api/admin/userSearch?email=${input}`)
        .then(response => {
            const user = response.user;
            if (!user) return setError("User not found!");
            window.location.href = `/admin/events/user/${user.id}`;
        })
        .catch(err => {
            setError(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    return (
        <>
            <h1>User Search</h1>
            <Paper className={classes.userSearchRow}>
                <TextField
                    className={classes.userSearch}
                    id="input" 
                    label="Search for user" 
                    placeholder="Email or user ID"
                    value={input || ""}
                    variant="outlined"
                    onChange={onInputChange}
                    error={!!error}
                    helperText={error}
                    disabled={loading} />
                <Button onClick={handleSearch} disabled={!input} loading={loading}>Search</Button>
            </Paper>
        </>
    );
}

function GrowthTable({growthTable}) {
    let periodTotalFlow = growthTable && growthTable.reduce((acc, row) => (acc + row.flow), 0);
    return (
        <>
            <h1>Growth Table</h1>
            <Paper className={classes.paper} style={{flexDirection:"column"}}>
                <table className={classes.growthTable}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Conversion</th>
                            <th>Upgraded</th>
                            <th>Canceled</th>
                            <th>Past Due</th>
                            <th>Net</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {growthTable && growthTable.map((row) => {
                            periodTotalFlow -= row.flow
                            const conversion = formatNum(row.upgraded / row.registers * 100);
                            return (
                                <tr key={row.time}>
                                    <td>{row.time}</td>
                                    <td>{conversion}%</td>
                                    <td>{row.upgraded} (${formatNum(row.inflow)})</td>
                                    <td>{row.canceled} (${formatNum(row.outflow)})</td>
                                    <td>{row.pastDue} (${formatNum(row.outflow)})</td>
                                    <td>{row.net} (${formatNum(row.flow)})</td>
                                    <td>${formatNum(periodTotalFlow)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Paper>
        </>
    );
}

export default withAuthProtection(AdminHome);
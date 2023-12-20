import { useContext } from 'react'
import Router from 'next/router';
import UserContext from '~/src/Components/UserContext';
import ContentContainer from "~/src/Components/Common/ContentContainer";

import paths from '~/src/paths';
import Page from "~/src/Components/Common/Page";
import NavBar from "~/src/Components/Common/NavBar";
import classes from "./index.module.css";

/* Share wrapper for login / sign up page */

export default function AuthPage({children, pageTitle, headerTitle, showNavButtons=true}) {
    const {user} = useContext(UserContext);

    if (user) {
        Router.replace(paths.dashboard);
        return null;
    }

    return (
        <Page title={pageTitle}>
            <div className={classes.bg}>
                <ContentContainer className={classes.contentContainer}>
                    <NavBar light links={{
                        common: [], 
                        loggedOutLinks: showNavButtons ? [
                            {href: paths.login, text: "Login", onClick: null},
                            {href: paths.register, text: "Sign Up", onClick: null, pill: true}
                        ] : [], 
                        loggedInLinks: []
                    }} />

                    <div className={classes.contentBody}>
                        {headerTitle && (<h1>{headerTitle}</h1>)}
                        {children}
                    </div>
                </ContentContainer>
            </div>
        </Page>
    )
}
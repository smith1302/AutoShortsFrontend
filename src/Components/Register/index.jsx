import React from 'react';
import classes from "./index.module.css";
import { useRouter } from "next/router";
import paths from "~/src/paths";
import AuthPage from "~/src/Components/Common/AuthPage";
import RegisterForm from '~/src/Components/Common/RegisterForm';

export default function Register() {
    const router = useRouter();

    const handleRegisterSuccess = (user) => {
        const { destination } = router.query;
        if (destination) {
            window.location = destination;
        } else {
            window.location = paths.dashboard;
        }
    }

    return (
        <AuthPage pageTitle="Register" headerTitle="">
            <div className={classes.card}>
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} useAdordnments />
            </div>
            <div className={classes.footnote}>Already registered? <a href={paths.login}>Login here</a></div>
        </AuthPage>
    )
}
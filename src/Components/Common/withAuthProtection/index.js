import { useContext } from 'react';
import Router from 'next/router';
import paths from '~/src/paths';
import UserContext from '~/src/Components/UserContext';

export default function AuthProtector(AuthContent, redirectPath = paths.unauthorizedAccess) {

    return function (props) {
        const {user} = useContext(UserContext);

        if (!user) {
            Router.replace(redirectPath);
            return null;
        }

        return <AuthContent {...props} />
    }
}
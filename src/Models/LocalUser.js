import { RegisterSource } from '~/src/enums';

export default class LocalUser {

    /* 99% of the time we would pass in the user from UserContext (rather than localStorage), since UserContext is state based and doesn't need page refresh */

    static toJSON(id, email, token, source) {
        return {id, email, token, source};
    }

    static save(json) {
        if (!process.browser) return null;
        localStorage.setItem('user', JSON.stringify(json));
    }

    static current() {
        if (!process.browser) return null;
        return JSON.parse(localStorage.getItem('user')) || null;
    }
}
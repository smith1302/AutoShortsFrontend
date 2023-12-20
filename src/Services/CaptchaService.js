import BotCheck from '~/src/Models/DBModels/BotCheck';

export default {
    setCaptchaDialogSubscriber,
    showCaptchaDialog,
    needsCaptchaVerification
};

/* === Client Helpers === */

let captchaSubscriber = null;
function setCaptchaDialogSubscriber(subscriber) {
    captchaSubscriber = subscriber;
}

function showCaptchaDialog() {
    captchaSubscriber.showCaptchaDialog();
}

/* === Server Helpers === */

async function needsCaptchaVerification(userID) {
    let needsCaptchaVerification = false;
    try {
        await global.captchaRateLimit.consume(userID);
    } catch (err) {
        const hasPassedCaptchaRecently = await hasRecentCaptchaVerification(userID);
        if (hasPassedCaptchaRecently) {
            global.captchaRateLimit.delete(userID);
        }
        needsCaptchaVerification = !hasPassedCaptchaRecently;
    }
    return needsCaptchaVerification;
}

async function hasRecentCaptchaVerification(userID) {
    const verificationHistory = await BotCheck.awaitableQuery(`
            SELECT * FROM ${BotCheck.tableName()}
            WHERE userID = ?
                AND verifiedTS > NOW() - INTERVAL 1 HOUR
                AND verified = 1
        `, [userID]);

    return verificationHistory?.length > 0;
}
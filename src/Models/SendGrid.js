import globals from '~/src/globals.js';
import jwt from 'jsonwebtoken';
import User from '~/src/Models/DBModels/User';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_KEY);

export default class SendGrid {
    constructor({to, subject, text, html = null, from = `support@autoshorts.ai`, senderName = 'AutoShorts', replyTo = `autoshortsai@gmail.com`, templateID = null}) {
        this.to = to;
        this.subject = subject;
        this.text = text;
        this.html = html;
        this.replyTo = replyTo;
        this.from = from;
        this.senderName = senderName;
        this.templateID = templateID;
    }

    async send() {
        try {
            if (!process.env.SEND_GRID_KEY || !this.to) {
                return;
            }

            if (this.templateID) {
                const config = { 
                    from: {
                        email: this.from, 
                        name: this.senderName
                    },
                    to: this.to, 
                    replyTo: this.replyTo,
                    templateId: this.templateID,
                    subject: this.subject,
                    asm: {
                        group_id: 26584, /* This is for unsubscription url (https://mc.sendgrid.com/unsubscribe-groups) */
                        groups_to_display: [26584]
                    }
                };
                return sgMail.send(config);
            }

            const config = { 
                from: {
                    email: this.from, 
                    name: this.senderName
                }, 
                to: this.to, 
                subject: this.subject, 
                text: this.text,
                replyTo: this.replyTo
            };
            if (this.html) {
                config.html = this.html;
            }
            return sgMail.send(config);
        } catch (error) {
            console.error("Error in sendGrid send():", error);
        }
        return null;
    }

    /* ======== TEMPLATES =========== */

    static register(email) {
        return new SendGrid({
            to: email, 
            subject: `Welcome to ${globals.appName}`,
            text: `This email is a confirmation that your account has been registered successfully. Enjoy!`,
            html: `This email is a confirmation that your account has been registered successfully. Enjoy!<br />
            https://${globals.displayURL}<br />
            <br />
            Regards,<br />
            Eric Smith<br />
            ${globals.appNameFull}`,
        });
    }

    static cancel(email) {
        return new SendGrid({
            to: email, 
            subject: `Your subscription has been canceled`,
            text: `This email is a confirmation that your ${globals.appNameFull} subscription has been canceled. Thank you for using our service!`,
            html: `This email is a confirmation that your ${globals.appNameFull} subscription has been canceled. Thank you for using our service!<br />
            <br />
            Regards,<br />
            Eric Smith<br />
            ${globals.appNameFull}`,
        });
    }

    static authCode(email, code) {
        return new SendGrid({
            to: email, 
            subject: `${globals.appName} Confirmation Code`,
            text: `Here is your 4 digit confirmation code. Please use this to register: ${code}`,
            html: `Here is your 4 digit confirmation code. Please use this to register: <br />
            <h1>${code}</h1>
            Regards,<br />
            ${globals.appNameFull}`,
        });
    }

    static resetPassword(email, resetURL) {
        return new SendGrid({
            to: email, 
            subject: `${globals.appName} Password Reset`,
            text: `Please use this secure link to reset your password: ${resetURL}`,
            html: `Please use this secure link to reset your password: <br />
            <a href=${resetURL}>${resetURL}</a><br />
            <br />
            Regards,<br />
            ${globals.appNameFull}`,
        });
    }

    static discountV1(email) {
        return new SendGrid({
            to: email, 
            subject: `Thanks for beta testing ${globals.appName}`,
            templateID: 'd-57c8b7227bf4499db90ceb941e59e2c9 '
        });
    }

    static devNotification({name, accountEmail = "N/A"}) {
        return new SendGrid({
            to: globals.contactEmail, 
            subject: `Event | ${name}`,
            text: `Account: ${accountEmail}.`,
            html: `Account: ${accountEmail}.`
        });
    }
}
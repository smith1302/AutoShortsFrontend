import disposable from 'disposable-email';
import CrawleraFetch from '~/src/Services/CrawleraFetch';
import cheerio from 'cheerio';

import BlacklistEmailProvider from '~/src/Models/DBModels/BlacklistEmailProvider';
import User from '~/src/Models/DBModels/User';

export default class DisposableEmailChecker {

    static async isDisposableEmail(email) {
        try {
            if (this.isTrustedEmailHost(email)) {
                return false;
            }

            if (await this.existsInBlacklist(email) || !disposable.validate(email)) {
                return true;
            }

            if (!(await this.isValidBasedOnDBHistory(email))) {
                return true;
            }

            const fetchResult = await CrawleraFetch.fetch(`https://verifymail.io/email/${email}`);
            const response = fetchResult.response;
            const $ = cheerio.load(response.body);
            const description = $('meta[name="description"]').attr('content');
            if (description.includes('should be blocked') || description.includes('is a disposable address')) {
                return true;
            }
        } catch (err) {}

        return false;
    }

    static async existsInBlacklist(email) {
        const emailHost = this.getHost(email);
        if (!emailHost) return false;
        
        const matches = await BlacklistEmailProvider.query(`SELECT * FROM BlacklistEmailProvider WHERE provider LIKE ?`, [`%${emailHost}%`]);
        return matches && matches.length > 0;
    }

    /* Look at our user history for potential misuse */
    static async isValidBasedOnDBHistory(email) {
        const emailHost = this.getHost(email);
        if (!emailHost) return false;

        try {
            // 1. Check if there are too many users with the same host in the last month
            const usersWithSameHost = await User.query(`SELECT * FROM User WHERE substring_index(email, '@', -1) = ? AND created > NOW() - INTERVAL 1 MONTH`, [emailHost]);
            const passesThreshold = !usersWithSameHost || usersWithSameHost.length <= 5;
            if (passesThreshold) return true;
            
            // 2. Ping email host domain to see if it returns a valid response.
            const response = await fetch(`https://${emailHost}`);
            const isValidHost = response && response.status === 200;
            
            if (isValidHost) return true;
        } catch (err) {
        }

        console.log(`Disposable email host: ${emailHost}`);
        return false;
    }

    static isTrustedEmailHost(email) {
        const emailHost = this.getHost(email);
        if (!emailHost) return false;

        const trustedHosts = [
            'gmail.com', 
            'icloud.com', 
            'yahoo.com',
            'hotmail.com',
            'aol.com',
            'outlook.com',
            'mail.com',
            'me.com',
            'mac.com',
            'msn.com',
            'live.com',
            'comcast.net',
            'verizon.net',
            'att.net',
            'sbcglobal.net',
            'bellsouth.net',
            'charter.net',
            'cox.net',
            'earthlink.net',
            'juno.com',
            'btinternet.com',
            'virginmedia.com',
            'blueyonder.co.uk',
            'freeserve.co.uk',
            'ntlworld.com',
            'o2.co.uk',
            'orange.net',
            'sky.com',
            'talktalk.co.uk',
            'tiscali.co.uk',
            'virgin.net',
            'wanadoo.co.uk',
            'bt.com',
            'sina.com',
            'qq.com',
            'naver.com',
            'hanmail.net',
            'daum.net',
            'nate.com',
            'yahoo.co.jp',
            'yahoo.co.kr',
            'yahoo.co.id',
            'yahoo.co.in',
            'yahoo.com.sg',
            'yahoo.com.au',
            '163.com',
            '126.com',
            'yeah.net',
            '21cn.com',
            'aliyun.com',
            'foxmail.com',
            'hotmail.co.uk',
            'live.co.uk',
            'me.com',
            'msn.com',
            'live.com',
            'china.com'
         ];
        return trustedHosts.includes(emailHost) || emailHost.includes('.edu');
    }

    static getHost(email) {
        const split = email.split('@');
        if (split.length < 2) return null;
        return split[1];
    }

}
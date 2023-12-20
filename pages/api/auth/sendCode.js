import md5 from 'md5';
import ApiHandler from '~/src/Services/ApiHandler';
import User from '~/src/Models/DBModels/User';
import AuthConfirmCode from '~/src/Models/DBModels/AuthConfirmCode';
import SendGrid from '~/src/Models/SendGrid';
import AuthHelper from '~/src/Models/AuthHelper';
import DisposableEmailChecker from '~/src/Models/DisposableEmailChecker';
import { TooManyAccountsError } from '~/src/errorMessages';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { email, password } = req.body;
    
    if (!email) throw new Error("Missing email");
    if (!AuthHelper.isValidEmail(email)) throw new Error(`Invalid email format: ${email}`);

    const hashedPassword = md5(password);
    if (['efd6f45f7fe2cf3a2f0bd3812b201fc0', '836ea8abca4ac3d7a5a2b8a6e521d7d8', '17c2ab550b98e72ad135363e574a815e', 'b5e664a6029bb8c8aee9bcd469a97ddf'].includes(hashedPassword) || isUsingDotHack(email)) {
        throw new Error(`Registrations are currently closed (${email})`);
    }

    const isDisposableEmail = await DisposableEmailChecker.isDisposableEmail(email);
    if (isDisposableEmail) throw new Error("Disposable emails not permitted.");

    const existingUser = await User.findOne({where: {email: email}});
    if (existingUser) throw new Error("An account with this email exists.");

    // Check if this user has created an account before by matching their IP address.
    const IP = req.IP || '';
    const matchedIPUsers = await User.usersWithRecentMatchingIP({IP});
    const tooManyAccounts = matchedIPUsers.length >= 2;
    if (tooManyAccounts) {
        console.log("Too many accounts for IP: ", IP);
        throw new Error(TooManyAccountsError);
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    await AuthConfirmCode.create({email, code});
    await SendGrid.authCode(email, code).send();

    return res.status(200).json({success: true});
});

// Check if user is creating a bunch of gmail account variations
const isUsingDotHack = (email) => {
    if (!email.includes("gmail")) {
        return false;
    }
    const dotCount = email.split('.').length - 1;
    return dotCount >= 3;
}
import BasicPage from '~/src/Components/Common/BasicPage';
import globals from '~/src/globals';
import paths from '~/src/paths';

import classes from './index.module.css'

export default function Terms() {
    return (
        <BasicPage title="Terms & Conditions" heroTitle="Terms & Conditions" heroSubtitle="Last updated Jan 18th, 2022">
            <div className={classes.body}>
                <p>Welcome to {globals.appName}!</p>
                <p>These terms and conditions outline the rules and regulations for the use of {globals.appName}'s Website, located at {globals.fullURL}.</p>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use {globals.appName} if you do not agree to take all of the terms and conditions stated on this page.</p>

                <p>Images uploaded to {globals.appName} are not added to the {globals.appName} database nor are they made accessible to any other users. Copyright for all images submitted to {globals.appName} remains with the original owner/author.</p>
                <p>{globals.appName} search results link to third party websites that are not owned or controlled by {globals.appName}. {globals.appName} assumes no responsibility for the content, privacy policies or practices of any third party websites.</p>

                <h3>Disclaimer of Any Warranty</h3>
                <p>WE NOT REPRESENT OR WARRANT THAT {globals.appName} IS FREE OF INACCURACIES, ERRORS, BUGS, OR INTERRUPTIONS, OR IS RELIABLE, ACCURATE, COMPLETE, OR OTHERWISE VALID.</p>
                <p>{globals.appName} IS PROVIDED "AS IS" WITH NO WARRANTY, EXPRESS OR IMPLIED, OF ANY KIND AND WE EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES AND CONDITIONS, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AVAILABILITY, SECURITY, TITLE AND/OR NON-INFRINGEMENT.</p>
                <p>YOUR USE OF {globals.appName} IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE THAT RESULTS FROM THE USE OF {globals.appName} INCLUDING, BUT NOT LIMITED TO, ANY DAMAGE TO YOUR COMPUTER SYSTEM OR LOSS OF DATA.</p>

                <h3>Limitation of Liability</h3>
                <p>WE SHALL NOT, UNDER ANY CIRCUMSTANCES, BE LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR EXEMPLARY DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OF {globals.appName}, WHETHER BASED ON BREACH OF CONTRACT, BREACH OF WARRANTY, TORT (INCLUDING NEGLIGENCE, PRODUCT LIABILITY OR OTHERWISE), OR ANY OTHER PECUNIARY LOSS, WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OR ALL OF THE ABOVE EXCLUSIONS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.</p>

                <h3><strong>Cookies</strong></h3>
                <p>We employ the use of cookies. By accessing {globals.appName}, you agreed to use cookies in agreement with the {globals.appName}'s Privacy Policy.</p>
                <p>Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>


                <p>No use of {globals.appName}'s logo or other artwork will be allowed for linking absent a trademark license agreement.</p>
                <h3><strong>iFrames</strong></h3>

                <p>Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>
                <h3><strong>Content Liability</strong></h3>

                <p>We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
                <h3><strong>Reservation of Rights</strong></h3>

                <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>
                <h3><strong>Removal of links from our website</strong></h3>

                <p>If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.</p>
                <p>We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.</p>
                <h3><strong>Disclaimer</strong></h3>

                <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
                <ul>
                    <li>limit or exclude our or your liability for death or personal injury;</li>
                    <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                    <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                    <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                </ul>

                <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>
                <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
            </div>
        </BasicPage>
    );
}
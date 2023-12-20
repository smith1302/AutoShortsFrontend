import ApiHandler from '~/src/Services/ApiHandler';
import ProxyFetch from '~/src/Services/ProxyFetch';
import cheerio from 'cheerio';
import ImportAPIResponse from '~/src/Models/ImportAPIResponse';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const url = verifyAndFormatURL(req.query?.url);
    const product = await getProductInfo(url);

    res.status(200).json(ImportAPIResponse(product.title, product.description));
});

function sampleProduct() {
    return {
        "id": 11125861575,
        "title": "10-pcs Multi-functional Magic Sponge Eraser",
        "description": "<h1>Intensive cleaning by sponge</h1>\n<p>The use of synthetic sponges for cleaning has been around for so long, it can be said that it is one of man's greatest inventions. And it is even until today. Here's a more impressive type of sponge that will free you from the use of detergents. <br><br>These Magic Sponge Erasers deeply cleans different surfaces from ceramic fixtures to grained leather goods, to wood, and even plastic toys! Using detergents, especially ones with a more harmful formulation will be a thing of the past. All you'll ever need is water to activate the cleaning power of this sponge. <br><br><strong>Reminders:</strong> Before using, wash with hot water and soap first. Apply a small amount of oil or butter. Use a soft brush if any debris clung to it. Avoid rubbing it too hard on the surface. Let it alone to dry or with the use of a paper towel. Avoid contact with fire.</p>\n<h5>Details</h5>\n<p><span><strong>Material:</strong> Sponge <br><strong>Color:</strong> White <br><strong>Package Include:</strong>10-pcs Multi-functional Magic Sponge Eraser<br></span><span><strong>Size:</strong> 100x60x20mm <br></span></p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>\n<p align=\"center\"> </p>",
        "url": "https://dudegadgets.com/products/10-pcs-multi-functional-magic-sponge-eraser"
    }
}

function verifyAndFormatURL(url) {
    if (!url) {
        throw new Error("Missing url");
    }

    url = url.trim();

    if (!url.includes("http")) {
        url = `https://${url}`;
    }

    if (!url.includes(".")) {
        throw new Error("The URL provided is invalid");
    }

    if (!url.match(/.+[amazon].*\/[a-zA-Z0-9]+/)) {
        throw new Error("Invalid URL format. Is this a product page?");
    }

    try {
        new URL(url);
    } catch (err) {
        throw new Error("The URL provided is invalid");
    }

    return url;
}

async function getProductInfo(url) {
    try {
        const urlModel = new URL(url);
        // Essentially the same URL without get params
        const scrapeURL = `${urlModel.origin}/${urlModel.pathname}`;
        const fetchResult = await ProxyFetch.fetchCrawlera(scrapeURL);
        const response = fetchResult.response;
        const text = response.body;
        const $ = cheerio.load(text);
        let description = $("#productDescription")?.text();
        if (!description) {
            $("#feature-bullets li").each(function(i, item){
                const bulletText = $(this).text().trim();
                const toAdd = (i == 0 ? '' : ',\n') + `"${bulletText}"`;
                const lengthAfterAdd = description.length + toAdd.length;
                if (lengthAfterAdd > 500) return false;
                description += toAdd;
            });
        }
        if (!description) {
            description = $("#featurebullets_feature_div")?.text();
        }
        if (description) {
            description = description.trim();
        }
        const title = $("#productTitle").text().trim();

        return {
            description,
            title
        }
    } catch (err) {
        throw new Error(`Could not fetch product data for ${url}. Please enter it manually.`);
    }
}
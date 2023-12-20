import ApiHandler from '~/src/Services/ApiHandler';
import ProxyFetch from '~/src/Services/ProxyFetch';
import ImportAPIResponse from '~/src/Models/ImportAPIResponse';
import cheerio from 'cheerio';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const product = await getProduct(req.query?.url);
    if (!product) {
        throw new Error("Unable to fetch product. Is this a WooCommerce product page?");
    }
    res.status(200).json(ImportAPIResponse(product.title, product.description));
});

async function fetchCheerio(url) {
    const fetchResult = await ProxyFetch.fetch(url);
    const text = await fetchResult.text();
    return cheerio.load(text);
}

async function getProduct(url) {
    let product = null;

    try {
        const urlModel = new URL(url);
    } catch (err) {
        throw new Error("The URL provided is invalid");
    }

    try {
        const $ = await fetchCheerio(url);

        let description = $(".woocommerce-product-details__short-description")?.text()?.trim();
        if (!description) {
            description = $(".elementor-accordion-item .elementor-tab-content")?.first()?.text()?.trim();
        }
        if (!description) throw new Error("No description found");

        const title = $(".product_title")?.text()?.trim();
        if (!title) throw new Error("No title found");

        product = {description, title};

    } catch (error) {
        console.log(`Woocommerce error: ${url}`);
    }
    return product;
}
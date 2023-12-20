import ApiHandler from '~/src/Services/ApiHandler';
import axios from 'axios';
import TopClient from '~/src/Models/TopClient'
import ImportAPIResponse from '~/src/Models/ImportAPIResponse';

export default ApiHandler(false, async (req, res) => {
    if (req.method != 'GET') {
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const url = verifyAndFormatURL(req.query?.url);
    if (!url?.length) throw new Error("Invalid URL format");

    const data = await getAliExpressDataV1(url);
    const name = getAliExpressNameV1(data, url);
    const description = getAliExpressDescriptionV1(data);

    res.status(200).json(ImportAPIResponse(name, description));
});

async function getAliExpressDataV1(url) {
    const productID = extractProductID(url);

    const fetchAPI = `https://aliexpress-datahub.p.rapidapi.com/item_detail?itemId=${productID}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
        }
    };

    let data;
    try {
        const response = await fetch(fetchAPI, options);
        data = await response.json();
    } catch (error) {
    }
    if (!data || !data.result) {
        throw new Error(`Could not fetch AliExpress product.`);
    }
    return data;
}

function getAliExpressNameV1(data, url) {
    let name = null;
    try {
        name = data.result.item.title;
    } catch (err) {}

    if (!name) {
        console.log(url);
        throw new Error("Unable to fetch AliExpress name.");
    }
    return name;
}

function getAliExpressDescriptionV1(data) {
    try {

        const arr = [];
        const skipList = ["Origin", "Brand Name", "Model Number", "is_customized"];

        for (const property of data.result.item.properties.list) {
            if (skipList.includes(property.name)) continue;
            arr.push(`${property.name}: ${property.value}`);
        }

        const description = getAliExpressDescriptionFromProperties(arr);
        if (!description) throw new Error();

        return `Product Specifications:\n${description}`;
    } catch (err) {
        throw new Error("Unable to fetch AliExpress description.");
    }
}

/* Other helpers */

function getAliExpressDescriptionFromProperties(properties) {
    const maxDescriptionLength = 500;
    let description = "";
    try {
        for (const [i, word] of properties.entries()) {
            const toAdd = (i == 0 ? '' : ',\n') + `"${word}"`;
            const lengthAfterAdd = description.length + toAdd.length;
            if (lengthAfterAdd > maxDescriptionLength) break;
            description += toAdd;
        }
    } catch (err) {
    }
    return description;
}

function extractProductID(productURL) {
	let possibleID = extractSubstringBetweenStrings(productURL, '/item/', '.html');
    if (!possibleID) {
        throw new Error(`Could not get productID. Unexpected URL format: ${productURL}`);
    }

    if (possibleID.includes('/')) {
        possibleID = extractSubstringBetweenStrings(possibleID, '/', '');
    }

    if (!possibleID || isNaN(possibleID)) {
        throw new Error(`Could not get productID. Unexpected URL format: ${productURL}`);
    }

    return possibleID;
}

function extractSubstringBetweenStrings(str, startString, endString) {
    const start = str.lastIndexOf(startString) + startString.length
	const end = str.lastIndexOf(endString);
	if (start == -1 || end == -1) return null;

	return str.substring(start, end);
}

function verifyAndFormatURL(url) {
    if (!url) {
        throw new Error("Missing url");
    }

    if (!url.includes("http")) {
        url = `https://${url}`;
    }

    if (!url.includes(".")) {
        throw new Error("The URL provided is invalid");
    }

    if (!isAliexpressURL(url)) {
        throw new Error(`The URL provided is not an AliExpress product page: ${url}`);
    }

    try {
        new URL(url);
    } catch (err) {
        throw new Error("The URL provided is invalid");
    }

    return url;
}

function isAliexpressURL(url) {
    return new RegExp(/aliexpress.*item/g).test(url);
}
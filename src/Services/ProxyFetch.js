const request = require('postman-request');
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');

class ProxyFetch {

    static async fetch(endpointURL, headers = null, timeout = 30000) {
        const options = url.parse('http://aspsfcbo-rotate:lnz9c2jxg2f6@p.webshare.io:80');
        options.headers = headers;
        const agent = new HttpsProxyAgent(options);
        
        const fetchPromise = fetch(endpointURL, { agent: agent });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout));
        
        return Promise.race([fetchPromise, timeoutPromise]);
    }

    static async fetchCrawlera(URL) {
        
        var proxyRequest = request.defaults({
            'proxy': 'http://0213844f43864970b61b6230e4b28ccc:@proxy.crawlera.com:8010'
        });
        
        var options = {
            url: URL,
            ca: fs.readFileSync("./crawlera-ca.crt"),
            requestCert: true,
            rejectUnauthorized: true,
        };
        
        return new Promise(function(resolve, reject) {
            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve({success: true, response: response});
                } else{
                    reject(error);
                }
            }
            proxyRequest(options, callback);
        });
    }
}

module.exports = ProxyFetch;
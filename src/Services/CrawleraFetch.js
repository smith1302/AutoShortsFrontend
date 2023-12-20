const request = require('postman-request');
const fs = require('fs');

class CrawleraFetch {

    static async fetch(URL) {
        
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

    static async post(url, headers = {}, body = "") {
        
        var proxyRequest = request.defaults({
            'proxy': 'http://0213844f43864970b61b6230e4b28ccc:@proxy.crawlera.com:8010'
        });
        
        var options = {
            url: url,
            ca: fs.readFileSync("./crawlera-ca.crt"),
            requestCert: true,
            rejectUnauthorized: true,
            method: "POST",
            headers: headers,
            body: body,
        };
        
        return new Promise(function(resolve, reject) {
            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve({success: true, response: response});
                } else {
                    reject(error);
                }
            }
            proxyRequest.post(options, callback);
        });
    }

    static async alifetch(URL) {
        const opts = {
            headers: {
                'Referer': 'https://m.aliexpress.com',
                'X-Crawlera-Profile': 'mobile',
                'AMP-Same-Origin': 'true',
                'Cookie': '',
                'Accept': 'application/json',
            }
        }

        var proxyRequest = request.defaults({
            'proxy': 'http://0213844f43864970b61b6230e4b28ccc:@proxy.crawlera.com:8010'
        });

        var options = {
            url: URL,
            ca: fs.readFileSync("./crawlera-ca.crt"),
            requestCert: true,
            rejectUnauthorized: true,
            headers: {
                'Referer': 'https://m.aliexpress.com',
                'X-Crawlera-Profile': 'mobile',
                'AMP-Same-Origin': 'true',
                'Cookie': '',
                'Accept': 'application/json',
            }
        };


        return new Promise(function (resolve, reject) {
            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        const parsedBody = JSON.parse(body);
                        resolve({ success: true, data: parsedBody });
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(error);
                }
            }
            proxyRequest(options, callback);
        });
    }
}

module.exports = CrawleraFetch;
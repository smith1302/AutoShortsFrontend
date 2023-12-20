export default class CountryLookup {
    
    static async getCountry(ip) {
        try {
            if (!ip) throw new Error('IP is required');
            const response = await fetch(`https://ipapi.co/${ip}/country_code/`);
            const countryCode = await response.text();
            if (!countryCode || countryCode == 'Undefined' || countryCode.length > 3) {
                throw new Error('Country code could not be determined');
            }

            return countryCode;
        } catch (err) {
            return null;
        }
    }
}
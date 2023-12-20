const valueToCurrencyString = (value, currency = "USD", decimals = 2) => {
    const formatter = new Intl.NumberFormat(currencyToLocaleString(currency), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals
    });
    return formatter.format(value);
}

const currencyToLocaleString = (currency) => {
    if (currencyToLocaleStringMap.hasOwnProperty(currency)) {
        return currencyToLocaleStringMap[currency];
    }
    return currencyToLocaleStringMap["USD"];
}

const currencyToLocaleStringMap = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    AUD: "en-AU",
    CAD: "en-CA",
    CHF: "de-CH",
    CNY: "zh-CN",
    HKD: "zh-HK",
    NZD: "en-NZ",
    SEK: "sv-SE",
    SGD: "en-SG",
    KRW: "ko-KR",
    TRY: "tr-TR",
    RUB: "ru-RU",
    INR: "en-IN",
    BRL: "pt-BR",
    ZAR: "en-ZA",
    MXN: "es-MX",
    ILS: "he-IL",
    PHP: "en-PH",
    PLN: "pl-PL",
    TWD: "zh-TW",
    THB: "th-TH",
    IDR: "id-ID",
    HUF: "hu-HU",
    CZK: "cs-CZ",
    DKK: "da-DK",
    NOK: "nb-NO",
    MYR: "ms-MY",
    RON: "ro-RO",
    SAR: "ar-SA"
}


export {
    valueToCurrencyString,
    currencyToLocaleString
}
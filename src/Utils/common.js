const formatNum = (num) => parseFloat(num).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export {
    formatNum,
    sleep,
}
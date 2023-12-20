import NodeCache from 'node-cache';

if (!global.cache) {
    global.cache =  new NodeCache({ stdTTL: 60 * 30 });
}

module.exports = global.cache;
var CACHE_DURATION = 1000 * 60 * 30;
var cache = {};
function getCached(name, regenerator, cb) {
    if (name in cache && cache[name].expires > Date.now()) {
        console.log('Cache hit on ' + name);
        setImmediate(cb, null, cache[name].content);
        return;
    }

    regenerator(function(err, data) {
        if (err) {
            setImmediate(cb, err);
            return;
        }
        var fresh = cache[name] = {
            content: data,
            expires: Date.now() + CACHE_DURATION,
        };
        console.log('Cached a new copy of ' + name);
        setImmediate(cb, null, fresh.content);
    });

}

exports.getCached = getCached;

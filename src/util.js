var Promise = require('promise');

exports.eachPromise = function eachPromise(obj) {
    var data = {};
    var started = 0;
    var completed = 0;

    return new Promise(function(resolve, reject) {
        for (var i in obj) {
            started++;
            if (!obj.hasOwnProperty(i)) continue;

            obj[i].then(function(name, result) {
                data[name] = result;
                completed++;

                if (completed === started) {
                    resolve(data);
                }
            }.bind(null, i), reject);
        }
    });
};

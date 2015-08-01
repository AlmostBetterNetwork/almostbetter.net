var Promise = require('promise');
var superagent = require('superagent');

var cache = require('./cache');


exports.getFeed = function getFeed(channelID, maxResults) {
    maxResults = maxResults || 5;
    console.log('Fetching YouTube feed for ' + channelID);

    return new Promise(function(resolve, reject) {
        cache.getCached(
            'youtube_' + channelID,
            function(cb) {
                superagent.get('https://www.googleapis.com/youtube/v3/search')
                    .query({part: 'snippet'})
                    .query({order: 'date'})
                    .query({type: 'video'})
                    .query({channelId: channelID})
                    .query({key: process.env.YOUTUBE_SECRET})
                    .query({maxResults: maxResults})
                    .end(function(err, res) {
                        if (err) {
                            cb(err);
                            return;
                        }

                        cb(null, res.body);
                    });
            },
            function(err, body) {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                console.log('Fetched YouTube feed for ' + channelID);
                resolve(body);
            }
        );
    });
};

var moment = require('moment');
var Promise = require('promise');
var sanitizeHTML = require('sanitize-html');
var superagent = require('superagent');
var xml2js = require('xml2js');

var cache = require('./cache');


exports.getRSS = function getRSS(url, id) {
    console.log('Starting lookup of ' + url);
    return new Promise(function(resolve, reject) {
        cache.getCached(
            url,
            function(cb) {
                console.log('Fetching ' + url);
                superagent.get(url)
                    .set('User-Agent', 'almostbetter.net/1.0.0')
                    .buffer()
                    .end(function(err, res) {
                        if (err) {
                            cb(err);
                            return;
                        }

                        console.log('Fetched ' + url + ', parsing');
                        xml2js.parseString(res.text, {trim: true}, function(err, body) {
                            if (err) {
                                cb(err);
                                return;
                            }

                            cb(null, body);

                        });

                    });
            },
            function(err, body) {
                if (err) {
                    console.error('Could not fetch ' + url + ': ' + err.toString());
                    reject(err);
                } else {
                    console.log('Fetch of ' + url + ' complete');
                    resolve(processFeed(body, id));
                }
            }
        );
    });
};

function processFeed(feed, id) {
    return feed.rss.channel[0].item.map(function(i) {
        i.__id = id;

        i.description[0] = sanitizeHTML(
            i.description[0],
            {
                allowedTags: ['p', 'a', 'img', 'br', 'ul', 'li'],
                allowedAttributes: {
                    a: ['href'],
                    img: ['src', 'alt', 'title'],
                },
            }
        );

        i.__date = new Date(i.pubDate[0]);
        i.__dateRel = moment(i.__date).fromNow();

        return i;
    });
}


exports.mergeFeeds = function mergeFeeds(feeds) {
    var feedItems = [];

    feeds.forEach(function(feed) {
        feed.forEach(function(item) {
            feedItems.push(item);
        });
    });

    feedItems.sort(function(a, b) {
        return b.__date - a.__date;
    });

    return feedItems;
}

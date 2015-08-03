var express = require('express');
var superagent = require('superagent');

var constants = require('../constants');


var proxy_headers = [
    'Accept-Charset',
    'Accept-Language',
    'Accept-Datetime',
    'User-Agent',
];

var router = express.Router();

router.get('/rss/:feed', function(req, res) {
    var feedName = req.params.feed;
    if (!(feedName in constants.RSS_FEEDS)) {
        res.status(404).end();
        return;
    }

    var url = constants.RSS_FEEDS[feedName];
    var rssReq = superagent.get(url);
    console.log('Requesting ' + url);

    proxy_headers.forEach(function(h) {
        var userH = req.get(h);
        if (!userH) return;
        rssReq = rssReq.set(h, userH);
    });
    
    rssReq.set('x-forwarded-for', req.ip);

    rssReq.buffer()
        .end(function(err, resp) {
            if (err) {
                res.status(500).end();
                return;
            }

            res.type('rss').send(resp.text);
        });

});


module.exports = router;

var express = require('express');

var constants = require('../constants');
var rss = require('../rss');


var router = express.Router();

router.get('/rss/:feed', function(req, res) {
    var feedName = req.params.feed;
    if (!(feedName in constants.RSS_FEEDS)) {
        res.status(404).end();
        return;
    }

    rss.getRSS(constants.RSS_FEEDS[feedName], feedName, true).then(function(data) {
        res.type('rss');
        res.send(data);
    }, function() {
        res.status(500).end();
    });
});


module.exports = router;

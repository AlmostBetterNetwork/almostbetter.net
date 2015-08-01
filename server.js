var express = require('express');
app = express();
app.set('views', './templates');

var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates/'));
env.express(app);

var rss = require('./src/rss');
var RSS_FEEDS = require('./src/constants').RSS_FEEDS;
var util = require('./src/util');
var youtube = require('./src/youtube');


// almostbetter.network -> almostbetter.net
app.use(function(req, res, next) {
    if (req.hostname !== 'almostbetter.network') {
        next();
        return;
    }
    res.redirect(301, 'http://almostbetter.net' + req.originalUrl);
});


app.get('/', function(req, res) {

    util.eachPromise({
        'feed_abts': rss.getRSS(RSS_FEEDS.abts, 'abts'),
        'feed_abtd': rss.getRSS(RSS_FEEDS.abtd, 'abtd'),
        'feed_pcp': rss.getRSS(RSS_FEEDS.pcp, 'pcp'),
        'youtube_abts': youtube.getFeed('UCGJppo4ZMBm3f5_QAU8kQWA', 7),
    }).then(function(data) {

        var mergedFeeds = rss.mergeFeeds([
            data.feed_abts,
            data.feed_abtd,
            data.feed_pcp,
        ]);
        console.log('Homepage ready to render');

        res.render(
            'index.html',
            {
                feeds: mergedFeeds,
                feedNames: {
                    'abts': 'Almost Better Than Silence',
                    'abtd': 'Almost Better Than Dragons',
                    'pcp': 'Press Continue Podcast',
                },
                iTunesPages: {
                    'abts': 'https://itunes.apple.com/us/podcast/almost-better-than-silence/id953967760?mt=2&ls=1',
                    'abtd': 'https://itunes.apple.com/us/podcast/almost-better-than-dragons/id981540916?mt=2&ls=1',
                    'pcp': 'https://itunes.apple.com/us/podcast/press-continue-podcast/id875157024?mt=2&ls=1',
                },
                RSSFeeds: RSS_FEEDS,

                youtubeFeed: data.youtube_abts.items,
            }
        );
    }, error).then(null, error);

    function error(err) {
        console.error(err);
        res.render('error');
    }

});

app.use('/feeds', require('./src/modules/feeds'));

app.use(express.static(__dirname + '/www'));

app.listen(process.env.PORT || 8000);

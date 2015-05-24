var express = require('express');
app = express();
app.set('views', './templates');

var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates/'));
env.express(app);

var rss = require('./src/rss');
var util = require('./src/util');
var youtube = require('./src/youtube');


var RSS_FEEDS = {
    'abts': 'https://media.signalleaf.com/Almost-Better-Than-Silence/rss',
    'abtd': 'https://media.signalleaf.com/Almost-Better-Than-Dragons/rss',
    'pcp': 'http://presscontinue.podbean.com/feed/',
};


app.get('/', function(req, res) {

    util.eachPromise({
        'feed_abts': rss.getRSS(RSS_FEEDS.abts, 'abts'),
        'feed_abtd': rss.getRSS(RSS_FEEDS.abtd, 'abtd'),
        'feed_pcp': rss.getRSS(RSS_FEEDS.pcp, 'pcp'),
        'youtube_abts': youtube.getFeed('UCGJppo4ZMBm3f5_QAU8kQWA'),
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

                youtubeFeed: data.youtube_abts.items.slice(0, 3),
            }
        );
    }).then(null, function(err) {
        console.error(err);
        res.render('error');
    });

});

app.use(express.static(__dirname + '/www'));

app.listen(process.env.PORT || 8000);

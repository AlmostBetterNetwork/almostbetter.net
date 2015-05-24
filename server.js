var express = require('express');
app = express();
app.set('views', './templates');

var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates/'));
env.express(app);

var rss = require('./src/rss');
var util = require('./src/util');


app.get('/', function(req, res) {

    util.eachPromise({
        'feed_abts': rss.getRSS('https://media.signalleaf.com/Almost-Better-Than-Silence/rss', 'abts'),
        'feed_abtd': rss.getRSS('https://media.signalleaf.com/Almost-Better-Than-Dragons/rss', 'abtd'),
        'feed_pcp': rss.getRSS('http://presscontinue.podbean.com/feed/', 'pcp'),
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
                }
            }
        );
    }).then(null, function(err) {
        console.error(err);
        res.render('error');
    });

});

app.use(express.static(__dirname + '/www'));

app.listen(process.env.PORT || 8000);

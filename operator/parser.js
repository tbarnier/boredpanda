var request = require('request');
var parseString = require('xml2js').parseString;
var config = require('../config');

exports.feed = function() {
	request(config.feedUrl, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    parseString(body, function (err, result) {
	    	feedParser(result);
	    });
	  }
	})
};

var feedParser = function(items) {
	var sha1 = require('sha1');
	var fs = require('fs');
    var cron = require('./cron');
	var pointer = fs.readFileSync(config.pointerFileName, 'utf8');
	var reference = '';
    var cmp = 0;
	for(var i in items.urlset.url) {
		var location = items.urlset.url[i].loc[0];
		var date = new Date(items.urlset.url[i].lastmod[0]);
		if(config.urlException.indexOf(location) != -1) {
			continue;
		}
		if(sha1(location) == pointer) {
			break;
		}
		if(reference == '') {
            reference = sha1(location);
        }
        var newDate =  new Date(date.getTime());
        newDate.setDate(newDate.getDate() + config.cron.daysToAdd);
        if(newDate > new Date()) {
            console.log(location, date);
            cron.recall(location, date);
            cmp++;
        }

	}
    if(reference != '') {
        fs.writeFileSync(config.pointerFileName, reference);
    }
};

//-------------------------------------------------------------------------------------------------

exports.html = function(url, date) {
    var data = {};
    var Article = require('../operator/article');
    var html = new Article();
    html.init(url, date)
        .then(function(result) {
            try {
                data['url'] = url;
                html.getAuthor();
                if(html.isArticle()) {
                    data['is_article'] = true;
                    data["metrics"] = html.getArticleMetrics();
                } else {
                    data['is_article'] = false;
                    data["metrics"] = html.getFormMetrics();
                }
                data["comments"] = html.commentsInfo();
                data["title"] = html.getTitleInfo();
                data["content"] = html.getContentInfo();
                data["media"] = html.getMediaInfo();
                data["tags"] = html.getTagsInfo();
                data["description"] = html.getDescriptionInfo();
                data["date"] = html.getDateInfo();
                data["category"] = html.getCategoryInfo();
                data["h"] = html.getH();
                data["more"] = html.getMoreInfo();

                var Author = require('../operator/author');
                var auth = new Author();
                auth.init(html.getAuthor())
                    .then(function(result) {
                        data["author_metrics"] = auth.getMetrics();
                        data["author_links"] = auth.getLinks();
                        data["author_info"] = auth.getInfo();
                        var cassandra = require('./cassandra');
                        cassandra.save(data);
                        console.log('--> ', url);
                    });
            } catch(err) {
                console.log('ERROR ', url);
            }


        });
};

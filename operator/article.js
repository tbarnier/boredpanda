var Q = require('q');
var config = require('../config');
var cheerio = require('cheerio');
var request = require('request');
var htmlMiner = require('./text')

function Article() {
    this.url = null;
    this.$ = null;
    this.date = new Date();
};

Article.prototype.init = function (url, date) {
    var deferred = Q.defer();
    this.url = url;
    this.date = date;
    var obj = this;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            obj.$ = cheerio.load(body);
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

// is the page an article or an "open list" ?
Article.prototype.isArticle = function() {
    return !this.$('body').hasClass('single-open-list-post');
};

Article.prototype.getAuthor = function() {
    return this.$('.post-info-block .author-time a').attr('href');
};

Article.prototype.getArticleMetrics = function() {
    var views = this.$('.post-stats .post-views span').html();
    if(views.indexOf('K') != -1) {
        views = views.replace('K', '');
        views = views * 1000;
    } else if(views.indexOf('M') != -1) {
        views = views.replace('M', '');
        views = views * 1000000;
    }
    var share = this.$('.post-stats .post-shares span').html();
    if(share.indexOf('K') != -1) {
        share = share.replace('K', '');
        share = share * 1000;
    } else if(share.indexOf('M') != -1) {
        share = share.replace('M', '');
        share = share * 1000000;
    }
    var vote = this.$('.socialbar .vote-panel .points').attr('data-points');

    return {
        views: parseInt(views),
        share: parseInt(share),
        vote: parseInt(vote)
    };

};

Article.prototype.getFormMetrics = function() {
    var views = this.$('header p.views-count').last().html();
    views = views.match(/([0-9]+[MK])/)[1];
    if(views.indexOf('K') != -1) {
        views = views.replace('K', '');
        views = parseInt(views * 1000);
    } else if(views.indexOf('M') != -1) {
        views = views.replace('M', '');
        views = views * 1000000;
    }
    var vote = this.$('.socialbar .vote-panel .points').attr('data-points');

    return {
        views: parseInt(views),
        vote: parseInt(vote)
    };

};

Article.prototype.commentsInfo = function() {
    var result = {};
    result['has_comments'] = this.$('.comment-author-image').length != 0;
    return result;
};

Article.prototype.getTitleInfo = function() {
    var withStopWords = htmlMiner.getText(this.$('.post-title').html()).split(" ").length;
    var withoutStopWords = htmlMiner.getTextWithoutStopWords(this.$('.post-title').html()).split(" ").length;
    var num = 1 - withoutStopWords / withStopWords;
    return {
        words: withoutStopWords,
        ratio: Math.round(num * 1000) / 1000
    }
};

Article.prototype.getContentInfo = function() {
    var txt = htmlMiner.removeHtml(this.$('.post-content').html());
    var withStopWords = htmlMiner.getText(txt).split(" ").length;
    var withoutStopWords = htmlMiner.getTextWithoutStopWords(txt).split(" ").length;
    var num = 1 - withoutStopWords / withStopWords;
    return {
        words: withoutStopWords,
        ratio: Math.round(num * 1000) / 1000
    }
};

Article.prototype.getMediaInfo = function() {
    var horizontal = 0;
    var vertical = 0;
    var square = 0;
    var obj = this;
    this.$('.post-content .attachment-link-container').each(function (i, e) {
        var tmp = parseInt(obj.$(e).find('a img').attr('width')) > parseInt(obj.$(e).find('a img').attr('height'));
        if(tmp > 0) {
            horizontal++;
        } else if(tmp < 0) {
            vertical++;
        } else {
            square++;
        }
    });
    var cmp = horizontal + square + vertical;

    var video = 0;
    this.$('.post-content .fb-video').each(function(i, e) {
        video++;
    });

    return {
        pictures: cmp,
        horizontal: horizontal,
        vertical: vertical,
        square: square,
        ratioHorizontal: cmp == 0 ? 0 : Math.round(horizontal * 1000 / cmp) / 1000,
        ratioVertical: cmp == 0 ? 0 : Math.round(vertical * 1000 / cmp) / 1000,
        ratioSquare: cmp == 0 ? 0 : Math.round(square * 1000 / cmp) / 1000,
        video: video
    }
};

Article.prototype.getTagsInfo = function() {
    var obj = this;
    var tags = [];
    this.$('.post-tags ul li').each(function (i, e) {
        tags.push(htmlMiner.clean(obj.$(e).find('a').html()));
    });
    var cmp = tags.length;
    var str = 0;
    tags.forEach(function(item) {
        str += item.length;
    });
    return {
        nbTags: cmp,
        tagLength: Math.round(str * 1000 / cmp) / 1000
    }
};

Article.prototype.getDescriptionInfo = function() {
    var withStopWords = htmlMiner.getText(this.$('meta[name="description"]').attr('content')).split(" ").length;
    var withoutStopWords = htmlMiner.getTextWithoutStopWords(this.$('meta[name="description"]').attr('content')).split(" ").length;
    var num = 1 - withoutStopWords / withStopWords;
    return {
        words: withoutStopWords,
        ratio: Math.round(num * 1000) / 1000
    }
};

Article.prototype.getDateInfo = function() {
    var day = new Date(this.date).getDay();
    var result = {};
    var date = '';
    switch(day) {
        case 1: date = 'Monday'; break;
        case 2: date = 'Tuesday'; break;
        case 3: date = 'Wednesday'; break;
        case 4: date = 'Thursday'; break;
        case 5: date = 'Friday'; break;
        case 6: date = 'Saturday'; break;
        case 0: date = 'Sunday'; break;
    }
    result['day'] = date;
    result["weekend"] = day == 0 || day == 6 ? 'Yes' : 'No';
    return result;
};

Article.prototype.getCategoryInfo = function() {
    var category = config.category;
    var origin = category;
    category = category.map(function(item) {
        return htmlMiner.stem(item);
    });
    var result = {};
    var obj = this;
    this.$('.post-tags ul li').each(function (i, e) {
        var tags = htmlMiner.stem(obj.$(e).find('a').html());
        for(var i in category) {
            if(!result.hasOwnProperty(origin[i])) {
                result[origin[i]] = false;
            }
            if(tags.indexOf(category[i]) != -1) {
                result[origin[i]] = true;
            }
        }
    });
    return result;
};

Article.prototype.getH = function() {
    return {
        h1: this.$('.post-content h1').length,
        h2: this.$('.post-content h2').length,
        h3: this.$('.post-content h3').length,
        h4: this.$('.post-content h4').length,
        p: this.$('.post-content p').length
    }
};

Article.prototype.getMoreInfo = function() {
    var obj = this;
    var result = {
        facebook: false,
        etsy: false,
        instagram: false,
        flickr: false,
        tumblr: false,
        imgur: false,
        twitter: false,
        site: false
    };
    this.$('.post-content p').each(function (i, e) {
        if(obj.$(e).html().indexOf('More info: ') == 0) {
            obj.$(e).find('a').each(function(j, f) {
                var link = obj.$(f).attr('href');
                if(link.indexOf('instagram') != -1) {
                    result.instagram = true;
                    return;
                }
                if(link.indexOf('etsy') != -1) {
                    result.etsy = true;
                    return;
                }
                if(link.indexOf('facebook') != -1) {
                    result.facebook = true;
                    return;
                }
                if(link.indexOf('flicker') != -1) {
                    result.flickr = true;
                    return;
                }
                if(link.indexOf('twitter') != -1) {
                    result.twitter = true;
                    return;
                }
                if(link.indexOf('tumblr') != -1) {
                    result.tumblr = true;
                    return;
                }
                if(link.indexOf('imgur') != -1) {
                    result.imgur = true;
                    return;
                }
                result.site = true;
            });
        }
    });
    return result;
};

module.exports = Article;
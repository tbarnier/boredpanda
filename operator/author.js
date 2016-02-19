var Q = require('q');
var config = require('../config');
var cheerio = require('cheerio');
var request = require('request');
var htmlMiner = require('./text');

function Author() {
    this.url = null;
    this.$ = null;
    this.date = new Date();
};

Author.prototype.init = function (url) {
    var deferred = Q.defer();
    this.url = url;
    var obj = this;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            obj.$ = cheerio.load(body);
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

Author.prototype.getMetrics = function() {
    var result = {
        posts: 0,
        likesPerPost: 0,
        viewsTotal: 0,
        viewsPerPost: 0,
        pointsPerPost: 0,
        featuredPots: 0
    };
    var cmp = 0;
    var obj = this;
    this.$('.sidebar .author-stats-box i').each(function(i, e) {
        var nbr = obj.$(e).html();
        if(obj.$(e).html().indexOf('K') != -1) {
            nbr = nbr.replace('K', '');
            nbr = nbr * 1000;
        }
        if(obj.$(e).html().indexOf('M') != -1) {
            nbr = nbr.replace('M', '');
            nbr = nbr * 1000000;
        }
        nbr = parseInt(nbr);
        switch(cmp) {
            case 0: result.viewsTotal = nbr; break;
            case 3: result.pointsPerPost = nbr; break;
            case 2: result.viewsPerPost = nbr; break;
            case 1: result.likesPerPost = nbr; break;
            case 4: result.featuredPots = nbr; break;
        }
        cmp++;
    });

    result.posts = parseInt(this.$('.author-tabs ul').children().first().text().match(/\(([0-9]+)\)/)[1]);

    return result;
};

Author.prototype.getLinks = function() {
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
    this.$('.author-info-footer a').each(function(i, e) {
        var link = obj.$(e).attr('href');
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
    return result;
};

Author.prototype.getInfo = function() {
    var result = {
        staff: 0,
        baseline: 0,
        baselineRatio: 0
    };

    result.staff = this.$('.author-info-community-status').html() == 'BoredPanda Staff' ? 1 : 0;
    var withStopWords = htmlMiner.getText(this.$('.author-info-description').html()).split(" ").length;
    var withoutStopWords = htmlMiner.getTextWithoutStopWords(this.$('.author-info-description').html()).split(" ").length;
    var num = 1 - withoutStopWords / withStopWords;
    result.baseline = withoutStopWords;
    result.baselineRatio = Math.round(num * 1000) / 1000;
    return result;
};


module.exports = Author;
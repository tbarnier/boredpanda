var cassandra = require('cassandra-driver');

exports.save = function(data) {
    var client = new cassandra.Client({ contactPoints: ['localhost'], keyspace: 'boredpanda'});
    var query = "INSERT INTO data (id, is_article, metrics, comments, title, content, media, tags, description, date, category, h, more, author_metrics, author_links, author_info) VALUES " +
        "('"+data.url+"', "+data.is_article+", "+replace(data.metrics)+" , "+replace(data.comments)+", "+replace(data.title)+", "+replace(data.content)+"" +
        ", "+replace(data.media)+", "+replace(data.tags)+", "+replace(data.description)+", "+replace(data.date)+", "+replace(data.category)+", "+replace(data.h)+"" +
        ", "+replace(data.more)+", "+replace(data.author_metrics)+", "+replace(data.author_links)+", "+replace(data.author_info)+")";
    client.execute(query, function (err, result) {
        client.shutdown();
    });
};

var replace = function(txt) {
    return JSON.stringify(txt).replace(/"/g, "'");
};
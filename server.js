var cron = require('./operator/cron');
create_schema = true;

cron.call();


/*
var url = [
    "http://www.boredpanda.com/pablo-picasso-self-portrait-style-evolution/",
    "http://www.boredpanda.com/the-martian-potatoes-advertisement-guerrilla-marketing-albert-bartlett/",
    "http://www.boredpanda.com/ballerina-edgar-degas-painting-photoshoot-misty-copeland-nyc-dance-project/",
    "http://www.boredpanda.com/fox-love-photography-wildlife-roeselien-raimond/",
    "http://www.boredpanda.com/forgotten-housing-paris-memories-future-laurent-kronental/",
    "http://www.boredpanda.com/sister-tattoo-ideas/",
    "http://www.boredpanda.com/refugee-life-jackets-konzerthaus-ai-weiwei/"
];
var parser = require('./operator/parser');

url.forEach(function(item) {
   parser.html(item, new Date());
});
*/
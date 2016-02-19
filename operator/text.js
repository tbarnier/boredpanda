var tm = require('text-miner');

exports.getText = function(txt) {
    var myCorpus = new tm.Corpus([]);
    myCorpus.addDoc(txt);
    return myCorpus.toLower().trim().removeInterpunctuation().clean().documents[0];
};

exports.getTextWithoutStopWords = function(txt) {
    var myCorpus = new tm.Corpus([]);
    myCorpus.addDoc(txt);
    return myCorpus.toLower().trim().removeInterpunctuation().clean().removeWords(tm.STOPWORDS.EN).documents[0];
};

exports.removeHtml = function(txt) {
    txt = txt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    txt = txt.replace(/<[^>]*>/g, '');
    return txt.replace(/\n/g, ' ');
};

exports.isPictureHorizontal = function(width, height) {
    return width > height;
};

exports.clean = function(txt) {
    var myCorpus = new tm.Corpus([]);
    myCorpus.addDoc(txt);
    return myCorpus.toLower().trim().removeInterpunctuation().clean().documents[0];
};

exports.stem = function(txt) {
    var myCorpus = new tm.Corpus([]);
    myCorpus.addDoc(txt);
    return myCorpus.toLower().trim().removeInterpunctuation().clean().stem().documents[0];
}
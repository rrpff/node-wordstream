var fs = require("fs"),
    contained = require("contained"),
    through = require("through");

/**
 * Stream words from a file, split and cleaned
 * @param   {String}  fpath    File of words
 * @param   {Object}  options  Optional hash of options
 * @return  {Stream}           Stream where every chunk is a word
 */
var wordstream = module.exports = function(){

    return through(function(data){

        // Get array of clean words
        var words = clean(data).split("\n");

        for(var i = 0; i < words.length; i++){
            var word = words[i].trim();
            if(word.length > 0 && word !== " ")
                this.queue(word);
        }

    });

}

/**
 * Remove everything but words from a buffer
 * Returns a word on each line
 * @param   {Buffer}  buf
 * @return  {String}        Word
 */
var clean = function(buf){
    return buf.toString()
        .replace(/[^a-zA-Z]/g, "\n");
}

/**
 * Remove values from a stream if they don't pass a predicate.
 * @param   {Function}  predicate  Predicate, returns boolean
 * @return  {Stream}               Filtered stream
 */
var filter = wordstream.filter = function(predicate){
    return through(function(word){
        word = Buffer.isBuffer(word) ? word.toString() : word;
        var passes = predicate.call(this, word);
        if(passes) this.queue(word);
    });
}

/**
 * Filter words out of a stream which aren't in a whitelist
 * @param   {Array}  whitelist  Words to let through
 * @return  {Stream}
 */
var pick = wordstream.pick = function(whitelist){
    var check = contained(whitelist);
    return filter(function(word){
        return check(word);
    });
}

/**
 * Filter words out of a stream if they're in a blacklist
 * @param   {Array}  blacklist  Words to filter out
 * @return  {Stream}
 */
var without = wordstream.without = function(blacklist){
    var check = contained(blacklist);
    return filter(function(word){
        return check(word) === false;
    });
};

/**
 * Filter duplicate values out of a stream
 * @return  {Stream}
 */
var unique = wordstream.unique = function(){
    var seen = [];
    return filter(function(word){
        if(seen.indexOf(word) === -1){
            seen.push(word)
            return true;
        }

        return false;
    });
}

/**
 * Sort the words in a wordstream using a comparator.
 * @param   {Function}  fn  Comparator, optional
 * @return  {Stream}
 */
var sort = wordstream.sort = function(fn){
    var words = [];
    return through(function(word){
        words.push(word);
    }, function(){
        words.sort(fn);
        for(var i = 0; i < words.length;
            this.queue(words[i++]));
        this.queue(null);
    });
}
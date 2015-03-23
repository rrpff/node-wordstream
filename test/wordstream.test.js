require("chai").should();

var wordstream = require("../"),
    callback = require("event-stream").writeArray,
    fs = require("fs"),
    Path = require("path");

var wordlist = Path.join(__dirname, "words.txt");

var stream = function(){
    return fs.createReadStream(wordlist)
        .pipe(wordstream());
}

describe("wordstream", function(){

    it("should clean words in a stream and emit each word separately", function(done){
        var s = stream();

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["this", "is", "not", "not", "not", "not", "my", "test", "file"]);
            done();
        }));
    });

});

describe("#without", function(){

    it("should remove blacklisted words from a stream of words", function(done){
        var s = stream().pipe(wordstream.without(["not"]));

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["this", "is", "my", "test", "file"]);
            done();
        }));
    });

});

describe("#pick", function(){

    it("should remove words which aren't whitelisted from a stream of words", function(done){
        var s = stream().pipe(wordstream.pick(["is", "test", "this"]));

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["this", "is", "test"]);
            done();
        }));
    });

});

describe("#unique", function(){

    it("should remove duplicate words", function(done){
        var s = stream().pipe(wordstream.unique());

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["this", "is", "not", "my", "test", "file"]);
            done();
        }));
    });

});

describe("#sort", function(){

    it("should sort words in a stream", function(done){
        var s = stream()
            .pipe(wordstream.unique())
            .pipe(wordstream.sort());

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["file", "is", "my", "not", "test", "this"]);
            done();
        }));
    });

    it("should accept a comparator function", function(done){
        var s = stream()
            .pipe(wordstream.unique())
            .pipe(wordstream.sort(function(a, b){
                return a.length > b.length;
            }));

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["is", "my", "not", "this", "test", "file"]);
            done();
        }));
    });

});

describe("#filter", function(){

    it("should remove duplicate words", function(done){
        var s = stream().pipe(wordstream.filter(function(word){
            return word.length <= 2;
        }));

        s.pipe(callback(function(err, words){
            words.should.deep.equal(["is", "my"]);
            done();
        }));
    });

});
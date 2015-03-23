# node-wordstream

Streams words from a stream, and provides utility streams for filtering through them.

## Setup

```sh
npm install --save wordstream
```

```js
var words = require("wordstream");
```

## Usage

Log every word in a file.

```js
fs.createReadStream("./test/words.txt");
    .pipe(words())
    .on("data", console.log);
```

`pipe` through a few wordstream utilities.

```js
var stream = fs.createReadStream("./test/words.txt")
    // Extract words from stream
    .pipe(words())

    // Remove duplicates
    .pipe(words.unique())

    // Blacklist some words
    .pipe(words.without(["bad", "words"]))

    // Remove every word but these
    .pipe(words.pick(["is", "test", "file"]))

    // Sort it alphabetically
    .pipe(words.sort());

// => 'file', 'is', 'test'...

// Using a module like event-stream we can pipe words to a callback
var es = require("event-stream");

var callback = es.writeArray(function(err, words){
    console.log(words);
});

stream.pipe(callback);
```

## Methods

The following examples use this example stream:

```js
var stream = fs.createReadStream("./dictionary.txt")
    .pipe(words());
```

### pick(words)

Remove every word but those listed in an array from a stream. Can use regexps and functions as well, see [contained](https://github.com/zuren/contained).

```js
stream.pipe(words.pick(["apple", "banana", "cherry"]))
    .on("data", console.log);

// => "apple", "banana", "banana", "cherry"
```

### without(words)

Remove every word in an array from a stream. Can use regexps and functions as well, see [contained](https://github.com/zuren/contained).

```js
stream.pipe(words.without(["pizza"]))
    .on("data", console.log);

// => "apple", "banana", "banana", "cherry", "mango"
```

### unique()

Remove duplicate words from a stream.

```js
stream.pipe(words.unique())
    .on("data", console.log);

// => "apple", "banana", "cherry", "mango", "pizza"
```

### sort([comparator])

Sort words in a stream, optionally using a comparator.

```js
// Alphabetical sort
stream.pipe(words.sort())
    .on("data", console.log);
```

```js
// Sort by length of words
var sortByLength = words.sort(function(a, b){
    return a.length > b.length;
});

stream.pipe(sortByLength)
    .on("data", console.log);

// => "apple", "mango", "banana", "banana", "cherry", "pizza"
```

### filter()

Filter words from a stream using a predicate. Return `true` to keep it, `false` to remove it.

```js
var removeLongWords = words.filter(function(word){
    return word.length <= 6;
});

stream.pipe(removeLongWords)
    .on("data", console.log);

// => "apple", "mango"
```
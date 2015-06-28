// elaine's crappy chrome extension
// Find/replace source cribbed from https://github.com/ericwbailey/millennials-to-snake-people
// POS tagger came from https://code.google.com/p/jspos/

walk(document.body);

document.title = replaceText(document.title);

function walk(node)
{
    // I stole this function from here:
    // http://is.gd/mwZp7E

    var child, next;

    switch ( node.nodeType )
    {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild;
            while ( child )
            {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;

        case 3: // Text node
            handleText(node);
            break;
    }
}

function handleText(textNode) {
  textNode.nodeValue = replaceText(textNode.nodeValue);
}


function wordExists(v, substrings) {
    var l = substrings.length;
    while(l--) {
        if (v.toLowerCase().includes(substrings[l])) return true;
    }
    return false;
}

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function replaceWord(w, btcw, blockw) {
    // replace the old word and match case
    console.log(btcw);
    console.log(blockw);
    var x = w.replace(/bitcoins?/g, btcw);
    x = x.replace(/bitcoins?/g, btcw)
    x = x.replace(/blockchain/g, blockw);
    x = x.replace(/Bitcoins?/g, btcw.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }));
    x = x.replace(/Blockchain/g, blockw.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }));
    x = x.replace(/BITCOINS?/g, btcw.toUpperCase());
    x = x.replace(/BLOCKCHAIN/g, blockw.toUpperCase());

    // all caps
    //if (w.toUpperCase() == w) {x = x.toUpperCase(); console.log(w);}
    //else if (w[0].toUpperCase() == w[0]) {x = x.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });}

    return x;
}

function replaceText(v)
{
  var targetWords = ["bitcoin", "blockchain"];

  if (wordExists(v, targetWords)) {
      // found a bad word in text, now figure out the PoS
      // tokenize into sentences
      var sents = v.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");

      var result = "";

      for (s in sents) {
        repSent = "";   // replacement sentence
        if (wordExists(sents[s], targetWords)) {

          var words = new Lexer().lex(sents[s]);
          var taggedWords = new POSTagger().tag(words);
          var btcWord = '', blockWord='';

          // js sucks at arrays
          var tags = []; // only need first two chars of tag
          for (i in taggedWords) { tags.push(taggedWords[i][1].substring(0,2)); }

          // Get position of verb, need it later
          var verbPos = tags.indexOf("VB");

          for (i in taggedWords) {
            var taggedWord = taggedWords[i];
            var word = taggedWord[0];
            var tag = taggedWord[1];

            if (word.toLowerCase().includes("bitcoin")) {
                // replace depending on PoS

                // subject of sentence
                if (verbPos < 0 | verbPos > i | tag=="JJ") btcWord = "money laundering";
                else btcWord = "fraudulent currency";

                // replace the old word and match case
                //repSent += replaceWord(word, newWord) + " ";
            } else if (word.toLowerCase().includes("blockchain")) {
                if (tag=="JJ") blockWord = "terrorist"
                else blockWord = "money laundering network";
            }
          }
          repSent = replaceWord(sents[s], btcWord, blockWord);
          result += repSent + " ";
        } else { result += sents[s] + " "; }
      }
      return result;
    }
    else return v;
}

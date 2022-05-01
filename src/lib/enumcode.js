/* usage example
 *
 *
	const TERMS = {
		stars: ["ONE","TWO","THREE","FOUR","FIVE"],
		planets: true
	};

	const test = encode(TERMS, {stars: "TWO", planets: 12});
	const testParsed = decode(TERMS, test);
	console.log(test, testParsed)

	// logs:
	"c1",  {
	  "planets": 12,
	  "stars": "TWO"
	}

*/

function encode(terms, data) {
    const indexes = [];
    for (const k of Object.keys(terms).sort()) {
        const v = typeof data[k] === 'number' ? data[k] : terms[k].indexOf(data[k]);
        if (v > 36) throw new Error("Cannot encode value > 36");
        indexes.push(v);
    }
    return indexes.map(i => i.toString(36)).join('');
}

function decode(terms, data) {
    const canon = Object.keys(terms).sort();
    const digits = data.split('');
    const o = {};
    let index = 0;

    function getValue(key, value) {
        const index = parseInt(value, 36);
        if (terms[key] instanceof Array) {
            return terms[key][value];
        } else {
            return index;
        }
    }
 
    while (digits.length > 0) {
        const key = canon[index];
        const c = digits.shift();
        if (c === '-') {
            o[key] = getValue(key, digits.shift());
        } else {
            o[key] = getValue(key, c);
        }
        index++;
    }

    return o;
}

module.exports = {
	encode,
	decode
};


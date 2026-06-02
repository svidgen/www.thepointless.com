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

function pack(terms, data) {
    const indexes = [];
    const raw = [];

    for (const k of Object.keys(terms).sort()) {
        if (terms[k] === 'string') {
            raw.push(data[k]);
        } else {
            const v = typeof data[k] === 'number' ? data[k] : terms[k].indexOf(data[k]);
            if (v > 36) throw new Error("Cannot encode value > 36");
            indexes.push(v);
        }
    }

    return [raw, indexes.map(i => i.toString(36)).join('')];
}

function parseIndexes(indexString) {
    const digits = indexString.split('');
    const indexes = [];

    while (digits.length > 0) {
        const c = digits.shift();
        if (c === '-') {
            indexes.push(parseInt(digits.shift()) * -1);
        } else {
            indexes.push(parseInt(c));
        }
    }

    return indexes;
}

function unpack(terms, data) {
    const [raw, indexString] = data;

    const canon = Object.keys(terms).sort();
    const indexes = parseIndexes(indexString);
    const o = {};

    for (const field of Object.keys(terms).sort()) {
        if (terms[field] === 'string') {
            o[field] = raw.shift();
        } else {
            o[field] = terms[field][indexes.shift()];
        }
    }

    return o;
}

module.exports = {
	pack,
	unpack
};


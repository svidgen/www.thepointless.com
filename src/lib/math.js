function sum(values) {
	let sum =  0;
	for (const value of values) sum += value;
	return sum;
};

function max(values) {
	let max;
	for (const value of values) {
		if (max === undefined || value > max) max = value;
	}
	return max;
}

function min(values) {
	let min;
	for (const value of values) {
		if (min === undefined || value < min) min = value;
	}
	return min;
}

function avg(values) {
	return sum(values) / values.length;
}

function product(values) {
	let product = 1;
	for (const value of values) product = product * value;
	return product;
}

function deltas(a, b) {
	const deltas = [];
	for (let i = 0; i < a.length; i++) {
		deltas.push(Math.abs(a[i] - (b[i] || 0)));
	}
	return deltas;
}

function distance(a, b) {
	const squared_deltas = deltas(a, b || []).map(d => d * d);
	console.log(squared_deltas);
	return Math.sqrt(sum(squared_deltas));
}

module.exports = {
	avg,
	sum,
	min,
	max,
	product,
	distance
};
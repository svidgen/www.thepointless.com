const { exec } = require('child_process');

exec('git log --shortstat', (err, stdout, stderr) => {
	if (err) {
		throw err;
	}

	const maxCommitsToCount = 500;
	let commitsCounted = [];

	const hashLine = /^commit (\w+)/;
	const authorLine = /^Author: [\w\s]+<(.+)>$/;
	const linesChanged = /^ (\d+) files? changed, (\d+) insertions?\(\+\), (\d+) deletions?\(-\)$/;

	const contributors = {};
	let totalLinesChanged = 0;
	let currentAuthor = null;
	let currentHashLine = null;

	stdout.split(/\n/).some(line => {
		if (commitsCounted.length >= maxCommitsToCount) return true;
		let matches;
		if (matches = line.match(hashLine)) {
			currentHashLine = matches[1];
		} else if (matches = line.match(authorLine)) {
			currentAuthor = matches[1];
		} else if (matches = line.match(linesChanged)) {
			let linesChanged = 
				Number(matches[2]) // insertions
				+ Number(matches[3]) // deletions
			;
			contributors[currentAuthor] = (contributors[currentAuthor] || 0)
				+ linesChanged;
			totalLinesChanged += linesChanged;
			commitsCounted.push({
				author: currentAuthor,
				commit: currentHashLine,
				changes: line
			});
			currentAuthor = null;
		}
		return false;
	});

	for (var email in contributors) {
		contributors[email] = {
			linesChanged: contributors[email],
			percentContributed: contributors[email]/totalLinesChanged
		};
	}

	console.log(JSON.stringify(contributors, null, 2));
	// console.log(JSON.stringify(commitsCounted, null, 2));
});

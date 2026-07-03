export function generate() {
	return String.raw`/***************************/
/*                         */
/*     Core styling        */
/*                         */
/***************************/

ft\:app {
	display: block;
}

ft\:app > [data-id="editControl"] {
	margin: 1em 0;
}

/***************************/
/*                         */
/*     Profile viewing     */
/*                         */
/***************************/

ft\:profileview > [data-id='actions'] {
	margin: 1em 0;
}

.frentagonist-share-widgets {
	margin: 1.25rem 0;
	padding: 1rem 0;
	border-top: 1px dashed var(--border-color-subtle, #aaa);
	border-bottom: 1px dashed var(--border-color-subtle, #aaa);
}

.frentagonist-share-widget {
	box-sizing: border-box;
	width: calc(100% - 2rem);
	max-width: 44rem;
	margin: 0 auto;
	padding: 0.85rem;
	border: 1px solid var(--border-color-subtle, #aaa);
	border-radius: 0.4rem;
	background: #fffdf3;
	box-shadow: 0 1px 4px #ddd;
}

.frentagonist-share-heading {
	margin-bottom: 0.5rem;
	font-weight: bold;
	color: darkgreen;
}

.frentagonist-share-preview {
	box-sizing: border-box;
	width: 100%;
	margin: 0;
	padding: 0.75rem;
	border: 1px solid var(--border-color-subtle, #aaa);
	border-radius: 0.25rem;
	background: #fff;
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	font-size: 0.85rem;
	line-height: 1.45;
	white-space: pre;
	overflow-x: auto;
	overflow-y: visible;
}

.frentagonist-share-widget button {
	display: block;
	margin: 0.75rem auto 0;
}

ft\:dimensionview {
	display: table-row;
}

ft\:dimensionview > * {
	display: table-cell;
	padding: 0.25em 0.5em;
}

/***************************/
/*                         */
/*     Profile editing     */
/*                         */
/***************************/

ft\:editdimension {
	display: block;
	margin: 1em;
}

ft\:editdimension > [data-id='label'] {
	font-weight: bold;
}

ft\:editdimension > [data-id='options'] {
	display: table-row;
}

ft\:radio {
	display: inline-block;
	margin: 0.5em 0.25em;
}

ft\:radio > input[type='radio'] {
	display: none;
}

ft\:radio > label {
	padding: 0.25em;
	border: 0.15em solid lightblue;
	border-radius: 0.15em;
	background-color: white;
	color: gray;
	cursor: pointer;
}

ft\:radio > input[type='radio']:checked ~ label {
	border-style: solid;
	border-color: green;
	background-color: lightyellow;
	color: black;
	font-weight: bold;
}
`;
}

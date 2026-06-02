import { Context } from "wirejs-resources";
import { html } from "wirejs-dom/v2";
import { Main } from '../layouts'
import news from '../news.cjs';

export async function generate(context: Context) {
	return Main({
		content: html`<p>something</p>`
	})
}
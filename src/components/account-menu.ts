import { html } from "wirejs-dom/v2";
import { AccountMenu as BaseAccountMenu } from "wirejs-components";

type BaseOptions = Omit<Parameters<typeof BaseAccountMenu>[0], 'topItems' | 'bottomItems'>;

export function AccountMenu(options: BaseOptions) {
	return BaseAccountMenu({
		...options,
		topItems: [
			(state) => state?.state !== 'authenticated'
				? html`<div><i>Sign in to get started!</i></div>`
				: html`<div>Welcome!</div>`
		],
		bottomItems: [
			html`<div>Made with wirejs</div>`
		]
	});
}
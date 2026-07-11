import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Zebra Awareness',
		content: html`<div>
			<p><b>Zebra awareness</b> is <i>extremely</i> important. Our zebra awareness test is designed by <u><i>professional</i></u> <b>Digital Zebra Recognition Specialists</b> to help you determine whether you are a zebra.</p>
			<div style='text-align: center; margin: 30px auto;'>
				<a class='nohoverdecoration' href='/zebra-awareness-test.html' style='font-size: x-large; font-weight: bold;'>
					<img src='/static/images/zebratest/zebra.png' alt='zebra' style='border: 0;' />
					<br />Start the Test
				</a>
			</div>
		</div>`
	});
}

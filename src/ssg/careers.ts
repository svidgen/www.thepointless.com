import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Careers',
		content: html`
			<div id='top' style='margin-bottom: 2rem;'>
				We may or may not have the following positions open:
			</div>

			<ul class='job_jumplist link-list'>
				<li><a href='#Button_Pusher'>Button Pusher</a></li>
				<li><a href='#Word_Maker'>Word Maker</a></li>
				<li><a href='#Dungeon_Master'>Dungeon Master</a></li>
			</ul>

			<div class='not-job_container'>

				<div id='Button_Pusher' class='job'>
					<h3 class='job_title' title="Depressable Interface Manager">Button Pusher</h3>
					<div class='job_description'>
						Buttons don't push themselves. And there are many buttons to be pushed. Therefore, thepointless.com is seeking several experienced Button Pushers to depress a wide variety of buttons.
					</div>
					<div class='job_section'>
						<h4>Responsibilities</h4>
						<ul>
							<li>Recognize buttons</li>
							<li>Push buttons</li>
							<li>Report button pushing incidents</li>
						</ul>
					</div>
					<div class='job_section'>
						<h4>Qualifications</h4>
						<ul>
							<li>Strong ability to recognize buttons of all sorts</li>
							<li>Keen understanding of button pushing</li>
							<li>Extensive history of button-human relations</li>
							<li>2+ years experience pushing buttons in a professional setting</li>
							<li>Ph.D. in button-pushing strongly preferred, but not required</li>
						</ul>
					</div>
					<div class='job_footer'>
						<a href='#top'>Back to top.</a>
					</div>
				</div>

				<!-- other jobs omitted for brevity -->
			</div>
		`
	});
}

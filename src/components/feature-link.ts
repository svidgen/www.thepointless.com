import { html } from 'wirejs-dom/v2';

type FeatureLinkProps = {
	href: string;
	icon: string;
	title: string;
	target?: string;
	description: unknown;
	className?: string;
};

export function FeatureLink({ href, icon, title, target, description, className = '' }: FeatureLinkProps) {
	const rel = target === '_blank' ? 'noopener' : '';
	return html`<section class='feature-link ${className}'>
		<a class='feature-link-image' href='${href}' target='${target || ''}' rel='${rel}' aria-label='${title}'>
			<img src='${icon}' alt='' />
		</a>
		<div class='feature-link-body'>
			<h4><a href='${href}' target='${target || ''}' rel='${rel}'>${title}</a></h4>
			<div class='feature-link-description'>${description}</div>
		</div>
	</section>`;
}

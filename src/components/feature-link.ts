import { html } from 'wirejs-dom/v2';

export type FeatureLinkProps = {
	href: string;
	icon: string;
	title: unknown;
	ariaLabel?: string;
	target?: string;
	description: unknown;
	className?: string;
};

export type FeatureLinkListProps = {
	items: FeatureLinkProps[];
	className?: string;
	itemClassName?: string;
	target?: string;
};

export function FeatureLink({ href, icon, title, ariaLabel, target, description, className = '' }: FeatureLinkProps) {
	const rel = target === '_blank' ? 'noopener' : '';
	return html`<section class='feature-link ${className}'>
		<a class='feature-link-image' href='${href}' target='${target || ''}' rel='${rel}' aria-label='${ariaLabel || title}'>
			<img src='${icon}' alt='' />
		</a>
		<div class='feature-link-body'>
			<h4><a href='${href}' target='${target || ''}' rel='${rel}'>${title}</a></h4>
			<div class='feature-link-description'>${description}</div>
		</div>
	</section>`;
}

export function FeatureLinkList({ items, className = '', itemClassName = '', target }: FeatureLinkListProps) {
	return html`<div class='feature-link-list ${className}'>
		${items.map(item => FeatureLink({ ...item, target: item.target || target, className: item.className || itemClassName }))}
	</div>`;
}

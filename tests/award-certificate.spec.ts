import { expect, test } from '@playwright/test';

const certificatePath = '/awards/certificates/TPDC-PMWOT-0000000001';

test('award certificate shows canonical URL copy control near certificate', async ({ page }) => {
	await page.goto(certificatePath);

	const urlCopy = page.locator('.certificate-url-copy');
	await expect(urlCopy).toBeVisible();
	await expect(urlCopy.locator('code')).toContainText(certificatePath);
	await expect(urlCopy.getByRole('button', { name: 'Copy certificate URL' })).toBeVisible();
});

test('award embed chooser keeps one preview and one snippet visible', async ({ page }) => {
	await page.goto(certificatePath);

	await expect(page.locator('.award-embed-preview:visible')).toHaveCount(1);
	await expect(page.locator('.award-embed-options textarea:visible')).toHaveCount(1);
	await expect(page.locator('.award-embed-options button').filter({ hasText: /^Copy/ })).toHaveCount(1);

	await page.locator('[data-award-size="small"]').click();
	await expect(page.locator('.award-embed-preview:visible')).toHaveCount(1);
	await expect(page.locator('[data-award-snippet-label]')).toHaveText('Small HTML badge');
	await expect(page.locator('[data-award-size="small"]')).toHaveClass(/active/);
	await expect(page.locator('[data-award-size="large"]')).not.toHaveClass(/active/);
});

test('award embed chooser updates HTML and Markdown snippet state', async ({ page }) => {
	await page.goto(certificatePath);

	const snippet = page.locator('[data-award-snippet-field]');
	await expect(snippet).toHaveValue(/<a href=".*TPDC-PMWOT-0000000001"/);
	await expect(snippet).toHaveValue(/for Excellence in Unnecessary Internet/);

	await page.locator('[data-award-format="markdown"]').click();
	await expect(page.locator('[data-award-snippet-label]')).toHaveText('Large Markdown badge');
	await expect(page.locator('[data-award-format="markdown"]')).toHaveClass(/active/);
	await expect(page.locator('[data-award-format="html"]')).not.toHaveClass(/active/);
	await expect(snippet).toHaveValue(/\[★ Pointless Award · Cert\. 0000000001\]\(.*TPDC-PMWOT-0000000001\)/);
});

test('award embed preview avoids layout shift between badge sizes', async ({ page }) => {
	await page.goto(certificatePath);

	const preview = page.locator('.award-embed-preview:visible');
	const largeHeight = await preview.evaluate(el => Math.round(el.getBoundingClientRect().height));

	await page.locator('[data-award-size="small"]').click();
	const smallHeight = await page.locator('.award-embed-preview:visible').evaluate(el => Math.round(el.getBoundingClientRect().height));

	expect(smallHeight).toBe(largeHeight);
});

test('copyable HTML badge snippets carry their own styling on a blank page', async ({ page }) => {
	await page.goto(certificatePath);

	const snippet = page.locator('[data-award-snippet-field]');
	const largeHtml = await snippet.inputValue();

	await page.locator('[data-award-size="small"]').click();
	const smallHtml = await snippet.inputValue();

	await page.setContent(`<!doctype html><html><head></head><body><div id="large">${largeHtml}</div><div id="small">${smallHtml}</div></body></html>`);

	const largeBadge = page.locator('#large a');
	await expect(largeBadge).toBeVisible();
	await expect(largeBadge).toHaveCSS('display', 'flex');
	await expect(largeBadge).toHaveCSS('align-items', 'center');
	await expect(largeBadge).toHaveCSS('max-width', '512px');
	await expect(largeBadge).toHaveCSS('background-color', 'rgb(255, 253, 243)');
	await expect(largeBadge).toHaveCSS('text-decoration-line', 'none');

	const largeSeal = page.locator('#large a > span').first();
	await expect(largeSeal).toHaveCSS('border-radius', '50%');
	await expect(largeSeal).toHaveCSS('background-color', 'rgb(255, 230, 138)');

	const largeText = page.locator('#large a > span').nth(1);
	await expect(largeText).toHaveCSS('text-align', 'left');
	await expect(largeText).toContainText('Recipient of the');
	await expect(largeText).toContainText('Pointless Award');
	await expect(largeText).toContainText('for Excellence in Unnecessary Internet');

	const smallBadge = page.locator('#small a');
	await expect(smallBadge).toBeVisible();
	await expect(smallBadge).toHaveCSS('display', 'inline-flex');
	await expect(smallBadge).toHaveCSS('align-items', 'center');
	await expect(smallBadge).toHaveCSS('background-color', 'rgb(255, 253, 243)');
	await expect(smallBadge).toHaveCSS('text-decoration-line', 'none');
	await expect(smallBadge).toContainText('Pointless Award · Cert. 0000000001');
});

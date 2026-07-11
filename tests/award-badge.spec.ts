import { expect, test } from '@playwright/test';

const certificatePath = '/awards/certificates/TPDC-PMWOT-0000000001';
const largeBadgeText = /Recipient of the\s+Pointless Award\s+for Excellence in Unnecessary Internet/;
const smallBadgeText = /Pointless Award\s+Cert\. 0000000001/;

for (const path of ['/', '/about.html']) {
	test(`large award badge markup stays consistent on ${path}`, async ({ page }) => {
		await page.goto(path);

		const badge = page.locator('#content .pointless-award-badge').first();
		await expect(badge).toBeVisible();
		await expect(badge).not.toHaveClass(/small/);
		await expect(badge).toContainText(largeBadgeText);
		await expect(badge.locator('a')).toHaveAttribute('href', certificatePath);
	});
}

test('certificate page large preview uses the same on-site badge component markup', async ({ page }) => {
	await page.goto(certificatePath);

	const previewBadge = page.locator('[data-award-preview="large"] .pointless-award-badge');
	await expect(previewBadge).toBeVisible();
	await expect(previewBadge).not.toHaveClass(/small/);
	await expect(previewBadge).toContainText(largeBadgeText);
	await expect(previewBadge.locator('a')).toHaveAttribute('href', new RegExp(`${certificatePath}$`));
});

test('footer uses the shared small award badge', async ({ page }) => {
	await page.goto('/');

	const footerBadge = page.locator('footer .pointless-award-badge.small');
	await expect(footerBadge).toBeVisible();
	await expect(footerBadge).toContainText(smallBadgeText);
	await expect(footerBadge.locator('a')).toHaveAttribute('href', certificatePath);
});

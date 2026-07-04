import { expect, test } from '@playwright/test';

test('red dot click count posts to the scoring page', async ({ page }) => {
	await page.goto('/reddot.html');
	const dot = page.getByAltText('The red dot');
	await dot.click();
	await dot.click();
	await page.getByRole('button', { name: "I'm done harassing the dot." }).click();
	await expect(page).toHaveURL(/\/dotresults\.html\?clicks=2&dot=red/);
	await expect(page.locator('.pointless-certificate')).toContainText('The Office of Dot Appreciation cordially certifies that');
	await expect(page.locator('#dot-result-color')).toHaveText('red');
	await expect(page.locator('#dot-result-count')).toHaveText('2 times');
});

test('red dot done button has site styling', async ({ page }) => {
	await page.goto('/reddot.html');
	const button = page.getByRole('button', { name: "I'm done harassing the dot." });
	await expect(button).toBeVisible();
	await expect(button).toHaveCSS('font-family', /Cambria|math|serif/);
	await expect(button).toHaveCSS('cursor', 'pointer');
});

test('shooty ship page loads core assets and initializes custom element', async ({ page }) => {
	const failed: string[] = [];
	const pageErrors: string[] = [];
	page.on('pageerror', error => pageErrors.push(error.message));
	page.on('response', response => {
		const url = response.url();
		if (url.includes('/apps/shooty-ship/') && response.status() >= 400) {
			failed.push(`${response.status()} ${url}`);
		}
	});

	await page.goto('/apps/shooty-ship/index.html');
	await expect(page.locator('ss\\:game')).toBeVisible();
	await expect(page.locator('ss\\:gameoversplash')).toBeAttached({ timeout: 10_000 });
	await expect(page.locator('ss\\:ship')).toBeAttached();
	await expect(page.locator('ss\\:game')).toHaveCSS('background-image', /\/static\/apps\/shooty-ship\/img\/shiny\.jpg/);

	for (const path of [
		'/static/apps/shooty-ship/img/icon.png',
		'/static/apps/shooty-ship/img/shiny.jpg',
		'/static/apps/shooty-ship/img/shooty-ship.png',
		'/static/apps/shooty-ship/img/shooty-ship-rock-150x150.png',
		'/static/apps/shooty-ship/audio/pew-128.mp3',
		'/static/apps/shooty-ship/audio/pkewh.mp3',
		'/apps/shooty-ship/manifest.json',
		'/apps/shooty-ship/js/game.css',
		'/apps/shooty-ship/js/game.js',
	]) {
		const response = await page.request.get(path);
		expect(response.ok(), `${path} should be served`).toBeTruthy();
	}

	expect(failed).toEqual([]);
	expect(pageErrors).toEqual([]);
});

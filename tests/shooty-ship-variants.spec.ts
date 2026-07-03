import { expect, test } from '@playwright/test';

const variants = [
	{
		path: '/apps/shooty-ship-pumpkin-smash/index.html',
		staticBase: '/static/apps/shooty-ship-pumpkin-smash/',
		name: 'Shooty Ship - Pumpkin Smash',
		enemies: 'shooty-ship-pumpkin-150x150',
		shrapnel: 'candle-88x150,mummy-93x150,round-red-candy-150x81,square-candy-colored-150x76',
		enemyImage: /shooty-ship-pumpkin-150x150\.png/,
		assets: [
			'img/icon.png',
			'img/shiny.jpg',
			'img/shooty-ship.png',
			'img/shooty-ship-pumpkin-150x150.png',
			'img/candle-88x150.png',
			'img/mummy-93x150.png',
			'audio/pew-128.mp3',
			'audio/pkewh.mp3',
		],
	},
	{
		path: '/apps/shooty-ship-presidential/index.html',
		staticBase: '/static/apps/shooty-ship-presidential/',
		name: 'Shooty Ship - Presidential',
		enemies: 'trump-1-tl,trump-2-tl,trump-3-tl,trump-4-tl,trump-5-tl,trump-6-tl',
		shrapnel: 'believe-me,big,definitely,fake-news,huge,maybe,probably,really,zero',
		enemyImage: /trump-[1-6]-tl\.png/,
		assets: [
			'img/icon.png',
			'img/shiny.jpg',
			'img/shooty-ship.png',
			'img/trump-1-tl.png',
			'img/fake-news.png',
			'img/believe-me.png',
			'audio/pew-128.mp3',
			'audio/pkewh.mp3',
		],
	},
];

for (const variant of variants) {
	test(`${variant.name} loads migrated runtime assets`, async ({ page }) => {
		const failed: string[] = [];
		const pageErrors: string[] = [];
		page.on('pageerror', error => pageErrors.push(error.message));
		page.on('response', response => {
			const url = response.url();
			if ((url.includes(variant.path.replace('/index.html', '')) || url.includes(variant.staticBase)) && response.status() >= 400) {
				failed.push(`${response.status()} ${url}`);
			}
		});

		await page.goto(variant.path);
		await expect(page.locator('ss\\:game')).toBeVisible();
		await expect(page.locator('ss\\:gameoversplash')).toBeAttached({ timeout: 10_000 });
		await expect(page.locator('ss\\:game')).toHaveCSS('background-image', new RegExp(`${variant.staticBase.replaceAll('/', '\\/')}img\\/shiny\\.jpg`));
		await expect(page.locator('ss\\:game')).toHaveAttribute('name', variant.name);
		await expect(page.locator('ss\\:game')).toHaveAttribute('enemies', variant.enemies);
		await expect(page.locator('ss\\:game')).toHaveAttribute('shrapnel', variant.shrapnel);

		await page.locator('ss\\:startbutton', { hasText: 'Start' }).click();
		await expect(page.locator('ss\\:gameoversplash')).toHaveCount(0);
		await expect(page.locator('ss\\:ship')).toBeVisible();
		const enemy = page.locator('ss\\:bigenemy').first();
		await expect(enemy).toBeVisible({ timeout: 2_000 });
		await expect(enemy).toHaveCSS('background-image', variant.enemyImage);

		for (const asset of variant.assets) {
			const response = await page.request.get(`${variant.staticBase}${asset}`);
			expect(response.ok(), `${variant.staticBase}${asset} should be served`).toBeTruthy();
		}

		for (const appAsset of ['manifest.json', 'sw.js']) {
			const response = await page.request.get(`${variant.path.replace('index.html', '')}${appAsset}`);
			expect(response.ok(), `${appAsset} should be served for ${variant.name}`).toBeTruthy();
		}

		expect(failed).toEqual([]);
		expect(pageErrors).toEqual([]);
	});
}

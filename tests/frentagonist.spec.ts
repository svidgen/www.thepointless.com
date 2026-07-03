import { expect, test } from '@playwright/test';

const path = '/hs/frentagonist/index.html';

async function fillProfile(page, name: string, optionIndex = 2) {
	await page.getByLabel('Name').fill(name);
	const dimensions = [
		'Your Political Leaning',
		'Your Ideal State Structure',
		'Your Religiousness',
		'Academic Style',
		'Alcohol',
		'Socialization Style',
		'Preferred Discussion',
	];
	for (const dimension of dimensions) {
		await page.locator(`ft\\:editdimension[data-dimension="${dimension}"] label`).nth(optionIndex).click();
	}
	await page.getByRole('button', { name: 'Save' }).click();
}

test('frentagonist profile requires all fields before saving', async ({ page }) => {
	await page.goto(path);
	await expect(page.locator('ft\\:editprofile')).toBeVisible();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.locator('[data-warning]')).toHaveCSS('color', 'rgb(255, 0, 0)');
	await expect(page.locator('ft\\:profileview')).toHaveCount(0);
});

test('frentagonist profile saves locally and generates a share link', async ({ page }) => {
	await page.goto(path);
	await fillProfile(page, 'Test Goblin', 2);

	await expect(page.locator('ft\\:profileview')).toBeVisible();
	await expect(page.locator('ft\\:profileview')).toContainText("Test Goblin's Frentagonist Profile");
	await expect(page.locator('[data-share-link]')).toHaveValue(/\/hs\/frentagonist\/index\.html\?s=/);
	await expect(page.locator('[data-share-string]')).toContainText('Test Goblin');

	await page.reload();
	await expect(page.locator('ft\\:profileview')).toContainText("Test Goblin's Frentagonist Profile");
});

test('frentagonist shared profile compares against local profile', async ({ page }) => {
	await page.goto(path);
	await fillProfile(page, 'First Goblin', 0);
	const shareUrl = await page.locator('[data-share-link]').inputValue();

	await page.evaluate(() => localStorage.clear());
	await page.goto(path);
	await fillProfile(page, 'Second Goblin', 4);
	await page.goto(shareUrl);

	await expect(page.locator('ft\\:profileview')).toContainText('Frentagonist Comparison');
	await expect(page.locator('ft\\:profileview')).toContainText('First Goblin');
	await expect(page.locator('ft\\:profileview')).toContainText('Second Goblin');
	await expect(page.locator('ft\\:profileview')).toContainText(/\d+%/);
});

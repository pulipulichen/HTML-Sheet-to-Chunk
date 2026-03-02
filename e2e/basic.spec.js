import { test, expect } from '@playwright/test';

test('頁面標題正確且主要元素顯示', async ({ page }) => {
  // 由於 Playwright config 可能已經設定 baseURL，這裡使用相對路徑或確保與環境一致
  await page.goto('http://localhost:8080');

  // 檢查標題 (根據 index.html: <title>Sheet to Chunks</title>)
  await expect(page).toHaveTitle(/Sheet to Chunks/);

  // 檢查標題文字 (根據 index.html: Sheet to Chunks)
  await expect(page.locator('h1')).toContainText('Sheet to Chunks');

  // 檢查拖曳上傳區塊是否存在
  const dropzone = page.locator('#dropzone');
  await expect(dropzone).toBeVisible();

  // 檢查載入按鈕
  const loadBtn = page.locator('#load-url-btn');
  await expect(loadBtn).toBeVisible();

  // 檢查輸出設定
  const settings = page.locator('h3:has-text("輸出設定")');
  await expect(settings).toBeVisible();

  // 檢查有沒有 console error
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

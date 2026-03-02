import { test, expect } from '@playwright/test';

test('頁面標題正確且主要元素顯示', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // 檢查標題
  await expect(page).toHaveTitle(/Excel 轉 JSONL \/ MD 工具/);

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

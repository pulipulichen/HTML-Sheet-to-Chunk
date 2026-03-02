// 取得當前時間 YYYYMMDD-HHmmSS
function getFormattedTime() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

// HTML 溢出字元處理 (防止 XSS)
// 使用 Unicode 編碼以避免自動格式化工具誤將實體轉義回字元導致語法錯誤
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "\x26amp;")
        .replace(/</g, "\x26lt;")
        .replace(/>/g, "\x26gt;")
        .replace(/"/g, "\x26quot;")
        .replace(/'/g, "\x26#039;");
}

// 處理檔案拖曳事件用的防制預設行為
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

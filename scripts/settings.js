// --- 處理 LocalStorage 記憶設定 ---
function loadSettings() {
    const savedSplitSize = localStorage.getItem('splitSize');
    if (savedSplitSize) document.getElementById('split-size').value = savedSplitSize;

    const savedFormat = localStorage.getItem('outputFormat');
    if (savedFormat) {
        const formatRadio = document.querySelector(`input[name="format-selector"][value="${savedFormat}"]`);
        if (formatRadio) formatRadio.checked = true;
    }

    // 預設副檔名可以改成 .txt
    const savedExt = localStorage.getItem('outputExt') || '.txt';
    const extRadio = document.querySelector(`input[name="ext-selector"][value="${savedExt}"]`);
    if (extRadio) extRadio.checked = true;
}

// 綁定事件：當設定改變時自動儲存到 LocalStorage
function initSettingsListeners() {
    document.getElementById('split-size').addEventListener('input', (e) => localStorage.setItem('splitSize', e.target.value));

    document.querySelectorAll('input[name="format-selector"]').forEach(radio => {
        radio.addEventListener('change', (e) => localStorage.setItem('outputFormat', e.target.value));
    });

    document.querySelectorAll('input[name="ext-selector"]').forEach(radio => {
        radio.addEventListener('change', (e) => localStorage.setItem('outputExt', e.target.value));
    });
}

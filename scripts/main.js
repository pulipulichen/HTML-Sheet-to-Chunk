// 初始化 Icons
lucide.createIcons();

// 儲存當前轉換的所有檔案資料，供 ZIP 下載使用
let currentGeneratedFiles = [];
let currentBaseFilename = "";

// DOM 元素
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-upload');
const resultsContainer = document.getElementById('results-container');
const sheetsList = document.getElementById('sheets-list');

// 執行載入設定與監聽器
loadSettings();
initSettingsListeners();

// 處理檔案拖曳事件
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('border-emerald-500', 'bg-emerald-50');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('border-emerald-500', 'bg-emerald-50');
    }, false);
});

// 處理檔案放下
dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        fileInput.files = files; // 同步到 input
        processExcel(files[0]);
    }
});

// 處理點擊選擇檔案
fileInput.addEventListener('change', function (e) {
    if (this.files.length > 0) {
        processExcel(this.files[0]);
    }
});

// 處理載入線上檔案網址
const loadUrlBtn = document.getElementById('load-url-btn');
const onlineUrlInput = document.getElementById('online-url-input');

loadUrlBtn.addEventListener('click', async () => {
    let url = onlineUrlInput.value.trim();
    if (!url) {
        alert('請先輸入網址！');
        return;
    }

    // 自動偵測並轉換 Google Sheets 網址為匯出 Excel 格式的網址
    const gsRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(gsRegex);
    if (match) {
        const spreadsheetId = match[1];
        url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    }

    // 替換按鈕狀態為讀取中
    const originalText = loadUrlBtn.innerHTML;
    loadUrlBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>載入中</span>';
    loadUrlBtn.disabled = true;
    lucide.createIcons({ root: loadUrlBtn });

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('網路回應錯誤：' + response.status);

        // 將回傳內容轉換成 Blob
        const blob = await response.blob();

        // 嘗試從網址判斷副檔名，若無則預設為 xlsx
        let filename = "線上載入檔案.xlsx";
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            // 如果網址結尾有附檔名，則作為檔名使用
            if (lastPart && lastPart.includes('.')) {
                filename = decodeURIComponent(lastPart);
            }
        } catch (e) {
            // 解析網址失敗時忽略，使用預設檔名
        }

        const file = new File([blob], filename, {
            type: response.headers.get('content-type') || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        processExcel(file);
    } catch (error) {
        console.error('載入線上檔案失敗:', error);
        alert('載入檔案失敗！\n請確認：\n1. 網址是否正確且公開\n2. 該伺服器是否允許 CORS 跨來源請求\n\n錯誤細節: ' + error.message);
    } finally {
        // 還原按鈕狀態
        loadUrlBtn.innerHTML = originalText;
        loadUrlBtn.disabled = false;
        lucide.createIcons({ root: loadUrlBtn });
    }
});

// 處理 ZIP 打包與下載
document.getElementById('download-zip-btn').addEventListener('click', async function () {
    if (currentGeneratedFiles.length === 0) return;

    // 顯示打包中狀態
    const originalText = this.innerHTML;
    this.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>打包中...</span>';
    this.disabled = true;
    lucide.createIcons({ root: this });

    try {
        const zip = new JSZip();

        // 將所有生成的檔案加入 ZIP 中
        currentGeneratedFiles.forEach(file => {
            zip.file(file.filename, file.content);
        });

        // 非同步產生 ZIP 檔案 Blob
        const content = await zip.generateAsync({ type: 'blob' });

        // 觸發下載
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentBaseFilename}-批次下載-${getFormattedTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("ZIP 生成失敗:", error);
        alert("打包 ZIP 檔案時發生錯誤！");
    } finally {
        // 還原按鈕狀態
        this.innerHTML = originalText;
        this.disabled = false;
        lucide.createIcons({ root: this });
    }
});

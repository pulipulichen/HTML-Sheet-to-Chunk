// 處理 Excel 轉換的主要邏輯
function processExcel(file) {
    // 顯示 Loading 遮罩
    const globalLoading = document.getElementById('global-loading');
    globalLoading.classList.remove('hidden');

    const reader = new FileReader();

    reader.onload = function (e) {
        // 利用 setTimeout 將繁重的解析工作放到下一個 Event Loop，讓瀏覽器有時間渲染 Loading 畫面
        setTimeout(() => {
            try {
                const data = new Uint8Array(e.target.result);
                // 解析 Excel 檔案
                const workbook = XLSX.read(data, { type: 'array' });

                // 取得原始主檔名 (移除副檔名)
                const baseFilename = file.name.replace(/\.[^/.]+$/, "");
                const timestamp = getFormattedTime();

                // 初始化 ZIP 相關變數
                currentGeneratedFiles = [];
                currentBaseFilename = baseFilename;
                document.getElementById('download-zip-btn').classList.add('hidden');

                // 清空先前的結果並顯示區塊
                const sheetsList = document.getElementById('sheets-list');
                sheetsList.innerHTML = '';
                document.getElementById('results-container').classList.remove('hidden');

                // 取得使用者設定
                const selectedFormat = document.querySelector('input[name="format-selector"]:checked').value;
                const selectedExt = document.querySelector('input[name="ext-selector"]:checked').value;
                let splitSize = parseInt(document.getElementById('split-size').value, 10);
                if (isNaN(splitSize) || splitSize < 1) splitSize = 5000;

                let processedCount = 0;

                // 遍歷每一個 Sheet
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    // 將 Sheet 轉換為 JSON 陣列 (移除 raw: false 以保留原始的數字型態)
                    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

                    if (rows.length === 0) return; // 略過空的 Sheet

                    let dataBlocks = [];

                    // 處理每一行資料
                    rows.forEach(row => {
                        let rowObj = {};
                        let mdContent = [];
                        let hasData = false;

                        for (let key in row) {
                            // 去除欄位名稱的換行符號 (\r 或 \n)
                            let sanitizedKey = key.replace(/[\r\n]+/g, '').trim();

                            let val = row[key];
                            // 過濾空值 (包含 null, undefined 或空字串)
                            if (val !== null && val !== undefined && val !== "") {
                                // 若值為字串則去前後空白
                                if (typeof val === 'string') {
                                    val = val.trim();
                                    if (val === "") continue;
                                }
                                rowObj[sanitizedKey] = val;
                                mdContent.push(`${sanitizedKey}:${val}`);
                                hasData = true;
                            }
                        }
                        if (hasData) {
                            if (selectedFormat === 'jsonl') {
                                dataBlocks.push(JSON.stringify(rowObj));
                            } else {
                                dataBlocks.push(mdContent.join('\n'));
                            }
                        }
                    });

                    if (dataBlocks.length > 0) {
                        processedCount++;

                        const totalRows = dataBlocks.length;
                        const totalChunks = Math.ceil(totalRows / splitSize);

                        for (let i = 0; i < totalChunks; i++) {
                            // 切割每個檔案的資料
                            const chunk = dataBlocks.slice(i * splitSize, (i + 1) * splitSize);

                            // 依據格式決定串接方式
                            const finalContent = selectedFormat === 'jsonl'
                                ? chunk.join('\n')
                                : chunk.join('\n---\n');

                            // 組合檔名與標籤
                            const partSuffix = totalChunks > 1 ? `-part${i + 1}` : '';
                            const outputFilename = `${baseFilename}-${sheetName}-${timestamp}${partSuffix}${selectedExt}`;
                            const partLabel = totalChunks > 1 ? `(Part ${i + 1}/${totalChunks})` : '';

                            // 將生成的檔案內容存入陣列，供 ZIP 使用
                            currentGeneratedFiles.push({ filename: outputFilename, content: finalContent });

                            createResultCard(sheetName, outputFilename, finalContent, selectedExt, partLabel);
                        }
                    }
                });

                if (processedCount === 0) {
                    sheetsList.innerHTML = `<div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">此 Excel 檔案中沒有找到任何有效的資料。</div>`;
                } else if (currentGeneratedFiles.length > 0) {
                    // 若有產生檔案，則顯示下載 ZIP 按鈕
                    document.getElementById('download-zip-btn').classList.remove('hidden');
                }

            } catch (error) {
                console.error(error);
                alert('解析 Excel 檔案時發生錯誤，請確認檔案格式是否正確。');
            } finally {
                // 無論成功或失敗，都隱藏 Loading 遮罩
                globalLoading.classList.add('hidden');
            }
        }, 50); // 延遲 50ms 確保 UI 優先更新
    };

    reader.onerror = function () {
        globalLoading.classList.add('hidden');
        alert('讀取檔案失敗！');
    };

    reader.readAsArrayBuffer(file);
}

// 建立結果卡片 UI
function createResultCard(sheetName, filename, jsonContent, ext, partLabel) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden';

    // 根據選擇的副檔名決定 Blob 類型
    let mimeType = 'text/plain'; // 預設 txt 使用 text/plain
    if (ext === '.jsonl') mimeType = 'application/jsonlines+json';
    else if (ext === '.md') mimeType = 'text/markdown';

    const blob = new Blob([jsonContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);

    const displayExt = ext.toUpperCase().replace('.', '');

    card.innerHTML = `
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
                <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                    <i data-lucide="table" class="w-4 h-4 text-slate-500"></i>
                    Sheet: <span class="text-emerald-600">${sheetName}</span>
                    <span class="text-xs text-slate-500 font-normal ml-1">${partLabel}</span>
                </h3>
                <p class="text-xs text-slate-500 mt-1">${filename}</p>
            </div>
            <a href="${url}" download="${filename}" class="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i>
                下載 ${displayExt}
            </a>
        </div>
        <div class="p-6 bg-slate-800">
            <pre class="text-sm text-slate-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap">${escapeHtml(jsonContent)}</pre>
        </div>
    `;
    document.getElementById('sheets-list').appendChild(card);

    // 重新初始化新加入的 Icons
    lucide.createIcons({ root: card });
}

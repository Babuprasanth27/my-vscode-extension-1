"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const undici_1 = require("undici");
// Utility function to convert baseline status to readable text
function getStatusText(status) {
    switch (status) {
        case 'widely':
            return { production: '✅ Yes', status: '✅ Widely available' };
        case 'newly':
            return { production: '⚠️ Experimental', status: '🆕 Newly available' };
        default:
            return { production: '❌ No', status: '⛔ Not in Baseline' };
    }
}
// Utility function to build browsers table
function activate(context) {
    console.log("✅ Baseline Checker extension activated!");
    const hoverProvider = vscode.languages.registerHoverProvider(["html", "css", "javascript"], {
        async provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z0-9._-]+:?/);
            if (!wordRange)
                return;
            const featureId = document.getText(wordRange).replace(/:$/, '').toLowerCase();
            const url = `https://api.webstatus.dev/v1/features/${encodeURIComponent(featureId)}`;
            try {
                const res = await (0, undici_1.fetch)(url);
                if (!res.ok) {
                    console.log(`❌ API failed: ${res.status}`);
                    return;
                }
                const data = (await res.json());
                console.log("📦 API Response:", data);
                const { production, status } = getStatusText(data.baseline?.status);
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`### ${data.name || featureId}\n\n`);
                md.appendMarkdown(`| Property | Value |\n|---|---|\n`);
                md.appendMarkdown(`| Production Ready | ${production} |\n`);
                md.appendMarkdown(`| Release Date / Since | ${data.baseline?.low_date || 'Unknown'} |\n`);
                md.appendMarkdown(`| Status | ${status} |\n\n`);
                md.appendMarkdown(`#### Supported Browsers\n`);
                md.appendMarkdown(buildBrowsersTable(data.browser_implementations));
                md.appendMarkdown(`\n[View on WebStatus](https://webstatus.dev/features/${featureId})`);
                md.isTrusted = true;
                return new vscode.Hover(md, wordRange);
            }
            catch (err) {
                console.error("🚨 Hover failed:", err);
                return;
            }
        }
    });
    context.subscriptions.push(hoverProvider);
}
function buildBrowsersTable(browserData) {
    if (!browserData || Object.keys(browserData).length === 0) {
        return `| Browser | Status | Version | Since |\n|---|---|---|---|\n| - | - | - | - |\n`;
    }
    const rows = Object.entries(browserData)
        .map(([browser, info]) => `| ${browser} | ${info.status} | ${info.version} | ${info.date || '?'} |`)
        .join('\n');
    return `| Browser | Status | Version | Since |\n|---|---|---|---|\n${rows}\n`;
}
function deactivate() {
    console.log("🛑 Baseline Checker extension deactivated");
}
//# sourceMappingURL=extension.js.map
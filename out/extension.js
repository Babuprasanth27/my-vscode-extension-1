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
            return { production: ' Yes', status: ' Widely available' };
        case 'newly':
            return { production: ' Experimental', status: ' Newly available' };
        case 'limited':
            return { production: ' Partial', status: ' Limited support' };
        default:
            return { production: ' No', status: ' Not in Baseline' };
    }
}
// Utility function to build browsers table
function buildBrowsersTable(browserData) {
    if (!browserData || Object.keys(browserData).length === 0) {
        return `| Browser | Status | Version | Since |\n|---|---|---|---|\n| - | - | - | - |\n`;
    }
    const rows = Object.entries(browserData)
        .map(([browser, info]) => `| ${browser} | ${info.status} | ${info.version || '-'} | ${info.date || '?'} |`)
        .join('\n');
    return `| Browser | Status | Version | Since |\n|---|---|---|---|\n${rows}\n`;
}
// Try to fetch feature by ID, fallback to search if not found
async function fetchFeature(featureId) {
    const directUrl = `https://api.webstatus.dev/v1/features/${encodeURIComponent(featureId)}`;
    let res = await (0, undici_1.fetch)(directUrl);
    if (res.ok) {
        return await res.json();
    }
    if (res.status === 404) {
        console.log(`🔍 Direct fetch failed for "${featureId}". Falling back to search...`);
        const searchUrl = `https://api.webstatus.dev/v1/features?q=${encodeURIComponent(featureId)}`;
        res = await (0, undici_1.fetch)(searchUrl);
        if (res.ok) {
            const results = await res.json();
            if (results.features && results.features.length > 0) {
                return results.features[0]; // take first match for now
            }
        }
    }
    console.log(` No feature found for "${featureId}"`);
    return null;
}
function activate(context) {
    console.log(" Baseline Checker extension activated!");
    const hoverProvider = vscode.languages.registerHoverProvider(["html", "css", "javascript"], {
        async provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z0-9._-]+:?/);
            if (!wordRange)
                return;
            const rawText = document.getText(wordRange).replace(/:$/, '').toLowerCase();
            const feature = await fetchFeature(rawText);
            if (!feature)
                return;
            console.log(" API Response:", feature);
            const { production, status } = getStatusText(feature.baseline?.status);
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`### ${feature.name || feature.feature_id}\n\n`);
            md.appendMarkdown(`| Property | Value |\n|---|---|\n`);
            md.appendMarkdown(`| Production Ready | ${production} |\n`);
            md.appendMarkdown(`| Release Date / Since | ${feature.baseline?.low_date || 'Unknown'} |\n`);
            md.appendMarkdown(`| Status | ${status} |\n\n`);
            md.appendMarkdown(`#### Supported Browsers\n`);
            md.appendMarkdown(buildBrowsersTable(feature.browser_implementations));
            md.appendMarkdown(`\n[View on WebStatus](https://webstatus.dev/features/${feature.feature_id})`);
            md.isTrusted = true;
            return new vscode.Hover(md, wordRange);
        }
    });
    context.subscriptions.push(hoverProvider);
}
function deactivate() {
    console.log(" Baseline Checker extension deactivated");
}
//# sourceMappingURL=extension.js.map
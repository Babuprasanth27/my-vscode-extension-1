import * as vscode from 'vscode';
import { fetch } from 'undici';

type WebStatusFeature = {
    feature_id: string;
    name: string;
    baseline?: {
        status?: 'widely' | 'newly' | 'limited' | null;
        low_date?: string;
    };
    browser_implementations?: Record<string, { status: string; version: string; date?: string }>;
};

// Utility function to convert baseline status to readable text
function getStatusText(status?: 'widely' | 'newly' | 'limited' | null) {
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
function buildBrowsersTable(browserData?: Record<string, { status: string; version: string; date?: string }>) {
    if (!browserData || Object.keys(browserData).length === 0) {
        return `| Browser | Status | Version | Since |\n|---|---|---|---|\n| - | - | - | - |\n`;
    }

    const rows = Object.entries(browserData)
        .map(([browser, info]) => `| ${browser} | ${info.status} | ${info.version || '-'} | ${info.date || '?'} |`)
        .join('\n');

    return `| Browser | Status | Version | Since |\n|---|---|---|---|\n${rows}\n`;
}

// Try to fetch feature by ID, fallback to search if not found
async function fetchFeature(featureId: string): Promise<WebStatusFeature | null> {
    const directUrl = `https://api.webstatus.dev/v1/features/${encodeURIComponent(featureId)}`;

    let res = await fetch(directUrl);
    if (res.ok) {
        return await res.json() as WebStatusFeature;
    }

    if (res.status === 404) {
        console.log(`🔍 Direct fetch failed for "${featureId}". Falling back to search...`);
        const searchUrl = `https://api.webstatus.dev/v1/features?q=${encodeURIComponent(featureId)}`;
        res = await fetch(searchUrl);
        if (res.ok) {
            const results = await res.json() as { features: WebStatusFeature[] };
            if (results.features && results.features.length > 0) {
                return results.features[0]; // take first match for now
            }
        }
    }

    console.log(` No feature found for "${featureId}"`);
    return null;
}

export function activate(context: vscode.ExtensionContext) {
    console.log(" Baseline Checker extension activated!");

    const hoverProvider = vscode.languages.registerHoverProvider(
        ["html", "css", "javascript"],
        {
            async provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z0-9._-]+:?/);
                if (!wordRange) return;

                const rawText = document.getText(wordRange).replace(/:$/, '').toLowerCase();
                const feature = await fetchFeature(rawText);

                if (!feature) return;

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
        }
    );

    context.subscriptions.push(hoverProvider);
}

export function deactivate() {
    console.log(" Baseline Checker extension deactivated");
}

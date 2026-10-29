/** Move legacy endpoint settings into the single managed MCP list.
 * @param cogneeForm - Legacy Cognee settings form.
 * @param chromeForm - Legacy Chrome settings form.
 * @param managedForm - Canonical managed server list form.
 * @returns Whether an old configuration was migrated.
 */
export async function runLegacyMcpMigration(cogneeForm, chromeForm, managedForm) {
    await Promise.all([waitForFirstSnapshot(cogneeForm), waitForFirstSnapshot(chromeForm), waitForFirstSnapshot(managedForm)]);
    const cognee = cogneeForm.getSnapshot().value ?? {};
    const chrome = chromeForm.getSnapshot().value ?? {};
    const legacyPresent = Boolean(cognee.enabled || cognee.endpoint || chrome.enabled || chrome.url);
    if (!legacyPresent)
        return false;
    const servers = [...(managedForm.getSnapshot().value?.servers ?? [])];
    if (chrome.url?.trim() && !servers.some(server => server.serverName === 'chrome')) {
        const url = safeEndpoint(chrome.url);
        if (url === undefined)
            throw new TypeError('legacy Chrome endpoint is not a supported HTTP endpoint');
        servers.push({
            id: 'chrome', serverName: 'chrome', enabled: chrome.enabled ?? false, purpose: 'model-tools',
            transport: 'streamable-http', url: url.href, headers: { Origin: url.origin },
            headerRefs: { Authorization: 'DSH_CHROME_MCP_TOKEN' },
        });
    }
    if (cognee.endpoint?.trim() && !servers.some(server => server.serverName === 'cognee')) {
        const url = safeEndpoint(cognee.endpoint);
        if (url === undefined)
            throw new TypeError('legacy Cognee endpoint is not a supported HTTP endpoint');
        const ref = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(cognee.credentialRef ?? '')
            ? cognee.credentialRef
            : 'DSH_COGNEE_MCP_TOKEN';
        servers.push({
            id: 'cognee', serverName: 'cognee', enabled: cognee.enabled ?? false, purpose: 'project-memory',
            transport: 'streamable-http', url: url.href, headers: {}, headerRefs: { Authorization: ref },
        });
    }
    if (!await managedForm.set('servers', servers))
        throw new Error('managed MCP settings refused the migration');
    const cleared = await Promise.all([
        cogneeForm.set('enabled', false), cogneeForm.set('endpoint', ''),
        chromeForm.set('enabled', false), chromeForm.set('url', ''),
    ]);
    if (cleared.some(accepted => !accepted))
        throw new Error('legacy MCP settings could not be cleared');
    return true;
}
function waitForFirstSnapshot(form) {
    if (form.getSnapshot().status !== 'loading')
        return Promise.resolve();
    return new Promise(resolve => {
        const unsubscribe = form.subscribe(() => {
            if (form.getSnapshot().status === 'loading')
                return;
            unsubscribe();
            resolve();
        });
    });
}
function safeEndpoint(input) {
    try {
        const url = new URL(input);
        const host = url.hostname.toLowerCase().replace(/^\[|\]$/gu, '');
        const loopback = host === 'localhost' || host === '::1' || /^127(?:\.\d{1,3}){3}$/u.test(host);
        if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)))
            return undefined;
        return url;
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=migration.js.map
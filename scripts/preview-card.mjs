/**
 * Render the built MCP settings section in jsdom and write a static HTML preview.
 *
 * The settings page normally runs inside the DSH Web host window, which desktop automation may
 * not drive (`HOST_INPUT_DENIED`). This script renders the same built artifact the package ships
 * against fixture rows and a stand-in for the host UI primitives, so the card layout can be
 * screenshotted and compared without starting the host.
 *
 * The output is a local inspection file only: fixture data, host primitives approximated by
 * preview CSS, and no network requests. It is not part of the package.
 *
 * Usage:
 *   node scripts/preview-card.mjs [--harness <deepseek-harness dir>] [--out <file>] [--width 560]
 *
 * Requires the sibling DSH checkout for `react`, `react-dom`, and `jsdom`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const argOf = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const harnessRoot = resolve(argOf('--harness', 'E:/home/deepseek-harness'));
const outPath = resolve(argOf('--out', join(repoRoot, 'docs/preview/mcp-settings-preview.html')));
const frameWidth = Number(argOf('--width', '560'));
const bundlePath = join(repoRoot, 'vendor/dsh-client-ui-settings-mcp/lib/client.js');

const requireFromRepo = createRequire(join(repoRoot, 'package.json'));
const requireFromHarness = createRequire(join(harnessRoot, 'package.json'));

/** Resolve a package from the repository, then the DSH checkout, then the pnpm store. */
function resolvePackage(specifier) {
  for (const loader of [requireFromRepo, requireFromHarness]) {
    try { return loader.resolve(specifier) } catch { /* try the next root */ }
  }
  const store = join(harnessRoot, 'node_modules/.pnpm');
  if (!existsSync(store)) return undefined;
  const wanted = specifier.split('/')[0];
  for (const entry of readdirSync(store)) {
    if (entry !== wanted && !entry.startsWith(`${wanted}@`)) continue;
    // Resolve through a loader anchored in the store entry so subpaths and export maps apply.
    const loader = createRequire(join(store, entry, 'node_modules', 'resolve-from-here.cjs'));
    try { return loader.resolve(specifier) } catch { /* try the next entry */ }
  }
  return undefined;
}

function load(specifier) {
  const path = resolvePackage(specifier);
  if (path === undefined) throw new Error(`preview-card: cannot resolve ${specifier} (pass --harness)`);
  return createRequire(path)(path);
}

const react = load('react');
const { createRoot } = load('react-dom/client');
const { act } = load('react-dom/test-utils');
const { JSDOM } = load('jsdom');
const jsxRuntime = load('react/jsx-runtime');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
const win = dom.window;
globalThis.window = win;
globalThis.document = win.document;
Object.defineProperty(globalThis, 'navigator', { value: win.navigator, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Host primitives are approximated so the preview shows the layout, not a bare checkbox. */
const primitives = {
  Button: ({ children, variant = 'ghost', size = 'md', className, ...rest }) => react.createElement(
    'button',
    { type: 'button', className: ['ui-button', className].filter(Boolean).join(' '), 'data-variant': variant, 'data-size': size, ...rest },
    children,
  ),
  Switch: ({ checked, label, disabled }) => react.createElement(
    'span',
    { className: 'ui-switch', 'data-checked': String(checked), role: 'switch', 'aria-checked': checked, 'aria-label': label, 'data-disabled': String(disabled) },
    react.createElement('span', { className: 'ui-switch-knob' }),
  ),
  IconApiOutlineRegular: () => react.createElement('svg', { 'aria-hidden': 'true' }),
};

const inert = new Proxy(function inertModule() {}, {
  get: (_target, key) => (key === 'then' ? undefined : inert),
  apply: () => undefined,
});
const shimRequire = (specifier) => {
  if (specifier === 'react') return react;
  if (specifier === 'react/jsx-runtime') return jsxRuntime;
  if (specifier === 'react-dom') return load('react-dom');
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
  if (specifier === '@deepseek-ai/dsh-util-crypto') return { randomUUID: () => '00000000-0000-4000-8000-000000000000' };
  return resolvePackage(specifier) === undefined ? inert : load(specifier);
};

let captured;
win.__ModuleLoader__ = { load: (record) => { captured = record; } };
new Function('window', 'require', readFileSync(bundlePath, 'utf8'))(win, shimRequire);
const exports = captured.factory(shimRequire);

/** The server rows the page has to carry: cost, extensions, a reconnecting row, a disabled one. */
const server = (id, serverName, enabled) => ({
  id, serverName, enabled, purpose: 'model-tools', transport: 'streamable-http',
  url: 'http://127.0.0.1:9/mcp', headers: {}, headerRefs: {},
});
const onlyServer = argOf('--only', undefined);
const servers = [
  server('s1', 'taexpr', true),
  server('s2', 'VISION-LIAO', true),
  server('s3', 'agent-desk', false),
  server('s4', 'mcp-chrome-super', true),
].filter((row) => onlyServer === undefined || row.serverName === onlyServer);

/** A tool list with readable names and descriptions, as the upstream service publishes them. */
const toolsOf = (...entries) => entries.map(([name, description]) => ({ name, description }));

const taexprTools = toolsOf(
  ['list_fund_catalog', '读取基金目录；可传 query 按基金代码或名称搜索，最多 100 个字符。只读。'],
  ['get_fund_positions', '读取基金持仓明细与汇总；包含买入观察列表与当前份额。只读。'],
  ['get_portfolio_summary', '读取组合资产与收益汇总，含市值、成本与区间收益。只读。'],
  ['check_triggers', '检查已启用的触发线；返回 triggered、not_triggered 或 no_data。只读，不执行交易。'],
);
const chromeTools = toolsOf(
  ['chrome_page_screenshot', '截取当前页面或指定元素；annotate 为真时返回带编号的视口截图。'],
  ['chrome_read_page', '读取当前标签页的可见文本、HTML 或 Readability 正文。'],
  ['chrome_form_fill', '填写或选择一个或多个网页表单元素，支持批量与 select。'],
  ['chrome_tab_list', '列出当前打开的所有浏览器窗口和标签页，含可见性状态。'],
  ['chrome_action_wait_response', '执行导航或点击后等待指定网络响应，可附带确认按钮。'],
);

const statusRows = [
  {
    id: 'status-s1', managedServerId: 's1', serverName: 'taexpr', transport: 'streamable-http',
    state: 'connected', toolCount: taexprTools.length, tools: taexprTools, protocolRevision: '2026-07-28',
  },
  { id: 'status-s2', managedServerId: 's2', serverName: 'VISION-LIAO', transport: 'streamable-http', state: 'reconnecting', toolCount: 0, tools: [] },
  {
    id: 'status-s4', managedServerId: 's4', serverName: 'mcp-chrome-super', transport: 'streamable-http',
    state: 'connected', toolCount: chromeTools.length, tools: chromeTools, protocolRevision: '2026-07-28',
    extensions: ['io.modelcontextprotocol/skills', 'io.modelcontextprotocol/tasks'],
  },
].filter((row) => servers.some((candidate) => candidate.id === row.managedServerId));

/** Resources and skills the panels read when they open. */
const resources = [
  { uri: 'skill://code-review', name: 'code-review', title: '代码评审检查单', description: '逐条核对改动与检查单的一致性。', mimeType: 'text/markdown', size: 1840 },
  { uri: 'skill://invoice-audit', name: 'invoice-audit', title: '报销稽核', description: '把报销单与制度条款对照。', mimeType: 'text/markdown', size: 2210 },
  { uri: 'config://browser', name: 'browser-config', title: '浏览器配置', description: '当前 Profile 与窗口策略。', mimeType: 'application/json', size: 620 },
];
const resourceTemplates = [
  { uriTemplate: 'skill://{name}', name: 'skill', title: '技能正文', description: '按名称读取技能全文。', mimeType: 'text/markdown' },
];
const skills = [
  { name: 'code-review', description: 'Review a diff against the checklist.' },
  { name: 'invoice-audit', description: 'Check expense claims against policy.' },
];

const snapshot = { status: 'ready', writable: !process.argv.includes('--read-only'), value: { servers } };
const form = { subscribe: () => () => {}, getSnapshot: () => snapshot, set: async () => true };
const statusApi = { list: async () => ({ ok: true, value: statusRows }) };
const managerApi = {
  check: async () => ({ ok: true, value: { state: 'ready', toolCount: 5, tools: statusRows.at(-1)?.tools ?? [] } }),
  restart: async () => ({ ok: true, value: { state: 'scheduled' } }),
  listResources: async () => ({ ok: true, value: { state: 'ready', value: { resources } } }),
  listResourceTemplates: async () => ({ ok: true, value: { state: 'ready', value: { resourceTemplates } } }),
  readResource: async (_serverId, uri) => ({
    ok: true,
    value: { state: 'ready', value: { contents: [{ kind: 'text', uri, mimeType: 'text/markdown', text: `# ${uri}\n\n资源正文只显示在这里，用来核对读取是否成功。` }] } },
  }),
  listSkills: async () => ({ ok: true, value: { state: 'ready', value: { skills } } }),
};

const dictionaries = {};
const sections = [];
const ctx = {
  remote: { $mount: async () => async () => {}, credentials: {} },
  locale: {
    bind: (namespace) => (key, params) => {
      const template = dictionaries[namespace]?.zh?.[key] ?? dictionaries[namespace]?.en?.[key] ?? key;
      return params === undefined
        ? template
        : Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), template);
    },
    register: (namespace, dicts) => { dictionaries[namespace] = dicts; },
  },
  effect: (fn) => fn(),
  configForms: { whileServed: (_ids, fn) => fn(), get: () => form },
  slots: { inject: (_name, fn) => fn(), register: (definition, component) => { sections.push({ definition, component }); return () => {}; } },
  get: (path) => (path === 'remote.mcpClientStatus' ? statusApi : path === 'remote.mcpServerManager' ? managerApi : undefined),
};

await exports.apply(ctx);
const page = sections.find((section) => section.definition.id === 'mcp')?.component;
if (page === undefined) throw new Error('preview-card: the bundle did not register settings.mcp');

const t = (key, params) => ctx.locale.bind('settings.mcp')(key, params);
const root = createRoot(win.document.getElementById('root'));
await act(async () => {
  root.render(react.createElement(page, { managedForm: form, remote: ctx.remote, statusApi, managerApi, t, locale: 'settings.mcp' }));
});
await act(async () => { await new Promise((done) => { setTimeout(done, 60); }); });

// Optional second state: one card section open, or the import panel, so the shot shows it.
const clickByLabel = async (label) => {
  const button = [...win.document.querySelectorAll('button')]
    .find((candidate) => candidate.textContent === label);
  if (button === undefined) throw new Error(`preview-card: no button labelled "${label}" in the rendered page`);
  await act(async () => { button.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); });
  await act(async () => { await new Promise((done) => { setTimeout(done, 80); }); });
};
const openIndex = process.argv.indexOf('--open');
const openPanel = openIndex === -1 ? undefined : process.argv[openIndex + 1];
if (process.argv.includes('--open-import') || openPanel === 'import') await clickByLabel('导入 JSON');
if (openPanel === 'tools') await clickByLabel('查看工具');
if (openPanel === 'resources') await clickByLabel('资源');
if (openPanel === 'skills') await clickByLabel('技能');

const markup = win.document.getElementById('root').innerHTML;
const injected = win.document.head.querySelector('style[data-dsh-mcp-settings-styles]')?.textContent ?? '';
await act(async () => { root.unmount(); });

const readStyle = (name) => readFileSync(join(harnessRoot, 'packages/client/ui-theme/src/styles', name), 'utf8');
const tokens = `${readStyle('base.css')}\n${readStyle('design-platform.css')}`;

/** Stand-ins for the host primitives and the settings pane; scoped to this preview only. */
const chrome = `
  /* Preview-only: approximate the host button, switch, field and pane chrome. */
  body { margin: 0; padding: 16px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
  .preview-frame { box-sizing: border-box; width: ${frameWidth}px; padding: 0; }
  .ui-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    box-sizing: border-box; height: 32px; padding: 0 12px;
    border: 1px solid transparent; border-radius: 8px; background: transparent;
    color: var(--dsw-alias-label-primary); font: 500 14px/1 var(--dsw-font-family); cursor: pointer;
  }
  .ui-button[data-size='sm'] { height: 28px; padding: 0 10px; font-size: 13px; }
  .ui-button[data-variant='outline'] { border-color: var(--dsw-alias-settings-card-stroke); background: var(--dsw-alias-bg-layer-1); }
  .ui-button[data-variant='primary'] { background: var(--dsw-alias-state-business-primary); color: #fff; }
  .ui-button[data-variant='ghost'] { color: var(--dsw-alias-label-secondary); }
  .ui-button:disabled { opacity: 0.45; cursor: default; }
  .ui-switch {
    display: inline-flex; align-items: center; box-sizing: border-box;
    width: 34px; height: 20px; padding: 2px; border-radius: 999px;
    background: color-mix(in srgb, var(--dsw-alias-label-secondary) 32%, transparent);
  }
  .ui-switch[data-checked='true'] { background: var(--dsw-alias-state-business-primary); justify-content: flex-end; }
  .ui-switch[data-disabled='true'] { opacity: 0.45; }
  .ui-switch-knob { width: 16px; height: 16px; border-radius: 999px; background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / 18%); }
  .preview-note { margin: 0 0 10px; color: var(--dsw-alias-label-secondary); font: 12px/1.5 var(--dsw-font-family); }
`;

const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<title>MCP settings preview</title>
<style>${tokens}</style>
<style>${chrome}</style>
<style>${injected}</style>
</head>
<body>
<div class="preview-frame">
  ${process.argv.includes('--no-note') ? '' : `<p class="preview-note">preview · fixture rows · frame ${frameWidth}px</p>`}
  <div id="root">${markup}</div>
</div>
</body>
</html>
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, 'utf8');
console.log(`preview-card: wrote ${outPath} (${html.length} chars, frame ${frameWidth}px)`);

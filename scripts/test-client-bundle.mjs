/**
 * Smoke test for the built Client bundle: does the shipped `client.js` actually register its
 * dictionaries, mount a component, and render the standing-cost line?
 *
 * The settings page normally runs inside the DSH Web host window, which desktop automation may not
 * drive. This test loads the same built artifact the package ships, feeds it the Cordis calls the
 * host makes (`apply`, `locale.register`, `slots.register`), and renders the registered component
 * in jsdom with a fake clock-free status facade. It asserts observable text, not internals.
 *
 * Usage:
 *   node scripts/test-client-bundle.mjs [--harness <deepseek-harness dir>]
 *
 * Requires the sibling DSH checkout for `react`, `react-dom`, and `jsdom`; the repository itself
 * does not depend on them. Exit code 0 = every assertion passed.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const harnessArg = process.argv.indexOf('--harness');
const harnessRoot = resolve(harnessArg === -1 ? 'E:/home/deepseek-harness' : process.argv[harnessArg + 1]);
const bundlePath = join(repoRoot, 'vendor/dsh-client-ui-settings-mcp/lib/client.js');

const requireFromRepo = createRequire(join(repoRoot, 'package.json'));
const requireFromHarness = createRequire(join(harnessRoot, 'package.json'));

/** Resolve a package from the repository, then the DSH checkout, then the pnpm store. */
function resolvePackage(specifier) {
  for (const loader of [requireFromRepo, requireFromHarness]) {
    try {
      return loader.resolve(specifier);
    } catch { /* try the next root */ }
  }
  const store = join(harnessRoot, 'node_modules/.pnpm');
  if (!existsSync(store)) return undefined;
  const wanted = specifier.split('/')[0];
  for (const entry of readdirSync(store)) {
    if (entry !== wanted && !entry.startsWith(`${wanted}@`)) continue;
    // Resolve through a loader anchored in the store entry so subpaths and export maps apply.
    const loader = createRequire(join(store, entry, 'node_modules', 'resolve-from-here.cjs'));
    try {
      return loader.resolve(specifier);
    } catch { /* try the next entry */ }
  }
  return undefined;
}

function load(specifier, { required = true } = {}) {
  const path = resolvePackage(specifier);
  if (path === undefined) {
    if (required) throw new Error(`test-client-bundle: cannot resolve ${specifier} (pass --harness)`);
    return undefined;
  }
  return createRequire(path)(path);
}

const react = load('react');
const { createRoot } = load('react-dom/client');
const { act } = load('react-dom/test-utils');
const { JSDOM } = load('jsdom');
const jsxRuntime = load('react/jsx-runtime');

/** One recorded failure; the process exits non-zero when any exist. */
const failures = [];
const check = (label, condition, detail) => {
  if (condition) {
    console.log(`PASS  ${label}`);
    return;
  }
  failures.push(`${label}${detail === undefined ? '' : ` — ${detail}`}`);
  console.log(`FAIL  ${label}${detail === undefined ? '' : ` — ${detail}`}`);
};

// ---------------------------------------------------------------------------------------------
// 1. Load the shipped bundle the way the DSH client loader does.
// ---------------------------------------------------------------------------------------------
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
const win = dom.window;
globalThis.window = win;
globalThis.document = win.document;
// Node 24 exposes `navigator` as a getter-only global; redefine it for react-dom's UA checks.
Object.defineProperty(globalThis, 'navigator', { value: win.navigator, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** UI primitives are host modules; render plain elements so text stays assertable. */
const primitives = {
  Button: ({ children, ...rest }) => react.createElement('button', { type: 'button', ...rest }, children),
  Switch: () => react.createElement('input', { type: 'checkbox', readOnly: true }),
  IconApiOutlineRegular: () => react.createElement('svg', { 'aria-hidden': 'true' }),
};

/** Unknown host modules resolve to an inert proxy so a missing stub cannot fake a passing text. */
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
  const resolved = load(specifier, { required: false });
  return resolved ?? inert;
};

let captured;
win.__ModuleLoader__ = { load: (record) => { captured = record; } };
new Function('window', 'require', readFileSync(bundlePath, 'utf8'))(win, shimRequire);
check('bundle registers a module record', captured !== undefined);
check('module identity is the root package', captured?.id === '@tinyforge/dsh-mcp-settings', captured?.id);

const exports = captured.factory(shimRequire);
check('exports inject list', Array.isArray(exports.inject), typeof exports.inject);
check('exports apply()', typeof exports.apply === 'function');

// ---------------------------------------------------------------------------------------------
// 2. Run apply() against a fake Cordis client context.
// ---------------------------------------------------------------------------------------------
/** Dictionaries the bundle registers per namespace. */
const dictionaries = {};
/** Sections the bundle registers on the settings slot, in registration order. */
const sections = [];

// `useSyncExternalStore` compares snapshots by identity, so the fake form must return one stable
// object; a fresh object per call would loop.
const stableSnapshot = {
  writable: true,
  value: {
    servers: [{
      id: 'server-1', serverName: 'demo', enabled: true, purpose: 'model-tools',
      transport: 'streamable-http', url: 'http://127.0.0.1:9/mcp', headers: {}, headerRefs: {},
    }],
  },
};
const settingsPage = {
  subscribe: () => () => {},
  getSnapshot: () => stableSnapshot,
  set: async () => true,
};

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
  configForms: {
    whileServed: (_ids, fn) => fn(),
    get: () => settingsPage,
  },
  slots: {
    inject: (_name, fn) => fn(),
    register: (definition, component) => {
      sections.push({
        id: definition.id,
        label: typeof definition.label === 'function' ? definition.label() : definition.label,
        component,
      });
      return () => {};
    },
  },
  get: (path) => (path === 'remote.mcpClientStatus' ? statusApi : undefined),
};

/** Live status the page polls; the tool list is swapped between the two render rounds below. */
let statusTools = [
  { name: 'abc', description: '' },
  { name: 'd', description: 'xyz' },
];
const statusApi = {
  list: async () => ({
    ok: true,
    value: [{
      id: 'status-1',
      managedServerId: 'server-1',
      serverName: 'demo',
      transport: 'streamable-http',
      state: 'connected',
      toolCount: statusTools.length,
      tools: statusTools,
    }],
  }),
};

await exports.apply(ctx);
check('registers settings.mcp dictionaries', dictionaries['settings.mcp'] !== undefined);
const styleElement = win.document.head.querySelector('style[data-dsh-mcp-settings-styles]');
check('installs its own stylesheet', styleElement !== null);
const sheetText = styleElement?.textContent ?? '';
check('stylesheet text is non-trivial', sheetText.length > 2000, `${sheetText.length} chars`);
// Every class the page applies must exist in the installed sheet, or it renders unstyled.
const sheetClasses = new Set([...sheetText.matchAll(/\.(oetn4G_[A-Za-z0-9_]+)/g)].map((match) => match[1]));
const pageSection = sections.find((section) => section.id === 'mcp');
check('registers the managed connections section', typeof pageSection?.component === 'function', sections.map((s) => s.id).join(', '));
check('registers the appearance section too', sections.some((section) => section.id === 'mcp-card-appearance'));

const en = dictionaries['settings.mcp']?.en ?? {};
const zh = dictionaries['settings.mcp']?.zh ?? {};
check('en has costInline', Object.hasOwn(en, 'managed.costInline'));
check('en has namesHint', Object.hasOwn(en, 'managed.tools.namesHint'));
check('zh has costInline', Object.hasOwn(zh, 'managed.costInline'));
check('zh has namesHint', Object.hasOwn(zh, 'managed.tools.namesHint'));

const missingInZh = Object.keys(en).filter((key) => !Object.hasOwn(zh, key));
check('zh covers every en key', missingInZh.length === 0, missingInZh.slice(0, 5).join(', '));

// ---------------------------------------------------------------------------------------------
// 3. Render the registered page and assert the cost line.
// ---------------------------------------------------------------------------------------------
const root = createRoot(win.document.getElementById('root'));
const t = (key, params) => ctx.locale.bind('settings.mcp')(key, params);
const Page = pageSection.component;
await act(async () => {
  root.render(react.createElement(Page, {
    managedForm: settingsPage,
    remote: ctx.remote,
    statusApi,
    managerApi: undefined,
    t,
    locale: 'settings.mcp',
  }));
});
await act(async () => { await new Promise((done) => { setTimeout(done, 30); }); });

const text = win.document.body.textContent.replace(/\s+/g, ' ');
check('page renders the server name', text.includes('demo'), text.slice(0, 160));
check('page renders the standing cost for 7 B', text.includes('7 B'), text.slice(0, 240));
check('page renders a 2-token estimate', text.includes('2 token'), text.slice(0, 240));
check('section label resolves', /MCP/.test(String(pageSection.label)), pageSection.label);
const costFragment = text.match(/[^ ]+ B · [^·]+token/);
console.log(`      rendered cost line: ${costFragment?.[0] ?? '(not found)'}`);

const pageClasses = [...win.document.querySelectorAll('[class]')]
  .flatMap((element) => String(element.getAttribute('class')).split(/\s+/))
  .filter((name) => name.startsWith('oetn4G_'));
const missingRules = pageClasses.filter((name) => !sheetClasses.has(name));
check('page applies at least one module class', pageClasses.length > 0, String(pageClasses.length));
check('every rendered class has a rule', missingRules.length === 0, [...new Set(missingRules)].slice(0, 5).join(', '));

await act(async () => { root.unmount(); });

// Negative control: a different tool list must move both numbers, so the assertions above cannot
// pass on a hard-coded string.
statusTools = [{ name: 'ab', description: 'cd' }];
const secondRoot = createRoot(win.document.getElementById('root'));
await act(async () => {
  secondRoot.render(react.createElement(Page, {
    managedForm: settingsPage,
    remote: ctx.remote,
    statusApi,
    managerApi: undefined,
    t,
    locale: 'settings.mcp',
  }));
});
await act(async () => { await new Promise((done) => { setTimeout(done, 30); }); });
const secondText = win.document.body.textContent.replace(/\s+/g, ' ');
check('cost follows a 4 B tool list', secondText.includes('4 B'), secondText.slice(0, 240));
check('previous estimate is gone', !secondText.includes('7 B'), secondText.slice(0, 240));
await act(async () => { secondRoot.unmount(); });

console.log(`\n${failures.length === 0 ? 'all assertions passed' : `${failures.length} assertion(s) failed`}`);
process.exitCode = failures.length === 0 ? 0 : 1;

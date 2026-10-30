const STORAGE_KEY = 'dsh-mcp-settings.v1';
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const CREDENTIAL_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const SENSITIVE_HEADER_PATTERN = /^(authorization|cookie|proxy-authorization|x-api-key)$/i;
const state = { servers: [], editingId: null };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  appMessage: $('#app-message'),
  cancelEdit: $('#cancel-edit'),
  clearDraft: $('#clear-draft'),
  draftCount: $('#draft-count'),
  editorTitle: $('#editor-title'),
  editingIndicator: $('#editing-indicator'),
  emptyState: $('#empty-state'),
  form: $('#server-form'),
  formErrors: $('#form-errors'),
  httpFields: $('#http-fields'),
  purpose: $('#purpose'),
  purposeNote: $('#purpose-note'),
  saveButton: $('.save-button'),
  serverId: $('#server-id'),
  serverList: $('#server-list'),
  stdioFields: $('#stdio-fields'),
  transport: $('#transport'),
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function showMessage(message, tone = '') {
  elements.appMessage.textContent = message;
  elements.appMessage.dataset.tone = tone;
}

function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `mcp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, servers: state.servers }));
    return true;
  } catch {
    showMessage('浏览器不允许保存本地草稿；当前页面仍可编辑和导出。', 'error');
    return false;
  }
}

function validateServer(server, existingServers = [], editingId = null) {
  const errors = [];
  const addError = (field, message) => errors.push({ field, message });

  if (typeof server.id !== 'string' || !server.id.trim()) addError('id', '服务 ID 不能为空。');
  if (typeof server.serverName !== 'string' || !SERVER_NAME_PATTERN.test(server.serverName)) {
    addError('serverName', '服务名称只能使用英文字母、数字、下划线和连字符，长度为 1–32。');
  }
  if (existingServers.some((item) => item.id !== editingId && item.id === server.id)) addError('id', '服务 ID 重复。');
  if (existingServers.some((item) => item.id !== editingId && item.serverName === server.serverName)) addError('serverName', '服务名称已存在。');
  if (!['model-tools', 'project-memory'].includes(server.purpose ?? 'model-tools')) addError('purpose', '请选择有效的服务用途。');
  if (!['streamable-http', 'stdio'].includes(server.transport)) addError('transport', '请选择有效的连接方式。');
  if (typeof server.enabled !== 'boolean') addError('enabled', '启用状态无效。');

  if (server.transport === 'streamable-http') {
    let url;
    if (typeof server.url === 'string' && server.url.trim()) {
      try { url = new URL(server.url); } catch { /* reported below */ }
    }
    const hostname = url?.hostname.toLowerCase() ?? '';
    const address = hostname.replace(/^\[|\]$/g, '');
    const loopback = hostname === 'localhost'
      || /^127(?:\.\d{1,3}){3}$/.test(address)
      || address === '::1'
      || /^::ffff:127(?:\.\d{1,3}){3}$/i.test(address);
    if (!url || url.username || url.password || !(url.protocol === 'https:' || (url.protocol === 'http:' && loopback))) {
      addError('url', '请输入 HTTPS 地址；HTTP 仅允许 localhost 或回环地址，且 URL 不能包含用户名或密码。');
    }

    if (!isRecord(server.headers ?? {})) addError('headers', '普通请求头必须是名称和值组成的对象。');
    if (!isRecord(server.headerRefs ?? {})) addError('headerRefs', '敏感请求头引用必须是名称和值组成的对象。');
    const headerNames = new Set();
    for (const [name, value] of Object.entries(server.headers ?? {})) {
      const normalized = name.toLowerCase();
      if (!HEADER_NAME_PATTERN.test(name) || typeof value !== 'string' || /[\r\n]/.test(value) || SENSITIVE_HEADER_PATTERN.test(name)) {
        addError('headers', `请求头“${name}”无效或属于敏感信息，请改用 credential 引用。`);
      }
      if (headerNames.has(normalized)) addError('headers', `请求头“${name}”重复。`);
      headerNames.add(normalized);
    }
    for (const [name, reference] of Object.entries(server.headerRefs ?? {})) {
      const normalized = name.toLowerCase();
      if (!HEADER_NAME_PATTERN.test(name)) addError('headerRefs', `请求头名称“${name}”无效。`);
      if (typeof reference !== 'string' || !CREDENTIAL_REF_PATTERN.test(reference)) addError('headerRefs', `“${name}”的 credential 引用名无效。`);
      if (headerNames.has(normalized)) addError('headerRefs', `请求头“${name}”与普通请求头重名。`);
      headerNames.add(normalized);
    }
  }

  if (server.transport === 'stdio') {
    if (typeof server.command !== 'string' || !server.command.trim()) addError('command', '启动命令不能为空。');
    if (!Array.isArray(server.args) || server.args.some((arg) => typeof arg !== 'string')) addError('args', '命令参数必须是字符串列表。');
    if (typeof server.cwd !== 'string') addError('cwd', '工作目录必须是文本。');
    if (!isRecord(server.envRefs ?? {})) addError('envRefs', '环境变量引用必须是名称和值组成的对象。');
    for (const [name, reference] of Object.entries(server.envRefs ?? {})) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) addError('envRefs', `环境变量名称“${name}”无效。`);
      if (typeof reference !== 'string' || !CREDENTIAL_REF_PATTERN.test(reference)) addError('envRefs', `“${name}”的 credential 引用名无效。`);
    }
  }

  return errors;
}

function validateServerList(servers) {
  if (!Array.isArray(servers)) return [{ field: 'servers', message: '服务器配置必须是列表。' }];
  const errors = [];
  const ids = new Set();
  const names = new Set();
  for (const server of servers) {
    if (!server || typeof server !== 'object' || Array.isArray(server)) {
      errors.push({ field: 'servers', message: '服务器列表包含无效条目。' });
      continue;
    }
    if (ids.has(server.id)) errors.push({ field: 'id', message: `服务 ID“${server.id}”重复。` });
    if (names.has(server.serverName)) errors.push({ field: 'serverName', message: `服务名称“${server.serverName}”重复。` });
    ids.add(server.id);
    names.add(server.serverName);
    errors.push(...validateServer(server, [], server.id));
  }
  return errors;
}

function normalizeServer(server) {
  const common = {
    id: server.id,
    serverName: server.serverName,
    enabled: server.enabled ?? true,
    purpose: server.purpose ?? 'model-tools',
    transport: server.transport,
  };
  if (server.transport === 'streamable-http') {
    return { ...common, url: server.url, headers: server.headers ?? {}, headerRefs: server.headerRefs ?? {} };
  }
  return {
    ...common,
    command: server.command,
    args: server.args ?? [],
    cwd: server.cwd ?? '',
    envRefs: server.envRefs ?? {},
  };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readStringMap(value, path, errors) {
  if (value === undefined) return {};
  if (!isRecord(value)) {
    errors.push({ field: path, message: `${path} 必须是名称和值组成的对象。` });
    return {};
  }
  const result = Object.create(null);
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string') errors.push({ field: path, message: `${path}.${key} 的值必须是文本。` });
    else result[key] = item;
  }
  return result;
}

function parseManagedServers(input) {
  const errors = [];
  const servers = [];
  for (const [index, server] of input.servers.entries()) {
    const path = `servers[${index}]`;
    if (!isRecord(server)) {
      errors.push({ field: path, message: `${path} 必须是服务配置对象。` });
      continue;
    }
    if (Object.hasOwn(server, 'env')) errors.push({ field: `${path}.env`, message: `${path}.env 包含明文环境变量；请改用 envRefs。` });
    if (server.transport === 'streamable-http' && Object.hasOwn(server, 'command')) errors.push({ field: path, message: `${path} 的 HTTP 配置不能包含 command。` });
    if (server.transport === 'stdio' && Object.hasOwn(server, 'url')) errors.push({ field: path, message: `${path} 的 stdio 配置不能包含 url。` });
    if (server.transport === 'stdio' && Object.hasOwn(server, 'headers')) errors.push({ field: `${path}.headers`, message: `${path}.headers 仅适用于 HTTP 服务。` });
    servers.push(normalizeServer(server));
  }
  errors.push(...validateServerList(servers));
  return { servers, errors };
}

function parseMcpServers(input) {
  const errors = [];
  if (isRecord(input) && Array.isArray(input.servers)) return parseManagedServers(input);
  if (!isRecord(input) || !isRecord(input.mcpServers)) {
    return { servers: [], errors: [{ field: 'mcpServers', message: 'JSON 顶层必须包含 mcpServers 对象。' }] };
  }

  const servers = [];
  for (const [serverName, config] of Object.entries(input.mcpServers)) {
    const path = `mcpServers.${serverName}`;
    if (!isRecord(config)) {
      errors.push({ field: path, message: `${path} 必须是服务配置对象。` });
      continue;
    }
    const hasUrl = Object.hasOwn(config, 'url');
    const hasCommand = Object.hasOwn(config, 'command');
    if (hasUrl === hasCommand) {
      errors.push({ field: path, message: `${path} 必须且只能配置 url 或 command 其中一种连接方式。` });
      continue;
    }

    const common = {
      id: createId(),
      serverName,
      enabled: config.enabled === undefined ? true : config.enabled,
      purpose: config.purpose ?? 'model-tools',
    };
    if (typeof common.enabled !== 'boolean') errors.push({ field: `${path}.enabled`, message: `${path}.enabled 必须是布尔值。` });
    if (!['model-tools', 'project-memory'].includes(common.purpose)) errors.push({ field: `${path}.purpose`, message: `${path}.purpose 必须是 model-tools 或 project-memory。` });

    if (hasUrl) {
      if (config.transport !== undefined && config.transport !== 'streamable-http') {
        errors.push({ field: `${path}.transport`, message: `${path}.transport 仅支持 streamable-http。` });
      }
      if (Object.hasOwn(config, 'env')) errors.push({ field: `${path}.env`, message: `${path}.env 包含明文环境变量；请先在 DSH credential store 保存值，再填写 envRefs。` });
      const headers = readStringMap(config.headers, `${path}.headers`, errors);
      const headerRefs = readStringMap(config.headerRefs, `${path}.headerRefs`, errors);
      servers.push({ ...common, transport: 'streamable-http', url: config.url, headers, headerRefs });
    } else {
      if (config.transport !== undefined && config.transport !== 'stdio') {
        errors.push({ field: `${path}.transport`, message: `${path}.transport 与 stdio command 不匹配。` });
      }
      if (Object.hasOwn(config, 'env')) errors.push({ field: `${path}.env`, message: `${path}.env 包含明文环境变量；请先在 DSH credential store 保存值，再填写 envRefs。` });
      if (Object.hasOwn(config, 'headers')) errors.push({ field: `${path}.headers`, message: `${path}.headers 仅适用于 HTTP 服务。` });
      const envRefs = readStringMap(config.envRefs, `${path}.envRefs`, errors);
      const args = config.args === undefined ? [] : config.args;
      if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) {
        errors.push({ field: `${path}.args`, message: `${path}.args 必须是字符串列表。` });
      }
      servers.push({ ...common, transport: 'stdio', command: config.command, args: Array.isArray(args) ? args : [], cwd: config.cwd ?? '', envRefs });
    }
  }

  errors.push(...validateServerList(servers));
  return { servers, errors };
}

function showImportErrors(errors) {
  const messages = errors.slice(0, 5).map((error) => `${error.field}: ${error.message}`);
  const remaining = errors.length - messages.length;
  showMessage(`导入失败：${messages.join('；')}${remaining > 0 ? `；另有 ${remaining} 项错误` : ''}`, 'error');
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadJson(filename, value) {
  downloadFile(filename, `${JSON.stringify(value, null, 2)}\n`, 'application/json;charset=utf-8');
}

async function importFile(file) {
  if (!file) return;
  try {
    const input = JSON.parse(await file.text());
    const result = parseMcpServers(input);
    if (result.errors.length) {
      showImportErrors(result.errors);
      return;
    }
    if (state.servers.length && !confirm('导入会替换当前全部本地草稿。是否继续？')) return;
    state.servers = result.servers;
    state.editingId = null;
    const saved = saveDraft();
    renderServerList();
    resetForm();
    if (saved) showMessage(`已导入 ${state.servers.length} 个服务到本地草稿。`, 'success');
  } catch {
    showMessage('无法读取 JSON 文件；请确认文件内容完整且格式正确。', 'error');
  }
}

function loadDraft() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const draft = JSON.parse(stored);
    if (draft?.version !== 1 || !Array.isArray(draft.servers)) throw new Error('unsupported draft');
    const servers = draft.servers.map((server) => isRecord(server) ? normalizeServer(server) : server);
    const errors = validateServerList(servers);
    if (errors.length) throw new Error('invalid draft');
    state.servers = servers;
  } catch {
    state.servers = [];
    showMessage('未能读取本地草稿，已保留空白编辑器。请检查浏览器存储权限或重新导入配置。', 'error');
  }
}

function mapRows(containerId, valueKind = 'value') {
  const result = Object.create(null);
  const errors = [];
  for (const row of $$('.key-value-row', document.getElementById(containerId))) {
    const key = $('[data-key]', row).value.trim();
    const value = $(`[data-${valueKind}]`, row).value;
    if (!key && !value) continue;
    if (Object.hasOwn(result, key)) {
      errors.push({ field: containerId, message: `“${key}”重复，请合并同名配置。` });
      continue;
    }
    result[key] = value.trim() === '' && valueKind === 'value' ? '' : value;
  }
  return { values: result, errors };
}

function renderMapRows(containerId, values, options = {}) {
  const container = document.getElementById(containerId);
  const { keyPlaceholder = '名称', valuePlaceholder = '值', valueKind = 'value' } = options;
  const entries = Object.entries(values ?? {});
  container.innerHTML = entries.map(([key, value]) => `
    <div class="key-value-row">
      <input data-key aria-label="${escapeHtml(keyPlaceholder)}" placeholder="${escapeHtml(keyPlaceholder)}" value="${escapeHtml(key)}" autocomplete="off">
      <input data-${valueKind} aria-label="${escapeHtml(valuePlaceholder)}" placeholder="${escapeHtml(valuePlaceholder)}" value="${escapeHtml(value)}" autocomplete="off">
      <button class="remove-row" type="button" data-remove-row aria-label="删除此行">×</button>
    </div>`).join('');
  if (!entries.length) container.innerHTML = '<p class="inline-empty">尚未添加。</p>';
}

function renderServerList() {
  const hasServers = state.servers.length > 0;
  elements.emptyState.hidden = hasServers;
  elements.serverList.innerHTML = state.servers.map((server) => {
    const selected = server.id === state.editingId;
    const connection = server.transport === 'stdio' ? 'stdio' : 'HTTP';
    const purpose = server.purpose === 'project-memory' ? '项目记忆' : '模型工具';
    const enabled = server.enabled ?? true;
    return `<article class="server-card${selected ? ' is-selected' : ''}" data-server-card="${escapeHtml(server.id)}">
      <button class="server-card-main" type="button" data-edit-server="${escapeHtml(server.id)}" aria-label="编辑 ${escapeHtml(server.serverName)}">
        <span class="server-name">${escapeHtml(server.serverName)}</span>
        <span class="server-meta">
          <span class="server-tag">${connection}</span>
          <span class="server-tag">${purpose}</span>
          <span class="server-tag ${enabled ? 'is-enabled' : 'is-disabled'}">${enabled ? '已启用' : '已停用'}</span>
        </span>
      </button>
      <span class="card-actions">
        <button class="small-action" type="button" data-toggle-server="${escapeHtml(server.id)}" aria-label="${enabled ? '停用' : '启用'} ${escapeHtml(server.serverName)}">${enabled ? '停用' : '启用'}</button>
        <button class="small-action danger" type="button" data-delete-server="${escapeHtml(server.id)}" aria-label="删除 ${escapeHtml(server.serverName)}">删除</button>
      </span>
    </article>`;
  }).join('');
  elements.draftCount.textContent = `${state.servers.length} 个服务`;
}

function setTransport(transport) {
  const isHttp = transport === 'streamable-http';
  elements.httpFields.hidden = !isHttp;
  elements.stdioFields.hidden = isHttp;
}

function updatePurposeNote() {
  elements.purposeNote.textContent = elements.purpose.value === 'project-memory'
    ? '需要已注册的项目记忆 consumer；此服务不会把工具发布给模型。'
    : '工具会注册到模型可用工具列表。';
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.serverId.value = '';
  elements.transport.value = 'streamable-http';
  elements.purpose.value = 'model-tools';
  $('#enabled').checked = true;
  $('#args').value = '[]';
  setTransport(elements.transport.value);
  updatePurposeNote();
  renderMapRows('headers-rows', {}, { keyPlaceholder: '请求头名称', valuePlaceholder: '普通请求头值' });
  renderMapRows('headerRefs-rows', {}, { keyPlaceholder: '请求头名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  renderMapRows('envRefs-rows', {}, { keyPlaceholder: '环境变量名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  elements.editorTitle.textContent = '添加服务';
  elements.editingIndicator.textContent = '新配置';
  elements.saveButton.textContent = '添加服务';
  elements.cancelEdit.hidden = true;
  hideFormErrors();
  renderServerList();
}

function editServer(id) {
  const server = state.servers.find((item) => item.id === id);
  if (!server) return;
  $('#url').value = '';
  $('#command').value = '';
  $('#args').value = '[]';
  $('#cwd').value = '';
  renderMapRows('headers-rows', {}, { keyPlaceholder: '请求头名称', valuePlaceholder: '普通请求头值' });
  renderMapRows('headerRefs-rows', {}, { keyPlaceholder: '请求头名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  renderMapRows('envRefs-rows', {}, { keyPlaceholder: '环境变量名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  state.editingId = id;
  elements.serverId.value = server.id;
  $('#server-name').value = server.serverName;
  elements.transport.value = server.transport;
  elements.purpose.value = server.purpose ?? 'model-tools';
  $('#enabled').checked = server.enabled ?? true;
  setTransport(server.transport);
  updatePurposeNote();
  if (server.transport === 'streamable-http') {
    $('#url').value = server.url;
    renderMapRows('headers-rows', server.headers, { keyPlaceholder: '请求头名称', valuePlaceholder: '普通请求头值' });
    renderMapRows('headerRefs-rows', server.headerRefs, { keyPlaceholder: '请求头名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  } else {
    $('#command').value = server.command;
    $('#args').value = JSON.stringify(server.args, null, 2);
    $('#cwd').value = server.cwd;
    renderMapRows('envRefs-rows', server.envRefs, { keyPlaceholder: '环境变量名称', valuePlaceholder: 'credential 引用名', valueKind: 'reference' });
  }
  elements.editorTitle.textContent = '编辑服务';
  elements.editingIndicator.textContent = '编辑中';
  elements.saveButton.textContent = '保存修改';
  elements.cancelEdit.hidden = false;
  hideFormErrors();
  renderServerList();
  $('#server-name').focus();
}

function formToServer() {
  const errors = [];
  const base = {
    id: elements.serverId.value || createId(),
    serverName: $('#server-name').value.trim(),
    enabled: $('#enabled').checked,
    purpose: elements.purpose.value,
    transport: elements.transport.value,
  };
  if (base.transport === 'streamable-http') {
    const headers = mapRows('headers-rows');
    const headerRefs = mapRows('headerRefs-rows', 'reference');
    errors.push(...headers.errors, ...headerRefs.errors);
    return {
      server: { ...base, url: $('#url').value.trim(), headers: headers.values, headerRefs: headerRefs.values },
      errors,
    };
  }
  let args = [];
  try {
    args = JSON.parse($('#args').value);
  } catch {
    errors.push({ field: 'args', message: '命令参数必须是有效的 JSON 字符串数组。' });
  }
  const envRefs = mapRows('envRefs-rows', 'reference');
  errors.push(...envRefs.errors);
  return {
    server: { ...base, command: $('#command').value.trim(), args, cwd: $('#cwd').value.trim(), envRefs: envRefs.values },
    errors,
  };
}

function showFormErrors(errors) {
  elements.formErrors.replaceChildren();
  const list = document.createElement('ul');
  for (const error of errors) {
    const item = document.createElement('li');
    item.textContent = error.message;
    list.append(item);
  }
  elements.formErrors.append(list);
  elements.formErrors.hidden = false;
  const focusTarget = errors.find((error) => error.field)?.field;
  const idMap = { serverName: 'server-name', transport: 'transport', purpose: 'purpose', url: 'url', command: 'command', args: 'args', cwd: 'cwd' };
  if (idMap[focusTarget]) document.getElementById(idMap[focusTarget]).focus();
}

function hideFormErrors() {
  elements.formErrors.hidden = true;
  elements.formErrors.replaceChildren();
}

function onSubmit(event) {
  event.preventDefault();
  const { server: next, errors: inputErrors } = formToServer();
  const errors = [...inputErrors, ...validateServer(next, state.servers, state.editingId)];
  if (errors.length) {
    showFormErrors(errors);
    return;
  }
  if (state.editingId) {
    state.servers = state.servers.map((server) => server.id === state.editingId ? next : server);
  } else {
    state.servers = [...state.servers, next];
  }
  const saved = saveDraft();
  renderServerList();
  resetForm();
  if (saved) showMessage('服务已保存到本地草稿。', 'success');
}

elements.form.addEventListener('submit', onSubmit);
elements.transport.addEventListener('change', () => setTransport(elements.transport.value));
elements.purpose.addEventListener('change', updatePurposeNote);
$('#add-server').addEventListener('click', resetForm);
$('#empty-add').addEventListener('click', () => { resetForm(); $('#server-name').focus(); });
elements.cancelEdit.addEventListener('click', resetForm);

elements.serverList.addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-edit-server]');
  if (editButton) return editServer(editButton.dataset.editServer);
  const toggleButton = event.target.closest('[data-toggle-server]');
  if (toggleButton) {
    const id = toggleButton.dataset.toggleServer;
    state.servers = state.servers.map((server) => server.id === id ? { ...server, enabled: !server.enabled } : server);
    if (state.editingId === id) $('#enabled').checked = state.servers.find((server) => server.id === id).enabled;
    const saved = saveDraft();
    renderServerList();
    if (saved) showMessage('服务状态已保存。', 'success');
    return;
  }
  const deleteButton = event.target.closest('[data-delete-server]');
  if (deleteButton) {
    const server = state.servers.find((item) => item.id === deleteButton.dataset.deleteServer);
    if (!server || !confirm(`删除“${server.serverName}”？此操作只影响本地草稿。`)) return;
    state.servers = state.servers.filter((item) => item.id !== server.id);
    if (state.editingId === server.id) resetForm();
    const saved = saveDraft();
    renderServerList();
    if (saved) showMessage('服务已从本地草稿删除。', 'success');
  }
});

elements.form.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add-row]');
  if (addButton) {
    const containerId = `${addButton.dataset.addRow}-rows`;
    const container = document.getElementById(containerId);
    if ($('.inline-empty', container)) container.replaceChildren();
    const valueKind = addButton.dataset.addRow === 'headers' ? 'value' : 'reference';
    const placeholders = addButton.dataset.addRow === 'headers'
      ? ['请求头名称', '普通请求头值']
      : addButton.dataset.addRow === 'envRefs'
        ? ['环境变量名称', 'credential 引用名']
        : ['请求头名称', 'credential 引用名'];
    const row = document.createElement('div');
    row.className = 'key-value-row';
    row.innerHTML = `<input data-key aria-label="${placeholders[0]}" placeholder="${placeholders[0]}" autocomplete="off"><input data-${valueKind} aria-label="${placeholders[1]}" placeholder="${placeholders[1]}" autocomplete="off"><button class="remove-row" type="button" data-remove-row aria-label="删除此行">×</button>`;
    container.append(row);
    $('[data-key]', row).focus();
    return;
  }
  const removeButton = event.target.closest('[data-remove-row]');
  if (removeButton) {
    const container = removeButton.closest('.key-value-list');
    removeButton.closest('.key-value-row').remove();
    if (!container.querySelector('.key-value-row')) container.innerHTML = '<p class="inline-empty">尚未添加。</p>';
  }
});

elements.clearDraft.addEventListener('click', () => {
  if (!confirm('清空所有本地 MCP 配置草稿？此操作不会影响已经应用到 DSH 的配置。')) return;
  state.servers = [];
  const saved = saveDraft();
  resetForm();
  renderServerList();
  if (saved) showMessage('本地草稿已清空。', 'success');
});

$('#import-file').addEventListener('change', async (event) => {
  const input = event.currentTarget;
  await importFile(input.files?.[0]);
  input.value = '';
});

$('#export-json').addEventListener('click', () => {
  downloadJson('dsh-mcp-servers.json', { servers: state.servers });
  showMessage('服务器 JSON 已导出。', 'success');
});

$('#export-patch').addEventListener('click', () => {
  const patch = [{
    id: 'mcp-server-manager',
    name: '@deepseek-ai/dsh-mcp-settings/managed',
    config: { servers: state.servers, checkTimeoutMs: 10000 },
  }];
  downloadFile('mcp-server-manager.patch.yml', `${JSON.stringify(patch, null, 2)}\n`, 'application/yaml;charset=utf-8');
  showMessage('Cordis profile patch 已导出。', 'success');
});

loadDraft();
renderServerList();
resetForm();

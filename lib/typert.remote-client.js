import { TYPERT_REMOTE as mcpClientRemote } from '../vendor/dsh-mcp-client/lib/typert.remote-client.js'

const packageName = '@deepseek-ai/dsh-mcp-settings'
const endpoint = 'mcpServerManager/check'
const descriptor = mcpClientRemote.descriptors.find(item => item.namespace === 'mcpServerManager' && item.method === 'check')
const method = mcpClientRemote.methods[endpoint]

if (descriptor === undefined || method === undefined) {
  throw new Error('MCP settings Remote metadata is missing mcpServerManager/check')
}

const TYPERT_REMOTE = {
  package: packageName,
  descriptors: [{ ...descriptor, id: `${packageName}#${endpoint}` }],
  methods: { [endpoint]: method },
}

export default TYPERT_REMOTE

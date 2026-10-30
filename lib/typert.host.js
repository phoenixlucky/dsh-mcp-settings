import { TYPERT as mcpClientTypert } from '../vendor/dsh-mcp-client/lib/typert.host.js'

const packageName = '@deepseek-ai/dsh-mcp-settings'
const manager = mcpClientTypert.model.services.find(service => service.key === 'mcpServerManager')
const invocation = mcpClientTypert.invocations.find(item => item.namespace === 'mcpServerManager' && item.method === 'check')

if (manager === undefined || invocation === undefined) {
  throw new Error('MCP settings Typert metadata is missing mcpServerManager/check')
}

export const TYPERT = {
  ...mcpClientTypert,
  package: packageName,
  model: { ...mcpClientTypert.model, services: [manager] },
  invocations: [{ ...invocation, id: `${packageName}#mcpServerManager/check` }],
}

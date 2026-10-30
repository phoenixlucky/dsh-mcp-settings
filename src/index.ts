import type { Context } from '@deepseek-ai/cordis'

/** Keep the package's Client companion active in profiles that install this bundle. */
export const name = 'mcp-settings-client'
export const inject: string[] = []

/** Host-side no-op; the Client companion provides the MCP settings page. */
export function apply(_ctx: Context): void {}

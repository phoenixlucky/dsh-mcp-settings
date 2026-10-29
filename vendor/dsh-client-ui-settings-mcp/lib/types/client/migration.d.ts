import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { ManagedMcpServer } from '@deepseek-ai/dsh-mcp-client';
interface CogneeLegacy {
    enabled?: boolean;
    endpoint?: string;
    credentialRef?: string;
}
interface ChromeLegacy {
    enabled?: boolean;
    url?: string;
}
interface ManagedSettings {
    servers?: ManagedMcpServer[];
}
/** Move legacy endpoint settings into the single managed MCP list.
 * @param cogneeForm - Legacy Cognee settings form.
 * @param chromeForm - Legacy Chrome settings form.
 * @param managedForm - Canonical managed server list form.
 * @returns Whether an old configuration was migrated.
 */
export declare function runLegacyMcpMigration(cogneeForm: ConfigForm<CogneeLegacy>, chromeForm: ConfigForm<ChromeLegacy>, managedForm: ConfigForm<ManagedSettings>): Promise<boolean>;
export {};
//# sourceMappingURL=migration.d.ts.map
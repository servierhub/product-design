import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export function resolveAgentPluginsScript(component, script) {
  const roots = [
    process.env.AGENT_PLUGINS_ROOT,
    path.join(os.homedir(), ".agents", "plugins", "agent-plugins"),
    // Compatibility with installations created before the plugin rename.
    path.join(os.homedir(), ".agents", "plugins", "open-agent-creators"),
  ].filter(Boolean);

  for (const root of roots) {
    const candidates = [
      path.join(root, "skills", component, "dist", "scripts", script),
      // Bundled agent-plugins installations keep runtime validators below the skill.
      path.join(root, "skills", component, "runtime", "dist", "scripts", script),
      path.join(root, "skills", "plugin-creator", "runtime", "related", component, "dist", "scripts", script),
    ];
    for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Unable to find agent-plugins ${component}/dist/scripts/${script}. ` +
      "Install agent-plugins or set AGENT_PLUGINS_ROOT to its plugin directory.",
  );
}

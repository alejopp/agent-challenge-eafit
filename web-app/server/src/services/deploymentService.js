import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { env } from "../lib/env.js";
import { ensureDir, writeJson } from "../lib/fs.js";
import { renderAgentPack } from "../templates/agentPackTemplate.js";
import { renderHelmValues } from "../templates/helmValuesTemplate.js";

function publishUrlFor(bot) {
  return `https://${bot.slug}.${env.baseDomain}`;
}

function releaseNameFor(bot) {
  return `${env.helmReleasePrefix}-${bot.slug}`.slice(0, 53);
}

function writeBundle(bot) {
  const targetDir = path.join(env.generatedDir, bot.slug);
  ensureDir(targetDir);

  const files = {
    agentPackPath: path.join(targetDir, "agent-pack.yaml"),
    valuesPath: path.join(targetDir, "values.yaml"),
    metadataPath: path.join(targetDir, "metadata.json"),
    publishScriptPath: path.join(targetDir, "publish.sh")
  };

  fs.writeFileSync(files.agentPackPath, renderAgentPack(bot, env));
  fs.writeFileSync(files.valuesPath, renderHelmValues(bot, env));
  writeJson(files.metadataPath, {
    botId: bot.id,
    slug: bot.slug,
    namespace: env.k8sNamespace,
    publicUrl: publishUrlFor(bot),
    generatedAt: new Date().toISOString(),
    selectedMcp: bot.mcpServers
  });

  fs.writeFileSync(
    files.publishScriptPath,
    `#!/usr/bin/env bash
set -euo pipefail
helm upgrade --install ${releaseNameFor(bot)} ${env.hologramChart} \\
  --version ${env.hologramChartVersion} \\
  --namespace ${env.k8sNamespace} \\
  --create-namespace \\
  -f "${files.valuesPath}"
`
  );

  return targetDir;
}

function runHelm(action, bot, valuesPath) {
  if (!env.enableK8sApply) {
    return { executed: false, message: "Dry run mode enabled. Deployment files were generated only." };
  }

  const commonArgs = [
    action,
    action === "upgrade" ? "--install" : releaseNameFor(bot),
    ...(action === "upgrade" ? [releaseNameFor(bot), env.hologramChart] : []),
    ...(action === "upgrade"
      ? ["--version", env.hologramChartVersion, "--namespace", env.k8sNamespace, "--create-namespace", "-f", valuesPath]
      : ["--namespace", env.k8sNamespace])
  ];

  const result = spawnSync("helm", commonArgs, {
    env: {
      ...process.env,
      KUBECONFIG: env.kubeconfigPath
    },
    encoding: "utf-8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Helm command failed");
  }

  return { executed: true, message: result.stdout.trim() };
}

export function publishBot(bot) {
  const bundlePath = writeBundle(bot);
  const valuesPath = path.join(bundlePath, "values.yaml");
  const commandResult = runHelm("upgrade", bot, valuesPath);
  return {
    publicUrl: publishUrlFor(bot),
    bundlePath,
    commandResult
  };
}

export function unpublishBot(bot) {
  const bundlePath = path.join(env.generatedDir, bot.slug);
  const commandResult = runHelm("uninstall", bot, path.join(bundlePath, "values.yaml"));
  return {
    publicUrl: "",
    bundlePath,
    commandResult
  };
}

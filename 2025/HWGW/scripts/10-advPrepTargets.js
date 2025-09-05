/**
 * Deploys a script with a specified number of threads across the puppet network.
 * @param {NS} ns
 * @param {string} script - The name of the script to deploy.
 * @param {number} threads - The total number of threads to launch.
 * @param {object[]} puppets - The array of puppet server data.
 * @param {string} target - The hostname of the target server.
 * @param {number} scriptRam - The RAM cost of the script being deployed.
 */
function deploy(ns, script, threads, puppets, target, scriptRam) {
  let threadsLaunched = 0;

  for (const puppet of puppets) {
    if (threadsLaunched >= threads) break;

    const availableRam = puppet.maxRam - ns.getServerUsedRam(puppet.hostname);
    const threadsOnPuppet = Math.floor(availableRam / scriptRam);

    if (threadsOnPuppet > 0) {
      const threadsToLaunch = Math.min(threadsOnPuppet, threads - threadsLaunched);
      ns.exec(script, puppet.hostname, threadsToLaunch, target);
      threadsLaunched += threadsToLaunch;
    }
  }
}

/** @param {NS} ns */
export async function main(ns) {
  const targetData = JSON.parse(ns.read('targetData.txt'));
  const puppets = JSON.parse(ns.read('puppetData.txt'));
  const weakenRam = ns.getScriptRam('weaken.js');
  const growRam = ns.getScriptRam('grow.js');

  ns.tprint(`INFO: Starting preparation of target: ${targetData.hostname}`);
  ns.exec('monitor.js', targetData.hostname);

  while (true) {
    const currentSecurity = ns.getServerSecurityLevel(targetData.hostname);
    const currentMoney = ns.getServerMoneyAvailable(targetData.hostname);

    // Condition 1: Security is above the minimum. Weaken it.
    if (currentSecurity > targetData.minDifficulty + 0.05) {
      const securityDiff = currentSecurity - targetData.minDifficulty;
      const weakenThreads = Math.ceil(securityDiff / 0.05);

      ns.tprint(`INFO: Security is high (${currentSecurity.toFixed(2)} / ${targetData.minDifficulty}). Launching ${weakenThreads} weaken threads.`);
      deploy(ns, 'weaken.js', weakenThreads, puppets, targetData.hostname, weakenRam);

      const weakenTime = ns.getWeakenTime(targetData.hostname);
      await ns.sleep(weakenTime + 200);
      continue;
    }

    // Condition 2: Money is below the maximum. Grow it.
    if (currentMoney < targetData.maxMoney * 0.99) {
      const moneyToGrow = currentMoney > 0 ? currentMoney : 1;
      const growthMultiplier = targetData.maxMoney / moneyToGrow;
      const growThreads = Math.ceil(ns.growthAnalyze(targetData.hostname, growthMultiplier));
      const weakenThreadsForGrow = Math.ceil(ns.growthAnalyzeSecurity(growThreads) / 0.05);

      ns.tprint(`INFO: Money is low. Launching ${growThreads} grow and ${weakenThreadsForGrow} weaken threads.`);
      deploy(ns, 'grow.js', growThreads, puppets, targetData.hostname, growRam);
      deploy(ns, 'weaken.js', weakenThreadsForGrow, puppets, targetData.hostname, weakenRam);

      const growTime = ns.getGrowTime(targetData.hostname);
      await ns.sleep(growTime + 200);
      continue;
    }

    // Condition 3: Server is prepped.
    ns.tprint(`SUCCESS: Target server ${targetData.hostname} is fully prepared.`);
    ns.tprint("INFO: Spawning HWGW batch manager...");
    ns.spawn('11-advPuppetMaster.js');
    return;
  }
}
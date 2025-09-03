/**
 * Deploys a script with a specified number of threads across the puppet network.
 * @param {NS} ns
 * @param {string} script - The name of the script to deploy.
 * @param {number} threads - The total number of threads to launch.
 * @param {object[]} puppets - The array of puppet server data.
 * @param {string} target - The hostname of the target server.
 */
function deploy(ns, script, threads, puppets, target) {
  let threadsLaunched = 0;
  const scriptRam = ns.getScriptRam(script);

  for (const puppet of puppets) {
    if (threadsLaunched >= threads) break;

    const availableRam = puppet.maxRam - ns.getServerUsedRam(puppet.hostname);
    if (availableRam <= 0) continue;

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
  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("getHackingLevel");
  ns.disableLog("getServerRequiredHackingLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");

  const targetData = JSON.parse(ns.read('targetData.txt'));
  const puppets = JSON.parse(ns.read('puppetData.txt'));

  const target = targetData.hostname;
  ns.tprint(`INFO: Starting HWGW batch manager for target: ${target}`);

  const hackRam = ns.getScriptRam('hack.js');
  const growRam = ns.getScriptRam('grow.js');
  const weakenRam = ns.getScriptRam('weaken.js');
  const buffer = 200; // 200ms gap between script finishes

  while (true) {
    let totalRam = 0;
    for (const puppet of puppets) {
      totalRam += puppet.maxRam - ns.getServerUsedRam(puppet.hostname);
    }
    const totalThreads = Math.floor(totalRam / weakenRam);

    if (totalThreads < 4) {
      ns.tprint(`WARN: Not enough free threads (${totalThreads}) to run a batch. Sleeping for 1 minute...`);
      await ns.sleep(60 * 1000);
      continue;
    }

    ns.tprint(`INFO: Calculating new batch with ${totalThreads} available threads.`);

    let bestBatch = null;
    for (let hackThreads = 1; hackThreads < totalThreads; hackThreads++) {
      // FIX STARTS HERE
      const moneyStolenPercent = ns.hackAnalyze(target) * hackThreads;
      // If the planned hack steals 100% or more, we can't grow it back in one batch.
      // This is our calculation limit, so we break and use the previous best batch.
      if (moneyStolenPercent >= 1) {
        break;
      }

      const growthMultiplier = 1 / (1 - moneyStolenPercent);
      // FIX ENDS HERE

      const hackSecurity = ns.hackAnalyzeSecurity(hackThreads);
      const weaken1Threads = Math.ceil(hackSecurity / 0.05);

      let growThreads = 0;
      if (growthMultiplier > 1) {
        growThreads = Math.ceil(ns.growthAnalyze(target, growthMultiplier));
      }

      const growSecurity = ns.growthAnalyzeSecurity(growThreads);
      const weaken2Threads = Math.ceil(growSecurity / 0.05);

      const batchRam = (hackThreads * hackRam) + (growThreads * growRam) + ((weaken1Threads + weaken2Threads) * weakenRam);
      const totalBatchThreads = hackThreads + weaken1Threads + growThreads + weaken2Threads;

      if (totalBatchThreads > totalThreads || batchRam > totalRam) {
        break;
      }

      bestBatch = { h: hackThreads, w1: weaken1Threads, g: growThreads, w2: weaken2Threads, ram: batchRam };
    }

    if (!bestBatch) {
      ns.tprint("WARN: Could not calculate a batch to fit available RAM. Sleeping for 1 minute...");
      await ns.sleep(60 * 1000);
      continue;
    }

    ns.tprint(`SUCCESS: Optimal batch found: H:${bestBatch.h}, W:${bestBatch.w1}, G:${bestBatch.g}, W:${bestBatch.w2}. RAM: ${bestBatch.ram.toFixed(2)}GB`);

    const weakenTime = ns.getWeakenTime(target);

    deploy(ns, 'weaken.js', bestBatch.w2, puppets, target);
    await ns.sleep(buffer);

    deploy(ns, 'grow.js', bestBatch.g, puppets, target);
    await ns.sleep(buffer);

    deploy(ns, 'weaken.js', bestBatch.w1, puppets, target);
    await ns.sleep(buffer);

    deploy(ns, 'hack.js', bestBatch.h, puppets, target);

    const batchDuration = weakenTime + (4 * buffer);
    ns.tprint(`INFO: Batch launched. Waiting for ${ns.tFormat(batchDuration)} to complete...`);
    await ns.sleep(batchDuration);
  }
}
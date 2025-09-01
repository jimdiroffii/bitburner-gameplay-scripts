/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting improved Puppeteer GWHW algorithm...");

  const target = "n00dles";
  const allPuppetData = JSON.parse(ns.read('puppet-data.txt'));

  // Security level changes per thread
  const WEAKEN_EFFECT = 0.05;
  const HACK_SEC_INCREASE = 0.002;
  const GROW_SEC_INCREASE = 0.1;

  // RAM costs
  const hackRam = ns.getScriptRam('hack.js');
  const growRam = ns.getScriptRam('grow.js');
  const weakenRam = ns.getScriptRam('weaken.js');

  // Helper function to calculate required threads dynamically
  function calculateRequiredThreads(action, target) {
    const currentSec = ns.getServerSecurityLevel(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);

    switch (action) {
      case 'weaken':
        const securityToReduce = currentSec - minSec;
        return Math.ceil(securityToReduce / WEAKEN_EFFECT);

      case 'grow':
        // Calculate grow threads needed to reach max money
        if (currentMoney === 0) {
          // If server has no money, we need a base amount to grow from
          return 1;
        }
        const growthNeeded = maxMoney / currentMoney;
        const threadsForGrowth = Math.ceil(ns.growthAnalyze(target, growthNeeded));

        // Also calculate weaken threads needed to counter the security increase
        const secIncreaseFromGrow = threadsForGrowth * GROW_SEC_INCREASE;
        const weakenForGrow = Math.ceil(secIncreaseFromGrow / WEAKEN_EFFECT);

        return { growThreads: threadsForGrowth, weakenThreads: weakenForGrow };

      case 'hack':
        // Calculate hack threads for ~75% of current money
        const hackPercent = 0.75;
        const hackThreads = Math.floor(ns.hackAnalyzeThreads(target, currentMoney * hackPercent));

        // Calculate weaken threads needed to counter the security increase
        const secIncreaseFromHack = hackThreads * HACK_SEC_INCREASE;
        const weakenForHack = Math.ceil(secIncreaseFromHack / WEAKEN_EFFECT);

        return { hackThreads: hackThreads, weakenThreads: weakenForHack };

      default:
        return 1;
    }
  }

  // Helper function to launch scripts with optimal thread distribution
  function launchScripts(scriptName, ramCost, totalThreads, target, puppets) {
    let remainingThreads = totalThreads;
    let launchedThreads = 0;

    for (const puppet of puppets) {
      if (remainingThreads <= 0) break;

      const availableRam = ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname);
      const maxThreadsOnPuppet = Math.floor(availableRam / ramCost);

      if (maxThreadsOnPuppet > 0) {
        const threadsToLaunch = Math.min(remainingThreads, maxThreadsOnPuppet);
        ns.exec(scriptName, puppet.hostname, threadsToLaunch, target);
        launchedThreads += threadsToLaunch;
        remainingThreads -= threadsToLaunch;

        ns.tprint(`INFO: Launched ${threadsToLaunch} ${scriptName} threads on ${puppet.hostname} for ${target}`);
      }
    }

    return launchedThreads;
  }

  // Helper function to get action priority based on server state
  function getActionPriority(target) {
    const currentSec = ns.getServerSecurityLevel(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);

    // Priority 1: Security is not at minimum - weaken first
    if (currentSec > minSec) {
      return 'weaken';
    }

    // Priority 2: Money is not at maximum - grow
    if (currentMoney < maxMoney) {
      return 'grow';
    }

    // Priority 3: Ready to hack
    return 'hack';
  }

  let programSelection = null;
  let cycleCount = 0;

  while (true) {
    cycleCount++;
    ns.tprint(`\nINFO: === Cycle ${cycleCount} ===`);
    ns.tprint(`INFO: ${target} - Security: ${ns.getServerSecurityLevel(target).toFixed(2)}/${ns.getServerMinSecurityLevel(target)} Money: $${ns.nFormat(ns.getServerMoneyAvailable(target), '0.00a')}/$${ns.nFormat(ns.getServerMaxMoney(target), '0.00a')}`);

    const action = getActionPriority(target);

    switch (action) {
      case 'weaken':
        const weakenThreads = calculateRequiredThreads('weaken', target);
        ns.tprint(`INFO: Weakening ${target} - need ${weakenThreads} threads`);
        launchScripts('weaken.js', weakenRam, weakenThreads, target, allPuppetData);
        programSelection = 'weaken';
        break;

      case 'grow':
        const growData = calculateRequiredThreads('grow', target);
        if (typeof growData === 'object') {
          ns.tprint(`INFO: Growing ${target} - need ${growData.growThreads} grow + ${growData.weakenThreads} weaken threads`);
          launchScripts('grow.js', growRam, growData.growThreads, target, allPuppetData);
          // Launch weaken threads to counter security increase
          if (growData.weakenThreads > 0) {
            launchScripts('weaken.js', weakenRam, growData.weakenThreads, target, allPuppetData);
          }
        } else {
          ns.tprint(`INFO: Growing ${target} - need ${growData} threads`);
          launchScripts('grow.js', growRam, growData, target, allPuppetData);
        }
        programSelection = 'grow';
        break;

      case 'hack':
        const hackData = calculateRequiredThreads('hack', target);
        ns.tprint(`INFO: Hacking ${target} - need ${hackData.hackThreads} hack + ${hackData.weakenThreads} weaken threads`);
        launchScripts('hack.js', hackRam, hackData.hackThreads, target, allPuppetData);
        // Launch weaken threads to counter security increase
        if (hackData.weakenThreads > 0) {
          launchScripts('weaken.js', weakenRam, hackData.weakenThreads, target, allPuppetData);
        }
        programSelection = 'hack';
        break;
    }

    // Wait for the operation to complete
    let sleepTime;
    switch (programSelection) {
      case 'grow':
        sleepTime = ns.getGrowTime(target) + 200; // Extra buffer for network delays
        break;
      case 'hack':
        sleepTime = ns.getHackTime(target) + 200;
        break;
      case 'weaken':
        sleepTime = ns.getWeakenTime(target) + 200;
        break;
      default:
        sleepTime = 1000;
    }

    ns.tprint(`INFO: Waiting ${ns.tFormat(sleepTime)} for ${programSelection} to complete...`);
    await ns.sleep(sleepTime);
  }
}
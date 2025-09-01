/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting enhanced Puppeteer...");
  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("getHackingLevel");
  ns.disableLog("getServerRequiredHackingLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");

  // Constants
  const FILE_PUPPETS = 'puppet-data.txt';
  const FILE_TARGETS = 'target-data.txt';

  // Security level changes per thread
  const WEAKEN_EFFECT = 0.05;
  const HACK_SEC_INCREASE = 0.002;
  const GROW_SEC_INCREASE = 0.1;

  // RAM costs
  const hackRam = ns.getScriptRam('hack.js');
  const growRam = ns.getScriptRam('grow.js');
  const weakenRam = ns.getScriptRam('weaken.js');

  // Load data files
  const allPuppetData = JSON.parse(ns.read(FILE_PUPPETS));
  const allTargetData = JSON.parse(ns.read(FILE_TARGETS));

  let use_home = false;
  let target = null;
  let targetInitialized = false;
  let cycleCount = 0;

  // Helper function to check exploit purchase opportunities
  function checkExploitPurchases() {
    const funds = ns.getServerMoneyAvailable('home');

    if (funds > 5e5 && !ns.fileExists('BruteSSH.exe', 'home')) {
      ns.tprint("UPDATE: Can purchase BruteSSH.exe ($500k)");
    }
    if (funds > 15e5 && !ns.fileExists('FTPCrack.exe', 'home')) {
      ns.tprint("UPDATE: Can purchase FTPCrack.exe ($1.5m)");
    }
    if (funds > 5e6 && !ns.fileExists('relaySMTP.exe', 'home')) {
      ns.tprint("UPDATE: Can purchase relaySMTP.exe ($5m)");
    }
    if (funds > 3e7 && !ns.fileExists('HTTPWorm.exe', 'home')) {
      ns.tprint("UPDATE: Can purchase HTTPWorm.exe ($30m)");
    }
    if (funds > 25e7 && !ns.fileExists('SQLInject.exe', 'home')) {
      ns.tprint("UPDATE: Can purchase SQLInject.exe ($250m)");
    }
  }

  // Helper function to select best target
  function selectBestTarget() {
    // Check if we have all 5 exploits
    const allExploits = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
    const hasAllExploits = allExploits.every(exploit => ns.fileExists(exploit, 'home'));

    if (!ns.hasTorRouter() || !hasAllExploits) {
      // Before TOR router OR before all exploits, always target n00dles for money
      return allTargetData.find(t => t.hostname === "n00dles");
    }

    // After TOR router AND all exploits, select best available target based on comprehensive score
    let bestTarget = null;
    let bestScore = 0;

    for (const targetData of allTargetData) {
      // Skip if we can't hack this target
      if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(targetData.hostname)) {
        continue;
      }

      // Calculate comprehensive score considering multiple factors
      const maxMoney = targetData.maxMoney;
      const hackTime = targetData.hackTime;
      const growthTime = targetData.growthTime;
      const growthParam = targetData.growthParam;

      // Money per second over full cycle (primary metric)
      const totalCycleTime = hackTime + growthTime;
      const cycleEfficiency = (maxMoney * 0.5) / totalCycleTime;

      // Growth bonus: reward good growth characteristics but don't let it dominate
      // Use square root to dampen the effect of very high growth params
      const growthBonus = Math.sqrt(growthParam) / growthTime;

      // Scale factor: reward higher max money servers to better utilize available threads
      // This helps us move beyond low-money targets like n00dles when we have more resources
      const scaleFactor = Math.log10(maxMoney / 1000000); // Log scale starting from 1M

      // Composite score: base cycle efficiency + moderate growth bonus + scale bonus
      const score = cycleEfficiency * (1 + (growthBonus * 0.1) + Math.max(0, scaleFactor * 0.2));

      if (score > bestScore) {
        bestScore = score;
        bestTarget = targetData;
      }

      //ns.tprint(`INFO: Target ${targetData.hostname} - Score: ${score.toFixed(2)}, Cycle Efficiency: ${cycleEfficiency.toFixed(2)}, Growth Bonus: ${growthBonus.toFixed(4)}, Scale Factor: ${scaleFactor.toFixed(2)}`);
    }

    return bestTarget || allTargetData.find(t => t.hostname === "n00dles"); // Fallback to n00dles
  }

  // Helper function to calculate required threads dynamically
  function calculateRequiredThreads(action, targetHostname) {
    const currentSec = ns.getServerSecurityLevel(targetHostname);
    const minSec = ns.getServerMinSecurityLevel(targetHostname);
    const currentMoney = ns.getServerMoneyAvailable(targetHostname);
    const maxMoney = ns.getServerMaxMoney(targetHostname);

    switch (action) {
      case 'weaken':
        const securityToReduce = currentSec - minSec;
        return Math.ceil(securityToReduce / WEAKEN_EFFECT);

      case 'grow':
        if (currentMoney === 0) {
          return 1;
        }
        const growthNeeded = maxMoney / currentMoney;
        const threadsForGrowth = Math.ceil(ns.growthAnalyze(targetHostname, growthNeeded));

        const secIncreaseFromGrow = threadsForGrowth * GROW_SEC_INCREASE;
        const weakenForGrow = Math.ceil(secIncreaseFromGrow / WEAKEN_EFFECT);

        return { growThreads: threadsForGrowth, weakenThreads: weakenForGrow };

      case 'hack':
        const hackPercent = 0.50; // Conservative 50% to avoid over-hacking
        const hackThreads = Math.floor(ns.hackAnalyzeThreads(targetHostname, currentMoney * hackPercent));

        const secIncreaseFromHack = hackThreads * HACK_SEC_INCREASE;
        const weakenForHack = Math.ceil(secIncreaseFromHack / WEAKEN_EFFECT);

        return { hackThreads: hackThreads, weakenThreads: weakenForHack };

      default:
        return 1;
    }
  }

  // Helper function to launch scripts with optimal thread distribution
  function launchScripts(scriptName, ramCost, totalThreads, targetHostname, puppets) {
    if (totalThreads <= 0) return 0;

    let remainingThreads = totalThreads;
    let launchedThreads = 0;

    for (const puppet of puppets) {
      if (remainingThreads <= 0) break;

      const availableRam = ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname);
      const maxThreadsOnPuppet = Math.floor(availableRam / ramCost);

      if (maxThreadsOnPuppet > 0) {
        const threadsToLaunch = Math.min(remainingThreads, maxThreadsOnPuppet);
        ns.exec(scriptName, puppet.hostname, threadsToLaunch, targetHostname);
        launchedThreads += threadsToLaunch;
        remainingThreads -= threadsToLaunch;

        ns.print(`INFO: Launched ${threadsToLaunch} ${scriptName} threads on ${puppet.hostname} for ${targetHostname}`);
      }
    }

    return launchedThreads;
  }

  // Helper function to get action priority based on server state
  function getActionPriority(targetHostname) {
    const currentSec = ns.getServerSecurityLevel(targetHostname);
    const minSec = ns.getServerMinSecurityLevel(targetHostname);
    const currentMoney = ns.getServerMoneyAvailable(targetHostname);
    const maxMoney = ns.getServerMaxMoney(targetHostname);

    // Priority 1: Security is not at minimum - weaken first
    if (currentSec > minSec + 0.1) { // Small buffer to avoid constant weakening
      return 'weaken';
    }

    // Priority 2: Money is significantly below maximum - grow
    if (currentMoney < maxMoney * 0.95) { // Grow until 95% of max money
      return 'grow';
    }

    // Priority 3: Ready to hack
    return 'hack';
  }

  // Main execution loop
  while (true) {
    cycleCount++;

    // if (!use_home) {
    //   if (ns.getServerMaxRam('home') > 8) {
    //     use_home = true;
    //     ns.tprint("UPDATE: Home server has sufficient RAM. Including in puppet pool.");
    //   }
    // }

    // Spawn server generator every 10th cycle
    if (cycleCount > 0 && cycleCount % 10 === 0) {
      ns.spawn("01-generateServers.js");
    }

    // Check for exploit purchase opportunities every cycle
    if (ns.hasTorRouter()) {
      checkExploitPurchases();
    }

    // Select target (n00dles until TOR router AND all exploits, then best available)
    target = selectBestTarget();

    if (!target) {
      ns.tprint("ERROR: No suitable target found!");
      await ns.sleep(10000);
      continue;
    }

    // Status reporting
    ns.tprint(`INFO: === Cycle ${cycleCount} - Target: ${target.hostname} ===`);
    ns.tprint(`INFO: Security: ${ns.getServerSecurityLevel(target.hostname).toFixed(2)}/${ns.getServerMinSecurityLevel(target.hostname)} Money: $${ns.formatNumber(ns.getServerMoneyAvailable(target.hostname), 2)}/$${ns.formatNumber(ns.getServerMaxMoney(target.hostname), 2)}`);

    // Initial setup message
    const allExploits = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
    const hasAllExploits = allExploits.every(exploit => ns.fileExists(exploit, 'home'));

    if (!ns.hasTorRouter()) {
      const currentMoney = ns.getServerMoneyAvailable("home");
      const torCost = 200000;
      ns.tprint(`INFO: Targeting ${target.hostname} until TOR router ($${ns.formatNumber(currentMoney, 2)}/$${ns.formatNumber(torCost, 2)})`);
    } else if (!hasAllExploits) {
      const currentMoney = ns.getServerMoneyAvailable("home");
      const exploitsOwned = allExploits.filter(exploit => ns.fileExists(exploit, 'home')).length;
      ns.tprint(`INFO: Targeting ${target.hostname} until all exploits purchased (${exploitsOwned}/5 owned)`);
    }

    // Determine action and execute
    const action = getActionPriority(target.hostname);
    let programSelection = null;

    switch (action) {
      case 'weaken':
        const weakenThreads = calculateRequiredThreads('weaken', target.hostname);
        if (weakenThreads > 0) {
          ns.print(`INFO: Weakening ${target.hostname} - need ${weakenThreads} threads`);
          launchScripts('weaken.js', weakenRam, weakenThreads, target.hostname, allPuppetData);
          programSelection = 'weaken';
        }
        break;

      case 'grow':
        const growData = calculateRequiredThreads('grow', target.hostname);
        if (typeof growData === 'object') {
          ns.print(`INFO: Growing ${target.hostname} - need ${growData.growThreads} grow + ${growData.weakenThreads} weaken threads`);
          launchScripts('grow.js', growRam, growData.growThreads, target.hostname, allPuppetData);
          if (growData.weakenThreads > 0) {
            launchScripts('weaken.js', weakenRam, growData.weakenThreads, target.hostname, allPuppetData);
          }
        } else {
          ns.print(`INFO: Growing ${target.hostname} - need ${growData} threads`);
          launchScripts('grow.js', growRam, growData, target.hostname, allPuppetData);
        }
        programSelection = 'grow';
        break;

      case 'hack':
        const hackData = calculateRequiredThreads('hack', target.hostname);
        if (hackData.hackThreads > 0) {
          ns.print(`INFO: Hacking ${target.hostname} - need ${hackData.hackThreads} hack + ${hackData.weakenThreads} weaken threads`);
          launchScripts('hack.js', hackRam, hackData.hackThreads, target.hostname, allPuppetData);
          if (hackData.weakenThreads > 0) {
            launchScripts('weaken.js', weakenRam, hackData.weakenThreads, target.hostname, allPuppetData);
          }
        }
        programSelection = 'hack';
        break;
    }

    // Wait for operation to complete
    let sleepTime = 1000; // Default sleep
    if (programSelection) {
      switch (programSelection) {
        case 'grow':
          sleepTime = (target.growthTime * 1000) + 200;
          break;
        case 'hack':
          sleepTime = (target.hackTime * 1000) + 200;
          break;
        case 'weaken':
          sleepTime = (target.weakenTime * 1000) + 200;
          break;
      }
    }

    await ns.sleep(sleepTime);
  }
}
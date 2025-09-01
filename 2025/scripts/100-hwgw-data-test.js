/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Collecting HWGW data for n00dles...");

  const target = "n00dles";

  // Basic server stats
  const maxMoney = ns.getServerMaxMoney(target);

  const serverData = {
    hostname: target,
    currentMoney: ns.getServerMoneyAvailable(target),
    maxMoney: maxMoney,
    currentSecurity: ns.getServerSecurityLevel(target),
    minSecurity: ns.getServerMinSecurityLevel(target),
    baseSecurity: ns.getServerBaseSecurityLevel(target),
    growth: ns.getServerGrowth(target),
    hackingLevel: ns.getHackingLevel(),
    requiredLevel: ns.getServerRequiredHackingLevel(target),

    // Timing data (in milliseconds)
    hackTime: ns.getHackTime(target),
    growTime: ns.getGrowTime(target),
    weakenTime: ns.getWeakenTime(target),

    // Timing data converted to seconds for easier reading
    hackTimeSeconds: ns.getHackTime(target) / 1000,
    growTimeSeconds: ns.getGrowTime(target) / 1000,
    weakenTimeSeconds: ns.getWeakenTime(target) / 1000,

    // Analysis functions
    hackChance: ns.hackAnalyzeChance(target),
    hackPercent: ns.hackAnalyze(target), // Money stolen per thread

    // Thread calculations for different money percentages
    threadsFor10Percent: ns.hackAnalyzeThreads(target, maxMoney * 0.1),
    threadsFor25Percent: ns.hackAnalyzeThreads(target, maxMoney * 0.25),
    threadsFor50Percent: ns.hackAnalyzeThreads(target, maxMoney * 0.5),
    threadsFor75Percent: ns.hackAnalyzeThreads(target, maxMoney * 0.75),

    // Growth analysis
    growthFor2x: ns.growthAnalyze(target, 2),
    growthFor5x: ns.growthAnalyze(target, 5),
    growthFor10x: ns.growthAnalyze(target, 10),

    // Security effects per thread
    hackSecurityIncrease: 0.002,
    growSecurityIncrease: 0.004,
    weakenSecurityDecrease: 0.05,

    // RAM costs
    hackRam: ns.getScriptRam('hack.js'),
    growRam: ns.getScriptRam('grow.js'),
    weakenRam: ns.getScriptRam('weaken.js'),

    // Home server info for testing
    homeMaxRam: ns.getServerMaxRam('home'),
    homeUsedRam: ns.getServerUsedRam('home'),
    homeAvailableRam: ns.getServerMaxRam('home') - ns.getServerUsedRam('home')
  };

  // Calculate some derived values
  serverData.moneyPercent = (serverData.currentMoney / serverData.maxMoney) * 100;
  serverData.securityAboveMin = serverData.currentSecurity - serverData.minSecurity;

  // Calculate weaken threads needed to counter different hack thread counts
  serverData.weakenThreadsFor10PercentHack = Math.ceil(serverData.threadsFor10Percent * serverData.hackSecurityIncrease / serverData.weakenSecurityDecrease);
  serverData.weakenThreadsFor25PercentHack = Math.ceil(serverData.threadsFor25Percent * serverData.hackSecurityIncrease / serverData.weakenSecurityDecrease);
  serverData.weakenThreadsFor50PercentHack = Math.ceil(serverData.threadsFor50Percent * serverData.hackSecurityIncrease / serverData.weakenSecurityDecrease);

  // Calculate example batch RAM requirements
  const exampleHackThreads = serverData.threadsFor50Percent;
  const exampleWeaken1Threads = Math.ceil(exampleHackThreads * 0.002 / 0.05);
  const exampleGrowThreads = Math.ceil(ns.growthAnalyze(target, 2)); // Restore from 50% to 100%
  const exampleWeaken2Threads = Math.ceil(exampleGrowThreads * 0.004 / 0.05);

  serverData.exampleBatch = {
    hackThreads: exampleHackThreads,
    weaken1Threads: exampleWeaken1Threads,
    growThreads: exampleGrowThreads,
    weaken2Threads: exampleWeaken2Threads,
    totalRamNeeded: (exampleHackThreads * serverData.hackRam) +
      (exampleWeaken1Threads * serverData.weakenRam) +
      (exampleGrowThreads * serverData.growRam) +
      (exampleWeaken2Threads * serverData.weakenRam),
    canRunOnHome: serverData.homeAvailableRam >=
      ((exampleHackThreads * serverData.hackRam) +
        (exampleWeaken1Threads * serverData.weakenRam) +
        (exampleGrowThreads * serverData.growRam) +
        (exampleWeaken2Threads * serverData.weakenRam))
  };

  // Save to file
  await ns.write('hwgw-test-data.txt', JSON.stringify(serverData, null, 2), 'w');

  ns.tprint("SUCCESS: HWGW test data saved to hwgw-test-data.txt");
  ns.tprint(`INFO: Target: ${target}`);
  ns.tprint(`INFO: Current Money: $${ns.formatNumber(serverData.currentMoney, 2)} / $${ns.formatNumber(serverData.maxMoney, 2)} (${serverData.moneyPercent.toFixed(1)}%)`);
  ns.tprint(`INFO: Security: ${serverData.currentSecurity.toFixed(2)} / ${serverData.minSecurity} (+${serverData.securityAboveMin.toFixed(2)})`);
  ns.tprint(`INFO: Timings - Hack: ${serverData.hackTimeSeconds}s, Grow: ${serverData.growTimeSeconds}s, Weaken: ${serverData.weakenTimeSeconds}s`);
  ns.tprint(`INFO: Example 50% hack batch needs ${serverData.exampleBatch.totalRamNeeded.toFixed(2)}GB RAM`);
  ns.tprint(`INFO: Can run on home: ${serverData.exampleBatch.canRunOnHome}`);
}
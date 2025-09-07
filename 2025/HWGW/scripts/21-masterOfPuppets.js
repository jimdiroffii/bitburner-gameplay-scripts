/**
 * A more robust deployment script that finds available RAM on the puppet network
 * and executes a script with the specified number of threads.
 * (This function is the more robust version from 11-advPuppetMaster.js)
 *
 * @param {NS} ns
 * @param {string} script - The name of the script to deploy.
 * @param {number} threads - The total number of threads to launch.
 * @param {object[]} puppets - The array of puppet server data.
 * @param  {...any} args - Arguments to pass to the script being executed.
 * @returns {boolean} - True if all threads were successfully launched, false otherwise.
 */
function deploy(ns, script, threads, puppets, ...args) {
  const scriptRam = ns.getScriptRam(script);
  let threadsRemaining = threads;

  // Create a snapshot of puppets with their current free RAM for this deployment
  const puppetSnapshots = puppets.map(p => ({
    hostname: p.hostname,
    freeRam: ns.getServerMaxRam(p.hostname) - ns.getServerUsedRam(p.hostname)
  })).sort((a, b) => b.freeRam - a.freeRam);

  for (const puppet of puppetSnapshots) {
    if (threadsRemaining <= 0) break;
    if (puppet.freeRam <= 0) continue;

    const threadsOnPuppet = Math.floor(puppet.freeRam / scriptRam);
    if (threadsOnPuppet <= 0) continue;

    const threadsToLaunch = Math.min(threadsOnPuppet, threadsRemaining);
    if (ns.exec(script, puppet.hostname, threadsToLaunch, ...args) > 0) {
      threadsRemaining -= threadsToLaunch;
    }
  }

  if (threadsRemaining > 0) {
    ns.print(`WARN: Could not deploy all threads for ${script}. ${threadsRemaining} of ${threads} remain.`);
    return false;
  }
  return true;
}

/**
 * The main orchestrator for the multi-target HWGW batching operation.
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();

  // --- CONFIGURATION ---
  const HACK_PERCENT = 0.25;
  const CYCLE_TIME = 1000;
  const BUFFER = 200;
  const HOME_RAM_RESERVE = 128; // Increased reserve for safety

  // --- SCRIPT SETUP ---
  const allTargets = JSON.parse(ns.read('rankedTargets.txt'));
  const allPuppets = JSON.parse(ns.read('puppetData.txt'));
  const SCRIPT_RAM = {
    hack: ns.getScriptRam('hack.js'),
    grow: ns.getScriptRam('grow.js'),
    weaken: ns.getScriptRam('weaken.js'),
  };

  // --- STATE TRACKING (for prep jobs ONLY) ---
  const activePrepJobs = {};

  ns.print(`INFO: Orchestrator starting.`);

  // --- MAIN ORCHESTRATION LOOP ---
  while (true) {
    // Clean up finished prep jobs
    for (const hostname in activePrepJobs) {
      if (Date.now() > activePrepJobs[hostname]) {
        delete activePrepJobs[hostname];
      }
    }

    // ** NEW: Create a RAM snapshot for this cycle's planning **
    const puppetRamSnapshot = allPuppets.map(p => ({
      hostname: p.hostname,
      freeRam: ns.getServerMaxRam(p.hostname) - ns.getServerUsedRam(p.hostname) - (p.hostname === 'home' ? HOME_RAM_RESERVE : 0),
    }));

    // --- Iterate Through Targets and Allocate RAM ---
    for (const target of allTargets) {
      const hostname = target.hostname;

      // If a prep job is running for this target, skip ALL actions for it.
      if (activePrepJobs[hostname]) {
        continue;
      }

      const weakenTime = ns.getWeakenTime(hostname);
      const growTime = ns.getGrowTime(hostname);
      const hackTime = ns.getHackTime(hostname);

      // --- A: PREP PHASE ---
      // This logic remains to prevent spamming prep jobs.
      const currentSecurity = ns.getServerSecurityLevel(hostname);
      if (currentSecurity > target.minDifficulty + 0.05) {
        const weakenThreads = Math.ceil((currentSecurity - target.minDifficulty) / 0.05);
        if (deploy(ns, 'weaken.js', weakenThreads, allPuppets, hostname, 0)) {
          activePrepJobs[hostname] = Date.now() + weakenTime + BUFFER;
          ns.print(`PREP: [${hostname}] Security high. Dispatched ${weakenThreads} weaken threads.`);
        }
        continue; // Continue to next target after dispatching a prep job
      }

      const currentMoney = ns.getServerMoneyAvailable(hostname);
      if (currentMoney < target.maxMoney * 0.99) {
        const growthMultiplier = Math.max(1, target.maxMoney / Math.max(currentMoney, 1));
        const growThreads = Math.ceil(ns.growthAnalyze(hostname, growthMultiplier));
        const weakenThreads = Math.ceil(ns.growthAnalyzeSecurity(growThreads) / 0.05);

        const growDelay = weakenTime - growTime + BUFFER;
        const weakenDelay = 0;

        if (deploy(ns, 'grow.js', growThreads, allPuppets, hostname, growDelay) && deploy(ns, 'weaken.js', weakenThreads, allPuppets, hostname, weakenDelay)) {
          activePrepJobs[hostname] = Date.now() + weakenTime + (BUFFER * 2);
          ns.print(`PREP: [${hostname}] Money low. Dispatched ${growThreads}G + ${weakenThreads}W threads.`);
        }
        continue;
      }

      // --- B: ATTACK PHASE (Concurrent Batches) ---
      // ** NEW: This section now allows for overlapping batches **
      const hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(hostname, target.maxMoney * HACK_PERCENT)));
      const weaken1Threads = Math.max(1, Math.ceil(ns.hackAnalyzeSecurity(hackThreads) / 0.05));
      const growThreads = Math.max(1, Math.ceil(ns.growthAnalyze(hostname, 1 / (1 - HACK_PERCENT))));
      const weaken2Threads = Math.max(1, Math.ceil(ns.growthAnalyzeSecurity(growThreads) / 0.05));
      const batchRam = (hackThreads * SCRIPT_RAM.hack) + (growThreads * SCRIPT_RAM.grow) + ((weaken1Threads + weaken2Threads) * SCRIPT_RAM.weaken);

      // ** NEW: RAM Simulation from 11-advPuppetMaster.js **
      let threadsToPlace = { h: hackThreads, w1: weaken1Threads, g: growThreads, w2: weaken2Threads };
      let ramCopy = JSON.parse(JSON.stringify(puppetRamSnapshot)); // Deep copy for simulation

      const canDeploy = (jobThreads, jobRam) => {
        for (const puppet of ramCopy) {
          if (jobThreads <= 0) break;
          const threadsOnPuppet = Math.floor(puppet.freeRam / jobRam);
          const threadsToAssign = Math.min(threadsOnPuppet, jobThreads);
          puppet.freeRam -= threadsToAssign * jobRam;
          jobThreads -= threadsToAssign;
        }
        return jobThreads <= 0;
      };

      if (canDeploy(threadsToPlace.h, SCRIPT_RAM.hack) && canDeploy(threadsToPlace.w1, SCRIPT_RAM.weaken) && canDeploy(threadsToPlace.g, SCRIPT_RAM.grow) && canDeploy(threadsToPlace.w2, SCRIPT_RAM.weaken)) {
        // RAM is available, let's deploy and update the REAL snapshot for this cycle
        puppetRamSnapshot.forEach((p, i) => p.freeRam = ramCopy[i].freeRam);

        // ** NEW: Integer delays **
        const delay_h = Math.round(weakenTime - hackTime - BUFFER);
        const delay_w1 = 0;
        const delay_g = Math.round(weakenTime - growTime + BUFFER);
        const delay_w2 = Math.round(BUFFER * 2);

        deploy(ns, 'hack.js', hackThreads, allPuppets, hostname, delay_h);
        deploy(ns, 'weaken.js', weaken1Threads, allPuppets, hostname, delay_w1);
        deploy(ns, 'grow.js', growThreads, allPuppets, hostname, delay_g);
        deploy(ns, 'weaken.js', weaken2Threads, allPuppets, hostname, delay_w2);

        ns.print(`SUCCESS: [${hostname}] Dispatched HWGW batch. RAM: ${ns.formatRam(batchRam)}`);
      }
    }

    await ns.sleep(CYCLE_TIME);
  }
}
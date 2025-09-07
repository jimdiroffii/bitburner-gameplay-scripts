/**
 * A more robust deployment script that finds available RAM on the puppet network
 * and executes a script with the specified number of threads.
 * 
 * Has been shown to reach $77.5B per second on a single target.
 * 
 * @param {NS} ns
 * @param {string} script - The name of the script to deploy.
 * @param {number} threads - The total number of threads to launch.
 * @param {object[]} puppets - The array of puppet server data.
 * @param  {...any} args - Arguments to pass to the script being executed (e.g., target, delay).
 * @returns {boolean} - True if all threads were successfully launched, false otherwise.
 */
function deploy(ns, script, threads, puppets, ...args) {
  const scriptRam = ns.getScriptRam(script);
  let threadsRemaining = threads;

  // Sort puppets by available RAM to use fuller servers first
  puppets.sort((a, b) => {
    const ramA = ns.getServerMaxRam(a.hostname) - ns.getServerUsedRam(a.hostname);
    const ramB = ns.getServerMaxRam(b.hostname) - ns.getServerUsedRam(b.hostname);
    return ramB - ramA;
  });

  for (const puppet of puppets) {
    if (threadsRemaining <= 0) break;

    const availableRam = ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname);
    if (availableRam <= 0) continue;

    const threadsOnPuppet = Math.floor(availableRam / scriptRam);
    if (threadsOnPuppet <= 0) continue;

    const threadsToLaunch = Math.min(threadsOnPuppet, threadsRemaining);

    // ns.exec returns PID > 0 on success, 0 on failure.
    if (ns.exec(script, puppet.hostname, threadsToLaunch, ...args) > 0) {
      threadsRemaining -= threadsToLaunch;
    }
  }

  if (threadsRemaining > 0) {
    ns.tprint(`WARN: Could not deploy all threads for ${script}. ${threadsRemaining} of ${threads} remain.`);
    return false;
  }

  return true;
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

  // --- CONFIGURATION ---
  const HACK_PERCENT = 0.25;
  const CYCLE_TIME = 1000;
  const BUFFER = 200;

  // --- SCRIPT SETUP ---
  const targetData = JSON.parse(ns.read('targetData.txt'));
  const puppets = JSON.parse(ns.read('puppetData.txt'));
  const target = targetData.hostname;

  // --- RESTART CONFIGURATION ---
  const initialHackingLevel = ns.getHackingLevel();

  ns.tprint(`INFO: Starting advanced HWGW batch manager for target: ${target}`);
  ns.tprint(`INFO: Batch target: ${HACK_PERCENT * 100}% of max money.`);
  ns.tprint(`INFO: Cycle time: ${CYCLE_TIME}ms.`);

  const SCRIPT_RAM = {
    hack: ns.getScriptRam('hack.js'),
    grow: ns.getScriptRam('grow.js'),
    weaken: ns.getScriptRam('weaken.js'),
  };

  // --- MAIN DISPATCH LOOP ---
  while (true) {
    // 1. **Calculate Batch Requirements**
    const hackThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, targetData.maxMoney * HACK_PERCENT)));
    const weaken1Threads = Math.max(1, Math.ceil(ns.hackAnalyzeSecurity(hackThreads) / 0.05));
    const growThreads = Math.max(1, Math.ceil(ns.growthAnalyze(target, 1 / (1 - HACK_PERCENT))));
    const weaken2Threads = Math.max(1, Math.ceil(ns.growthAnalyzeSecurity(growThreads) / 0.05));

    const batch = [
      { script: 'hack.js', threads: hackThreads, ram: SCRIPT_RAM.hack },
      { script: 'weaken.js', threads: weaken1Threads, ram: SCRIPT_RAM.weaken },
      { script: 'grow.js', threads: growThreads, ram: SCRIPT_RAM.grow },
      { script: 'weaken.js', threads: weaken2Threads, ram: SCRIPT_RAM.weaken },
    ];

    // 2. **Simulate Deployment to Check for RAM**
    let canDeploy = true;
    const puppetRamSnapshot = puppets.map(p => ({
      hostname: p.hostname,
      freeRam: ns.getServerMaxRam(p.hostname) - ns.getServerUsedRam(p.hostname),
    }));

    for (const job of batch) {
      let threadsToPlace = job.threads;
      for (const puppet of puppetRamSnapshot) {
        if (threadsToPlace <= 0) break;
        const threadsOnPuppet = Math.floor(puppet.freeRam / job.ram);
        if (threadsOnPuppet <= 0) continue;

        const threadsToAssign = Math.min(threadsOnPuppet, threadsToPlace);
        puppet.freeRam -= threadsToAssign * job.ram;
        threadsToPlace -= threadsToAssign;
      }

      if (threadsToPlace > 0) {
        canDeploy = false;
        break; // Not enough RAM for this job, so the whole batch fails.
      }
    }

    if (!canDeploy) {
      ns.print(`INFO: Not enough contiguous RAM for a full batch. Waiting...`);
      await ns.sleep(CYCLE_TIME);
      continue;
    }

    // 3. **Calculate Timings and Delays**
    const weakenTime = ns.getWeakenTime(target);
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);

    // Round all calculated delays to the nearest millisecond to ensure integer values.
    const delay_h = Math.round(weakenTime - hackTime - BUFFER);
    const delay_w1 = 0;
    const delay_g = Math.round(weakenTime - growTime + BUFFER);
    const delay_w2 = Math.round(BUFFER * 2);

    // 4. **Execute the Validated Batch**
    const batchRam = batch.reduce((total, job) => total + job.threads * job.ram, 0);
    ns.print(`SUCCESS: Launching batch. RAM: ${ns.formatRam(batchRam)} | H:${hackThreads} W:${weaken1Threads} G:${growThreads} W:${weaken2Threads}`);

    deploy(ns, 'hack.js', hackThreads, puppets, target, delay_h);
    deploy(ns, 'weaken.js', weaken1Threads, puppets, target, delay_w1);
    deploy(ns, 'grow.js', growThreads, puppets, target, delay_g);
    deploy(ns, 'weaken.js', weaken2Threads, puppets, target, delay_w2);

    // 5. **Wait for Next Cycle**
    await ns.sleep(CYCLE_TIME);

    // 6. **Check for Hacking Level Milestones to Restart Sequence**
    const currentHackingLevel = ns.getHackingLevel();
    let milestone = 0;

    if (currentHackingLevel >= 3000) {
      ns.tprint(`INFO: Hacking level is now ${currentHackingLevel}. Maximum milestone reached.`);
      ns.tprint("INFO: Increase RAM on home to continue progression.");
      continue; // No further restarts needed
    }
    else if (currentHackingLevel >= 2000) {
      milestone = 500;
    }
    else if (currentHackingLevel >= 1000) {
      milestone = 300;
    }
    else if (currentHackingLevel >= 300) {
      milestone = 100;
    }
    else if (currentHackingLevel >= 100) {
      milestone = 50;
    }
    else {
      milestone = 20;
    }

    if (currentHackingLevel >= initialHackingLevel + milestone) {
      ns.tprint(`INFO: Hacking level is now ${currentHackingLevel}. Restarting hack sequence...`);
      ns.killall('home', true);
      ns.spawn('00-start.js');
    }
  }
}
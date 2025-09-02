/**
 * A more robust deployment script that finds available RAM on the puppet network
 * and executes a script with the specified number of threads.
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
  ns.disableLog('getServerUsedRam');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('sleep');
  ns.disableLog('exec');

  // --- CONFIGURATION ---
  const HACK_PERCENT = 0.25;
  const CYCLE_TIME = 1000;
  const BUFFER = 200;
  // --- NEW: RESTART CONFIGURATION ---
  const RESTART_LEVEL_MILESTONE = 50; // Restart the whole process every 50 hacking levels.

  // --- SCRIPT SETUP ---
  const targetData = JSON.parse(ns.read('targetData.txt'));
  const puppets = JSON.parse(ns.read('puppetData.txt'));
  const target = targetData.hostname;
  // --- NEW: Store initial hacking level ---
  let initialHackingLevel = ns.getHackingLevel();

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
    // ... [The existing batch calculation and deployment logic remains unchanged] ...
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
        break;
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

    // --- NEW: DYNAMIC RESTART LOGIC ---
    const currentHackingLevel = ns.getHackingLevel();
    let milestone;

    if (currentHackingLevel < 100) {
      milestone = 20; // Check for a restart every 20 levels
    } else {
      milestone = 50; // After level 100, check every 50 levels
    }

    if (currentHackingLevel >= initialHackingLevel + milestone) {
      ns.tprint(`SUCCESS: Reached level milestone. Restarting framework to find better targets.`);
      ns.killall(true); // Kills all scripts on 'home'
      ns.spawn('00-start.js');
    }
  }
}
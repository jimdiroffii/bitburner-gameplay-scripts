/**
 * The fully autonomous orchestrator. It self-expands its fleet of servers
 * and dynamically selects the most profitable target.
 * @param {NS} ns 
 **/
export async function main(ns) {
  ns.tprint("INFO: Starting autonomous orchestrator...");

  // --- CONFIGURATION & INITIALIZATION ---
  const workerScripts = ['hack.js', 'grow.js', 'weaken.js'];
  // RAM OPTIMIZATION: Hardcode the script's name instead of using ns.getScriptName() to save 2GB of RAM.
  const ORCHESTRATOR_SCRIPT = "02-orchestrator.js";

  const allServerData = JSON.parse(ns.read('server-data.txt'));
  let fleet = [];
  let target = '';
  let cycleCounter = 0;
  const updateInterval = 600;

  // --- HELPER: Find the best target (unchanged) ---
  function updateTarget() {
    const myHackLevel = ns.getHackingLevel();
    const potentialTargets = allServerData
      .filter(server =>
        ns.hasRootAccess(server.hostname) &&
        server.reqHackLevel <= myHackLevel &&
        server.maxMoney > 0 &&
        server.hostname !== "home"
      )
      .map(server => {
        const weakenTime = ns.getWeakenTime(server.hostname);
        const score = server.maxMoney / weakenTime;
        return { hostname: server.hostname, score: score };
      });

    if (potentialTargets.length === 0) {
      if (target === '') ns.tprint("WARN: No valid targets found yet.");
      return;
    }
    potentialTargets.sort((a, b) => b.score - a.score);
    const newTarget = potentialTargets[0].hostname;
    if (target !== newTarget) {
      target = newTarget;
      ns.tprint(`SUCCESS: New optimal target acquired: ${target} (Value: ${potentialTargets[0].score.toFixed(3)})`);
    }
  }

  // --- HELPER: Find and root new servers, and build the fleet (unchanged) ---
  async function updateFleet() {
    const myHackLevel = ns.getHackingLevel();
    const newFleet = new Set();
    const portCrackers = [
      { file: "BruteSSH.exe", open: ns.brutessh },
      { file: "FTPCrack.exe", open: ns.ftpcrack },
      { file: "relaySMTP.exe", open: ns.relaysmtp },
      { file: "HTTPWorm.exe", open: ns.httpworm },
      { file: "SQLInject.exe", open: ns.sqlinject }
    ];
    const availableCrackers = portCrackers.filter(c => ns.fileExists(c.file, "home"));

    for (const server of allServerData) {
      if (!ns.hasRootAccess(server.hostname) && server.reqHackLevel <= myHackLevel) {
        if (server.portsRequired <= availableCrackers.length) {
          availableCrackers.slice(0, server.portsRequired).forEach(cracker => cracker.open(server.hostname));
          ns.nuke(server.hostname);
        }
      }
      if (ns.hasRootAccess(server.hostname)) {
        newFleet.add(server.hostname);
      }
    }

    const oldFleetSize = fleet.length;
    fleet = Array.from(newFleet);
    if (fleet.length > oldFleetSize) {
      ns.tprint(`SUCCESS: Fleet expanded. Total servers: ${fleet.length}`);
    }

    for (const host of fleet) {
      if (host !== "home") {
        await ns.scp(workerScripts, host, "home");
      }
    }
  }

  // --- INITIALIZE & MAIN LOOP ---
  await updateFleet();
  updateTarget();
  if (target === '') {
    ns.tprint("ERROR: Could not find an initial target. Exiting.");
    return;
  }

  while (true) {
    if (cycleCounter > 0 && cycleCounter % updateInterval === 0) {
      await updateFleet();
      updateTarget();
    }

    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
    let action;

    if (ns.getServerSecurityLevel(target) > securityThresh) {
      action = 'weaken.js';
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      action = 'grow.js';
    } else {
      action = 'hack.js';
    }

    // --- DEPLOYMENT LOGIC (Further Refined) ---
    for (const host of fleet) {
      // Check if the host is already running the correct script. If so, leave it.
      if (ns.isRunning(action, host, target)) {
        continue;
      }

      // --- Kill incorrect or old worker scripts ---
      if (host === "home") {
        // For home, we must kill only the worker scripts to avoid suicide.
        const runningWorkers = ns.ps(host).filter(p => workerScripts.includes(p.filename));
        for (const worker of runningWorkers) {
          ns.kill(worker.pid);
        }
      } else {
        // For remote servers, killing all scripts is safe and fast.
        ns.killall(host);
      }
      await ns.sleep(50);

      // --- Launch new script ---
      const scriptRam = ns.getScriptRam(action, host);
      let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

      if (host === "home") {
        availableRam -= 8; // Reserve 8GB on home for safety
      }

      if (scriptRam === 0 || availableRam < 0) continue;

      const threads = Math.floor(availableRam / scriptRam);
      if (threads > 0) {
        ns.exec(action, host, threads, target);
      }
    }

    await ns.sleep(1000);
    cycleCounter++;
  }
}
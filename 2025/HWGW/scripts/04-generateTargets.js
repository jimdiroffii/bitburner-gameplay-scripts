/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Reading server data to select best target...");
  const allServerData = JSON.parse(ns.read('serverData.txt'));
  const playerHackingLevel = ns.getHackingLevel();

  // --- Filter for all servers that are potential targets ---
  const potentialTargets = allServerData.filter(server =>
    !server.purchasedByPlayer &&         // Not one of our own servers
    server.hasAdminRights &&             // We have root access
    server.maxMoney > 0 &&               // It has money to steal
    server.requiredHackingLevel <= playerHackingLevel // We are skilled enough
  );

  if (potentialTargets.length === 0) {
    ns.tprint("ERROR: No valid targets found. Please wait until your hacking level increases or you gain more root access.");
    return;
  }

  // --- Score each potential target and find the best one ---
  let bestTarget = null;
  let maxScore = 0;

  for (const target of potentialTargets) {
    // Skip servers with a min security of 100, as they are special cases
    if (target.minDifficulty >= 100) continue;

    const score = (target.maxMoney * target.serverGrowth) / target.minDifficulty;
    if (score > maxScore) {
      maxScore = score;
      bestTarget = target;
    }
  }

  if (!bestTarget) {
    ns.tprint("ERROR: Could not determine a best target from the potential list.");
    return;
  }

  // Save the entire server object for our chosen target.
  // This gives the next scripts all the static data they need.
  await ns.write('targetData.txt', JSON.stringify(bestTarget, null, 2), 'w');

  ns.tprint(`SUCCESS: Best target selected: ${bestTarget.hostname} (Score: ${ns.formatNumber(maxScore, 0)})`);
  ns.tprint("INFO: Complete target data saved to targetData.txt.");
  ns.tprint("INFO: Spawning server preparation manager...");
  ns.spawn('05-prepTargets.js');
}

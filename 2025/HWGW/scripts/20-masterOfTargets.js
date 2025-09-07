/**
 * Scans all server data, scores potential targets, and saves a sorted list
 * of all viable targets to a file for the multi-target puppet master.
 * This is the advanced version of '04-generateTargets.js'.
 *
 * @param {NS} ns
 */
export async function main(ns) {
  ns.tprint("INFO: Reading server data to generate ranked target list...");
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

  // --- Score each potential target ---
  const scoredTargets = potentialTargets.map(target => {
    // We heavily penalize servers with a min security of 100, as they are special cases (like CSEC)
    // and aren't good for batching, but we don't want to filter them out completely.
    const difficultyFactor = target.minDifficulty < 100 ? target.minDifficulty : 1000;

    // The score is a heuristic for profitability: higher money and growth are good, high security is bad.
    const score = (target.maxMoney * target.serverGrowth) / difficultyFactor;
    return { ...target, score: score };
  });

  // --- Sort targets by score in descending order ---
  scoredTargets.sort((a, b) => b.score - a.score);

  // --- Save the ranked list to a new file ---
  await ns.write('rankedTargets.txt', JSON.stringify(scoredTargets, null, 2), 'w');

  ns.tprint(`SUCCESS: Ranked ${scoredTargets.length} potential targets.`);
  ns.tprint(`INFO: Top 3 targets:`);
  for (let i = 0; i < Math.min(3, scoredTargets.length); i++) {
    const t = scoredTargets[i];
    ns.tprint(`  ${i + 1}. ${t.hostname} (Score: ${ns.formatNumber(t.score, 0)})`);
  }
  ns.tprint("INFO: Full ranked list saved to rankedTargets.txt.");
  ns.tprint("INFO: Spawning multi-target puppet master...");

  ns.spawn('21-masterOfPuppets.js');
}
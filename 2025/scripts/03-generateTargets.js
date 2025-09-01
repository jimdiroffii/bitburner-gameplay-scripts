/** @param {NS} ns */

import { getTargets } from "utils.js";

export async function main(ns) {
  ns.tprint("INFO: Generating targets...");
  const targetNames = getTargets(ns);

  const targetData = targetNames.map(target => {
    return {
      hostname: target,
      baseSecurity: ns.getServerBaseSecurityLevel(target),
      growthParam: ns.getServerGrowth(target),
      maxMoney: ns.getServerMaxMoney(target),
      weakenTime: Math.floor(ns.getWeakenTime(target) / 1000),
      hackTime: Math.floor(ns.getHackTime(target) / 1000),
      growthTime: Math.floor(ns.getGrowTime(target) / 1000),
      growthMulti_2: Math.floor(ns.growthAnalyze(target, 2)),
      growthMulti_10: Math.floor(ns.growthAnalyze(target, 10)),
      growthMulti_100: Math.floor(ns.growthAnalyze(target, 100))
    }
  });

  await ns.write('target-data.txt', JSON.stringify(targetData, null, 2), 'w');
  ns.tprint("SUCCESS: Target data generated and saved to target-data.txt");
  ns.spawn("04-puppeteer.js");
}

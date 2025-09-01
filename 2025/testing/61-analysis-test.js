/** @param {NS} ns */

export async function main(ns) {
  ns.tprint("INFO: Starting analysis test...");

  const target = "foodnstuff";

  ns.tprint("INFO: Target set to " + target);
  ns.tprint("INFO: growthAnalyze 2x: " + ns.growthAnalyze(target, 2));
  ns.tprint("INFO: growthAnalyzeSecurity - 1 thread: " + ns.growthAnalyzeSecurity(1, target));

  ns.tprint("INFO: hackAnalyzeSecurity - 1 thread: " + ns.hackAnalyzeSecurity(1, target));
  ns.tprint("INFO: hackAnalyzeSecurity - 2 thread: " + ns.hackAnalyzeSecurity(2, target));


}
/** @param {NS} ns */

import { getTargets } from "./utils";

export async function main(ns) {
  ns.tprint("INFO: Generating targets...");
  let targetData = getTargets(ns);

  await ns.write('target-data.txt', JSON.stringify(targetData, null, 2), 'w');
}

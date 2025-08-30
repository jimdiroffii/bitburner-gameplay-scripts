/** @param {NS} ns */

import { getPuppets } from "./utils";

export async function main(ns) {
  ns.tprint("INFO: Generating puppets...");
  const puppetData = getPuppets(ns);

  await ns.write('puppet-data.txt', JSON.stringify(puppetData, null, 2), 'w');
}

/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting hacking program...");

  ns.spawn("01-generateServers.js");
}

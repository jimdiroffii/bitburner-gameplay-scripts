/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Initializing framework. Spawning server data generator in 10 seconds...");
  ns.spawn('01-generateServers.js');
}
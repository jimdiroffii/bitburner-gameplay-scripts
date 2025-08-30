/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting hacking program...");

  await ns.run("01-generateServers.js");
  await ns.sleep(200);

  await ns.run("02-generatePuppets.js");
  await ns.sleep(200);

  await ns.run("03-generateTargets.js");
  await ns.sleep(200);

  ns.spawn("04-puppeteer.js");
}

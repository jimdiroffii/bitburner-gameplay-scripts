/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script purchases a server, copies some scripts, and executes them.
 */

export async function main(ns) {
	let ram = 64;

	ns.purchaseServer("artemis0", ram);
	await ns.sleep(1000);
	await ns.scp("servers.txt", "artemis0", "home");
	await ns.scp("excludedServers.txt", "artemis0", "home");
	await ns.scp("hackAllServers.js", "artemis0", "home");
	await ns.sleep(1000);
	const maxRam = ns.getServerMaxRam("artemis0");
	const scriptRam = ns.getScriptRam("hackAllServers.js");
	const threads = Math.floor(maxRam / scriptRam);
	await ns.exec("hackAllServers.js", "artemis0", threads);
}

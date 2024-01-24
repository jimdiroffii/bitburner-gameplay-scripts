/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * Logic Controller
 **/
import * as lib from "lib.js";
export async function main(ns) {
	/**
	 * The objective is to control the logic for all game 
	 * functionality. This file is launched automatically
	 * on the schedule set by 00-mainLoop.js. 
	 */

	/**
	 * Get all available servers
	 */
	let allServers = await lib.scanNetwork(ns);
	//ns.tprint(allServers);

	/**
	 * Nuke servers (and copy hacks)
	 */
	await lib.nukeServers(ns, allServers);

	/**
	 * Find Host Servers
	 */
	let hosts = await lib.filterHosts(ns, allServers);
	//ns.tprint("hosts: " + hosts);


	/**
	 * Find Target servers
	 */
	let targets = [];
	if (ns.getHackingLevel() < 20) {
		targets = await lib.filterTargets(ns, allServers, true, 'n00dles');
	}
	else if (ns.getHackingLevel() < 150) {
		targets = await lib.filterTargets(ns, allServers, true, 'joesguns');
	}
	else if (ns.getHackingLevel() < 500) {
		targets = await lib.filterTargets(ns, allServers, false, '', 20, 20);
	}
	else {
		targets = await lib.filterTargets(ns, allServers);
	}
	//ns.tprint("targets: " + targets);

	/**
	 * Hacks
	 */
	await lib.executeBasicHacks(ns, hosts, targets);

	/**
	 * Buy Exploits
	 */
	await lib.buyExploits(ns);
}

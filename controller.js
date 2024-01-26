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
	 * Set isSingleTarget to true or false based on need
	 * If false, the min and max values are used
	 */
	const isSingleTarget = true;
	//const singleTarget = 'n00dles';
	const singleTarget = 'joesguns';
	const minHackLevel = 1;
	//const maxHackLevel = 100;
	const maxHackLevel = ns.getHackingLevel();

	/** 
	 * Choose whether or not to exclude the `home` server
	 * in the available script hosts
	 */
	const excludeHomeFromHosts = true;

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
	let hosts = await lib.filterHosts(ns, allServers, excludeHomeFromHosts);
	//ns.tprint("hosts: " + hosts);


	/**
	 * Find Target servers
	 */
	let targets = [];
	if (isSingleTarget) {
		targets = await lib.filterTargets(ns, allServers, isSingleTarget, singleTarget);
	}
	else {
		targets = await lib.filterTargets(ns, allServers, isSingleTarget, singleTarget, maxHackLevel, minHackLevel);
	}
	// if (ns.getHackingLevel() < 20) {
	// 	targets = await lib.filterTargets(ns, allServers, true, 'n00dles');
	// }
	// else if (ns.getHackingLevel() < 150) {
	// 	targets = await lib.filterTargets(ns, allServers, true, 'joesguns');
	// }
	// else if (ns.getHackingLevel() < 500) {
	// 	targets = await lib.filterTargets(ns, allServers, false, '', 20, 20);
	// }
	// else {
	// 	targets = await lib.filterTargets(ns, allServers);
	// }
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

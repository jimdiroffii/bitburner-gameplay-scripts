/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * Logic Controller
 **/
import * as lib from "lib.js";

export async function main(ns) {
	/****************************************************************************
	 * CONSTANTS FOR GAMEPLAY ADJUSTMENTS
	 ***************************************************************************/

	/**
	 * Set isSingleTarget to true or false based on need
	 * If false, the min and max values are used
	 */
	const isSingleTarget = false;
	//const isSingleTarget = true;

	//const singleTarget = 'n00dles';
	const singleTarget = 'joesguns';

	/**
	 * Set min and max hack level for range-based (non-single target) targeting
	 */
	//const minHackLevel = 1;
	const minHackLevel = 10;

	const maxHackLevel = 99;
	//const maxHackLevel = ns.getHackingLevel();

	/** 
	 * Purchased Server RAM Limits
	 * Useful for early game to limit purchases
	 * Useful for late game to avoid small base servers?
	 */
	const maxPurchasedServerRam = 1024; // Maximum RAM size in GB - Max Value: 1048576
	//const basePurchasedServerRam = 8; // Base ram size, Defaulted to 8 in function, but can be adjusted here

	/****************************************************************************
	 * FUNCTIONS
	 ***************************************************************************/

	/** 
	 * Choose whether or not to exclude the `home` server
	 * in the available script hosts
	 */
	const excludeHomeFromHosts = false;
	//const excludeHomeFromHosts = true;

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
	 * Sum all host memory data
	 */
	let ramData = {
		"totalRam": 0,
		"totalUsedRam": 0,
		"totalAvailableRam": 0,
		"weakenRam": 0,
		"growRam": 0,
		"hackRam": 0
	}
	ramData = await lib.getRamStatistics(ns, hosts);
	
	//ns.tprint("Total Ram: " + ramData.totalRam);
	//ns.tprint("Total Used: " + ramData.totalUsedRam);
	//ns.tprint("Available Ram: " + ramData.totalAvailableRam);
	//ns.tprint("Weaken Ram Usage: " + ramData.weakenRam);
	//ns.tprint("Grow Ram Usage: " + ramData.growRam);
	//ns.tprint("Hack Ram Usage: " + ramData.hackRam);

	/**
	 * Find Target servers
	 */
	let targets = [];
	if (isSingleTarget) {
		targets = await lib.filterTargets(ns, allServers, isSingleTarget, singleTarget);
	}
	else {
		targets = await lib.filterTargets(ns, allServers, undefined, undefined, maxHackLevel, minHackLevel);
	}
	//ns.tprint("targets: " + targets);

	/**
	 * Hacks
	 */
	//ns.tprint("Executing Hacks on: " + targets);
	//await lib.executeBasicHacks(ns, hosts, targets);
	await lib.executeBatchHacks(ns, hosts, targets, ramData);
	
	/**
	 * Buy Exploits
	 */
	await lib.buyExploits(ns);

	/**
	 * Purchase Servers
	 */
	await lib.purchaseServers(ns, maxPurchasedServerRam);
}

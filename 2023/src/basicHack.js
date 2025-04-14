/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script performs a basic set of hacks on the local server.
 */

export async function main(ns) {
	const server = ns.getHostname();

	const moneyThresh = ns.getServerMaxMoney(server) * 0.75;
	const securityThresh = ns.getServerMinSecurityLevel(server) + 5;

	while (true) {
		if (ns.getServerSecurityLevel(server) > securityThresh) {
			await ns.weaken(server);
		} else if (ns.getServerMoneyAvailable(server) < moneyThresh) {
			await ns.grow(server);
		} else {
			await ns.hack(server);
		}

		await ns.sleep(1000);
	}
}

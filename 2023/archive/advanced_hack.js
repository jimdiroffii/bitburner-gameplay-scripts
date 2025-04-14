/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["help", false]]);
	const hostname = args._[0];

	const moneyThresh = ns.getServerMaxMoney(hostname) * 0.75;
	const securityThresh = ns.getServerMinSecurityLevel(hostname) + 5;

	while (true) {
		if (ns.getServerSecurityLevel(hostname) > securityThresh) {
			await ns.weaken(hostname);
		} else if (ns.getServerMoneyAvailable(hostname) < moneyThresh) {
			await ns.grow(hostname);
		} else {
			await ns.hack(hostname);
		}
	}
}

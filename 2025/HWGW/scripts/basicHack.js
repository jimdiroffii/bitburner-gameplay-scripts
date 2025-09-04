/** @param {NS} ns */
export async function main(ns) {
	const hostname = ns.args[0];

	const moneyThresh = ns.getServerMaxMoney(hostname) * 0.75;
	const securityThresh = ns.getServerMinSecurityLevel(hostname) + 1;

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

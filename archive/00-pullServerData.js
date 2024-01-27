/** @param {NS} ns */
export async function main(ns) {
	let server = ns.getHostname();
	let serverData = ({
			hostname: server,
			maxMoney: ns.getServerMaxMoney(server),
			minSecurityLevel: ns.getServerMinSecurityLevel(server),
			moneyThresh: ns.getServerMaxMoney(server) * 0.75,
			securityThresh: ns.getServerMinSecurityLevel(server) + 5,
			target: false,
			currentSecurityLevel: ns.getServerSecurityLevel(server),
			requiredHackingLevel: ns.getServerRequiredHackingLevel(server),
			currentMoney: ns.getServerMoneyAvailable(server),
			hackable: (ns.getServerMoneyAvailable(server) > server.maxMoney * .25)
	});

	ns.tprint(serverData);
}
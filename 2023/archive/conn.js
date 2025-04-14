/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.scan();
	ns.tprint(servers);

	for (var i = 0; i < servers.length; i++) {
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(servers[i])) {
			continue;
		}

		var portsRequired = ns.getServerNumPortsRequired(servers[i]);

		if (portsRequired == 0) {
			if (!ns.hasRootAccess(servers[i])) {
				ns.nuke(servers[i]);
				ns.tprint("nuked that bitch");
			}
		}

		if (portsRequired == 1 && ns.fileExists("bruteSSH.exe", "home")) {
			if (!ns.hasRootAccess(servers[i])) {
				ns.brutessh(servers[i]);
				ns.nuke(servers[i]);
				ns.tprint("nuked that bitch");
			}
		}

		if (portsRequired == 2 && ns.fileExists("FTPCrack.exe", "home")) {
			if (!ns.hasRootAccess(servers[i])) {
				ns.brutessh(servers[i]);
				ns.ftpcrack(servers[i]);
				ns.nuke(servers[i]);
				ns.tprint("nuked that bitch");
			}
		}
	}
}

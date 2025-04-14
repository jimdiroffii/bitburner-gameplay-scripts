/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.scan();
	ns.tprint(servers);

	for (const server of servers) {
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server)) {
			continue;
		}

		if (ns.hasRootAccess(server)) {
			ns.tprint(server + " already rooted");
		}

		ns.tprint("hacking: " + server);

		var portsRequired = ns.getServerNumPortsRequired(server);

		if (portsRequired >= 1 && ns.fileExists("bruteSSH.exe", "home")) {
			ns.brutessh(server);
			ns.tprint("hacked ssh: " + server);
		}

		if (portsRequired >= 2 && ns.fileExists("FTPCrack.exe", "home")) {
			ns.ftpcrack(server);
			ns.tprint("hacked ftp: " + server);
		}

		ns.nuke(server);
		ns.tprint("nuked: " + server);
		// ns.singularity.connect(server);
		// const backdoorSuccess = await ns.installBackdoor();
		// ns.tprint("backdoored: " + server);
		// ns.connect("home");
	}
}

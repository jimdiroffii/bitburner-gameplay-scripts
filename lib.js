export async function scanNetwork(ns, startServer = 'home', foundServers = []) {
	let servers = ns.scan(startServer);
	for (let server of servers) {
			if (!foundServers.includes(server)) {
					foundServers.push(server);
					// Use await and pass the same foundServers array
					await scanNetwork(ns, server, foundServers); 
			}
	}
	return foundServers;
}

export async function nukeServers(ns, servers) {
	for (const server of servers) {
		if (
			//ns.hasRootAccess(server) ||
			server === 'home' || 
			server === 'darkweb' ||
			ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server)
		) {
			continue;
		}

		let portsRequired = ns.getServerNumPortsRequired(server);
		let portsOpened = 0;

		if (ns.fileExists("BruteSSH.exe", 'home')) { ns.brutessh(server); ++portsOpened; }
		if (ns.fileExists("FTPCrack.exe", 'home')) { ns.ftpcrack(server); ++portsOpened; }
		if (ns.fileExists("relaySMTP.exe", 'home')) { ns.relaysmtp(server); ++portsOpened; }
		if (ns.fileExists("HTTPWorm.exe", 'home')) { ns.httpworm(server); ++portsOpened; }
		if (ns.fileExists("SQLInject.exe", 'home')) { ns.sqlinject(server); ++portsOpened; }
		
		if (portsOpened < portsRequired) continue;

		ns.nuke(server);
		const files = ["weaken.js", "grow.js", "hack.js"];
		await (ns.scp(files, server, 'home'));
	}
}

export async function filterHosts(ns, servers) {
	let hosts = [];

	for (const server of servers) {
		if (
			ns.hasRootAccess(server) &&
			ns.getServerMaxRam(server) > 0 
		) {
			hosts.push(server);
		}
	}

	return hosts;
}

export async function filterTargets(ns, servers, singleTarget = false, thisTarget = '', max = ns.getHackingLevel(), min = 1) {
	/**
	 * Pass these values to set a variable hack level or target
	 * particular servers
	 */
	const maxHackLevel = max;
	const minHackLevel = min;
	
	//let singleTarget = true;
	//let thisTarget = "joesguns";
	
	let targets = [];

	for (const server of servers) {
		if ((!singleTarget &&
			ns.hasRootAccess(server) &&
			ns.getServerMaxMoney(server) > 0 &&
			ns.getServerRequiredHackingLevel(server) >= minHackLevel &&
			ns.getServerRequiredHackingLevel(server) <= maxHackLevel) ||
			(server === thisTarget)
		) {
				targets.push(server);
		}
	}

	return targets;
}

export async function executeBasicHacks(ns, hosts, targets) {
	let i = 0;
	for (const host of hosts) {
		//ns.tprint(host);
		await ns.sleep(3000);

		const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
		//ns.tprint(availableRam);

		var moneyThresh = ns.getServerMaxMoney(targets[i]) * 0.75;
		var securityThresh = ns.getServerMinSecurityLevel(targets[i]) + 5;

		if (ns.getServerSecurityLevel(targets[i]) > securityThresh) {
				//weaken(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('weaken.js'));
				//ns.tprint(threads);
				if (threads != 0) {
					ns.exec('weaken.js', host, threads, targets[i]);
				}
		} else if (ns.getServerMoneyAvailable(targets[i]) < moneyThresh) {
				//grow(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('grow.js'));
				//ns.tprint(threads);
				if (threads != 0) {
					ns.exec('grow.js', host, threads, targets[i]);
				}
		} else {
				//hack(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('hack.js'));
				//ns.tprint(threads);
				if (threads != 0) {
					ns.exec('hack.js', host, threads, targets[i]);
				}
		}
		
		i = i + 1;
		if (i >= targets.length) {
			i = 0;
		}
	}	
}

export async function buyExploits(ns) {
	const funds = ns.getServerMoneyAvailable('home');

	if (funds > 500000 && !ns.fileExists('BruteSSH.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase BruteSSH.exe");
	}
	if (funds > 1500000 && !ns.fileExists('FTPCrack.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase FTPCrack.exe");
	}
	if (funds > 5000000 && !ns.fileExists('relaySMTP.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase relaySMTP.exe");
	}
	if (funds > 30000000 && !ns.fileExists('HTTPWorm.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase HTTPWorm.exe");
	}
	if (funds > 250000000 && !ns.fileExists('SQLInject.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase SQLInject.exe");
	}
	if (funds > 500000 && !ns.fileExists('ServerProfiler.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase ServerProfiler.exe");
	}
	if (funds > 500000 && !ns.fileExists('DeepscanV1.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase DeepscanV1.exe");
	}
	if (funds > 25000000 && !ns.fileExists('DeepscanV2.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase DeepscanV2.exe");
	}
	if (funds > 1000000 && !ns.fileExists('AutoLink.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase AutoLink.exe");
	}
	if (funds > 5000000000 && !ns.fileExists('Formulas.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase Formulas.exe");
	}
}
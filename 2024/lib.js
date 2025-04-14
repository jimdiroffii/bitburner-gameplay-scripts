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

export async function filterHosts(ns, servers, excludeHome) {
	let hosts = [];

	for (const server of servers) {
		if (server === 'home' && excludeHome) {
			continue;
		}
		if (
			ns.hasRootAccess(server) &&
			ns.getServerMaxRam(server) > 0 
		) {
			hosts.push(server);
		}
	}

	return hosts;
}

export async function getRamStatistics(ns, hosts) {
	let stats = {
		"totalRam": 0,
		"totalUsedRam": 0,
		"totalAvailableRam": 0,
		"weakenRam": 0,
		"growRam": 0,
		"hackRam": 0
	}

	for (const host of hosts) {
		stats.totalRam += ns.getServerMaxRam(host);
		stats.totalUsedRam += ns.getServerUsedRam(host);
		stats.totalAvailableRam += ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
	}

	stats.weakenRam = ns.getScriptRam('weaken.js', 'home');
	stats.growRam = ns.getScriptRam('grow.js', 'home');
	stats.hackRam = ns.getScriptRam('hack.js', 'home');

	return stats;
}

export async function filterTargets(ns, servers, singleTarget = false, thisTarget = '', max = ns.getHackingLevel(), min = 1) {
	/**
	 * Pass these values to set a variable hack level or target
	 * particular servers
	 */
	const maxHackLevel = max;
	const minHackLevel = min;

	//ns.tprint("maxHackLevel: " + maxHackLevel);
	//ns.tprint("minHackLevel: " + minHackLevel);
	
	//let singleTarget = true;
	//let thisTarget = "joesguns";
	
	let targets = [];

	//ns.tprint("maxHackLevel: " + maxHackLevel);

	for (const server of servers) {
			const serverHackLevel = ns.getServerRequiredHackingLevel(server);
			//ns.tprint("Checking server: " + server + " with required hack level: " + serverHackLevel);
			//ns.tprint("Comparison result for " + server + ": " + (serverHackLevel <= maxHackLevel));

			if ((!singleTarget &&
					ns.hasRootAccess(server) &&
					ns.getServerMaxMoney(server) > 0 &&
					serverHackLevel >= minHackLevel &&
					serverHackLevel <= maxHackLevel) ||
					(server === thisTarget)
			) {
					ns.tprint("Adding to targets: " + server);
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

export async function executeBatchHacks(ns, hosts, targets, ramData) {
	for (let tIndex = 0; tIndex < targets.length; ++tIndex) {
		let hIndex = 0; // used for index looping the host lists instead of `for` loop
		let target = targets[tIndex];
		
		let money = ns.getServerMoneyAvailable(target);
		if (money === 0) money = 1;
		const maxMoney = ns.getServerMaxMoney(target);
		const minSec = ns.getServerMinSecurityLevel(target);
		const sec = ns.getServerSecurityLevel(target);
		
		let tMoneyPerc = (money / maxMoney * 100).toFixed(2);
		let tSec = (sec - minSec).toFixed(2);
		let tWeak = Math.ceil((sec - minSec) * 20);
		let tGrow = Math.ceil(ns.growthAnalyze(target, maxMoney / money));
		let tHack = Math.ceil(ns.hackAnalyzeThreads(target, money));

		//ns.tprint('target: ' + target);
		//ns.tprint(`avail money: ${tMoneyPerc}%`)
		//ns.tprint(`security: +${tSec}`);
		//ns.tprint(`weaken t=${tWeak}`);
		//ns.tprint(`grow t=${tGrow}`);
		//ns.tprint(`hack t=${tHack}`);

		let hasRun = false;
		while (!hasRun) {

			if (tSec > 1) {
				for (let host of hosts) {
				//hIndex = 0;
				//while (tWeak >= 1) {
					//if (ns.scriptRunning('weaken.js', host)) {
					if (ns.isRunning('weaken.js', host, target)) {
						continue;
					}

					//ns.tprint("host: " + host);
					//ns.tprint("tWeak: " + tWeak);

					// If we already used the necessary weaken threads
					if (tWeak < 1) {
						break;
					}
		
					// Get the available ram, and check there are at least 2 GB available
					let ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
					if (ram < 2) {
						continue;
					}
		
					// Calculate the threads that can be run, and ensure there is at least 1
					let threads = Math.ceil(ram / 2); // 2 comes from the script ram usage of hack, grow, weaken ~1.75 rounded up
					if (threads < 1) {
						continue;
					}
					
					// If we calculated more threads than necessary, correct the amount
					if (tWeak < threads) {
						threads = tWeak;
					}
		
					// Execute the program, and decrement the number of threads used
					ns.exec('weaken.js', host, threads, target);
					tWeak -= threads;

					if (hIndex >= hosts.length) {
						hIndex = 0
					}

					await ns.sleep(250);
				}

				hasRun = true;
			}
			else if (tMoneyPerc < 90.0) {
				for (let host of hosts) {
				//hIndex = 0;
				//while (tGrow >= 1) {
					// If this host is already this script
					//if (ns.scriptRunning('grow.js', host)) {
					if (ns.isRunning('grow.js', host, target)) {
						continue;
					}
					
					//ns.tprint("host: " + host);
					//ns.tprint("tGrow: " + tGrow);

					// If we already used all necessary growth threads
					if (tGrow < 1) {
						break;
					}

					// Get the available ram, and check there are at least 2 GB available
					let ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
					if (ram < 2) {
						continue;
					}

					// Calculate the threads that can be run, and ensure there is at least 1
					let threads = Math.ceil(ram / 2);
					if (threads < 1) {
						continue;
					}

					// If we calculated more threads than necessary, correct the amount
					if (tGrow < threads) {
						threads = tGrow;
					}

					// Execute the program, and decrement the number of threads used
					ns.exec('grow.js', host, threads, target);
					tGrow -= threads;

					if (hIndex >= hosts.length) {
						hIndex = 0
					}

					await ns.sleep(250);
				}

				hasRun = true;
			}
			else {
				// Aim for a 10% hack rate
				//ns.tprint("Hacking " + target)
				//ns.tprint("tHack: " + tHack);

				let tHack10 = Math.ceil((.10 * tHack));
				if (tHack10 === 1) {
					tHack10 = 2;
				}

				//ns.tprint("tHack10: " + tHack10 + "\n\n");

				for (let host of hosts) {
				//hIndex = 0;
				//while (tHack10 >= 1) {
					//if (ns.scriptRunning('hack.js', host)) {
					if (ns.isRunning('hack.js', host, target)) {
						continue;
					}

					//ns.tprint("host: " + host);
					//ns.tprint("tHack10: " + tHack10);

					// If we already used all necessary hack threads
					if (tHack10 < 1) {
						break;
					}

					// Get the available ram, and check there are at least 2 GB available
					let ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
					if (ram < 2) {
						continue;
					}

					// Calculate the threads that can be run, and ensure there is at least 1
					let threads = Math.ceil(ram / 2);
					if (threads < 1) {
						continue;
					}

					// If we calculated more threads than necessary, correct the amount
					if (tHack10 < threads) {
						threads = tHack10;
					}

					// Execute the program, and decrement the number of threads used
					ns.exec('hack.js', host, threads, target);
					tHack10 -= threads;

					if (hIndex >= hosts.length) {
						hIndex = 0
					}

					await ns.sleep(250);
				}

				hasRun = true;
			}
		}
	}
}

export async function buyExploits(ns) {
	const funds = ns.getServerMoneyAvailable('home');

	if (funds > 5e5 && !ns.fileExists('BruteSSH.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase BruteSSH.exe");
	}
	if (funds > 15e5 && !ns.fileExists('FTPCrack.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase FTPCrack.exe");
	}
	if (funds > 5e6 && !ns.fileExists('relaySMTP.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase relaySMTP.exe");
	}
	if (funds > 3e7 && !ns.fileExists('HTTPWorm.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase HTTPWorm.exe");
	}
	if (funds > 25e7 && !ns.fileExists('SQLInject.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase SQLInject.exe");
	}
	if (funds > 5e5 && !ns.fileExists('ServerProfiler.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase ServerProfiler.exe");
	}
	if (funds > 5e5 && !ns.fileExists('DeepscanV1.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase DeepscanV1.exe");
	}
	if (funds > 25e6 && !ns.fileExists('DeepscanV2.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase DeepscanV2.exe");
	}
	if (funds > 1e6 && !ns.fileExists('AutoLink.exe', 'home')) {
		ns.tprint("UPDATE: Can purchase AutoLink.exe");
	}
	if (funds > 5e9 && !ns.fileExists('Formulas.exe', 'home')) {
		//ns.tprint("UPDATE: Can purchase Formulas.exe");
	}
}

export async function purchaseServers(ns, maxRam = ns.getPurchasedServerMaxRam(), baseRam = 8) {
	const maxServers = ns.getPurchasedServerLimit();
	//const maxRam = 8192; // Maximum RAM size in GB
	const baseName = "slam-";
	//const baseRam = 8; // Starting RAM size in GB
	const purchasedServers = ns.getPurchasedServers();
	const costFactor = 4 // Determine how much money to leave in the bank, factor of server cost

	let upgradeReady = false;

	if (purchasedServers.length >= maxServers) {
		upgradeReady = true;
	}

	if (!upgradeReady) {
		for (let i = 0; i < maxServers; i++) {
			let hostname = `${baseName}${i.toString().padStart(3, '0')}`;
			if(ns.serverExists(hostname)) {
				continue;
			}

			let serverCost = ns.getPurchasedServerCost(baseRam);
			
			// Ensure enough funds are available
			if (ns.getServerMoneyAvailable('home') < serverCost * costFactor) {
				break; 
			}

			ns.purchaseServer(hostname, baseRam);
		}
	}
	else {
		for (const server of purchasedServers) {
			// stay under max ram
			const currentRam = ns.getServerMaxRam(server);
			if (currentRam >= maxRam) {
				continue;
			}
			
			// check next server ram
			const nextRam = currentRam * 2;
			if (nextRam > maxRam) {
				continue;
			}

			// check next server cost
			const serverCost = ns.getPurchasedServerCost(nextRam);
			if (ns.getServerMoneyAvailable('home') < serverCost * costFactor) {
					continue;
			}
			
			ns.killall(server);
			ns.deleteServer(server);
			ns.purchaseServer(server, nextRam);
		}
	}
}
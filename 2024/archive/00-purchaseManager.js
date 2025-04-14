/** @param {NS} ns */
export async function main(ns) {
	const maxServers = ns.getPurchasedServerLimit();
	const maxRam = 8192; // Maximum RAM size in GB
	const baseName = "slam-";
	const baseRam = 8; // Starting RAM size in GB
	const purchasedServers = ns.getPurchasedServers();

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
			if (ns.getServerMoneyAvailable('home') < serverCost * 4) {
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
			if (ns.getServerMoneyAvailable('home') < serverCost * 4) {
					continue;
			}
			
			ns.killall(server);
			ns.deleteServer(server);
			ns.purchaseServer(server, nextRam);
		}
	}
	
/*
	for (let i = 0; i < maxServers; i++) {
			let hostname = `${baseName}${i.toString().padStart(3, '0')}`;
			let serverExists = ns.serverExists(hostname);
			let currentRam = serverExists ? ns.getServerMaxRam(hostname) : 0;

			if (currentRam >= maxRam) {
					continue; // Skip if this server is already at max RAM
			}

			let nextRam = serverExists ? Math.min(currentRam * 2, maxRam) : baseRam;
			let serverCost = ns.getPurchasedServerCost(nextRam);

			if (ns.getServerMoneyAvailable('home') < serverCost * 2) {
					continue; // Ensure enough funds are available
			}

			if (serverExists && ns.ps(hostname).length > 0) {
					continue; // Wait if the server is running scripts
			}

			// Delete the old server if it exists and purchase or upgrade the server
			if (serverExists) {
					ns.killall(hostname);
					ns.deleteServer(hostname);
			}
			ns.purchaseServer(hostname, nextRam);
			break; // Exit loop after purchasing or upgrading one server
	}
*/
}

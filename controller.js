/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * Logic Controller
 **/
export async function main(ns) {
	/**
	 * The objective is to control the logic for all game 
	 * functionality. This file is launched automatically
	 * on the schedule set by 00-mainLoop.js. 
	 */

	let allServers = await scanNetwork(ns);
	for (let server of allServers) {
		ns.tprint(server);
	}

}

async function scanNetwork(ns, startServer = 'home', foundServers = []) {
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

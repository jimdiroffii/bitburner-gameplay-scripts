/** @param {NS} ns **/
export async function main(ns) {
	const allServers = await getAllServers(ns, 'home');
	for (const server of allServers) {
			const contractFiles = ns.ls(server, '.cct');
			for (const file of contractFiles) {
					ns.tprint(`Contract Found: ${file} on server ${server}`);
			}
	}
}

// Recursive function to get all accessible servers
async function getAllServers(ns, currentServer, visitedServers = new Set()) {
	if (visitedServers.has(currentServer)) {
			return [];
	}

	visitedServers.add(currentServer);
	let connectedServers = ns.scan(currentServer);
	let servers = [currentServer];

	for (let server of connectedServers) {
			servers = servers.concat(await getAllServers(ns, server, visitedServers));
	}

	return servers;
}

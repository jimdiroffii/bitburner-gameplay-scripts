/** @param {NS} ns */

export async function main(ns) {
	const allServerData = await ns.run("01-generateServers.js");
	await ns.run("02-generateTargets.js", allServerData);
}

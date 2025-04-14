/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script returns purchased server pricing.
 */

export async function main(ns) {
	let ram = 2;
	const maxRam = 1048576;
	while (ram <= maxRam) {
		const cost = ns.getPurchasedServerCost(ram);
		ns.write("serverPrices.txt", `${ram}GB: $${cost}\n`, "a");
		ram *= 2;
	}
}

/** @param {NS} ns */
export async function main(ns) {
    // args[0]: target server (string)
    // args[1]: delay in milliseconds (number)
    const target = ns.args[0];
    const delay = ns.args[1];

    if (delay > 0) {
        await ns.sleep(delay);
    }

    await ns.weaken(target);
}
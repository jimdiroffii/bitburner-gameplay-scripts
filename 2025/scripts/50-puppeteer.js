/** @param {NS} ns */

import { getPuppets } from "./utils";

export async function main(ns) {
    ns.tprint("INFO: Starting puppeteer...");

    // Initialization
    const workerScripts = ['hack.js', 'grow.js', 'weaken.js'];
    const allServerData = JSON.parse(ns.read('server-data.txt'));
    let puppets = getPuppets(ns);
    let target = '';
    const updateInterval = 1000;

    // Main loop
    while (true) {

    }
}
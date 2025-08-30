/**
 * The fully autonomous orchestrator. It self-expands its fleet of servers
 * and dynamically selects the most profitable target.
 * @param {NS} ns 
 **/
export async function main(ns) {
    // ns.disableLog('ALL');
    ns.tprint("INFO: Starting autonomous orchestrator...");

    // --- CONFIGURATION & INITIALIZATION ---
    const workerScripts = ['hack.js', 'grow.js', 'weaken.js'];
    const allServerData = JSON.parse(ns.read('server-data.txt'));
    let fleet = [];
    let target = '';
    let cycleCounter = 0;
    const updateInterval = 300;

    // --- HELPER: Find the best target ---
    function updateTarget() {
        const myHackLevel = ns.getHackingLevel();
        const potentialTargets = allServerData.filter(server =>
            ns.hasRootAccess(server.hostname) &&
            server.reqHackLevel <= myHackLevel &&
            server.maxMoney > 0 &&
            server.hostname !== "home"
        );
        if (potentialTargets.length === 0) {
            if (target === '') ns.tprint("WARN: No valid targets found yet.");
            return;
        }
        potentialTargets.sort((a, b) => b.maxMoney - a.maxMoney);
        const newTarget = potentialTargets[0].hostname;
        if (target !== newTarget) {
            target = newTarget;
            ns.tprint(`SUCCESS: New optimal target acquired: ${target}`);
        }
    }

    // --- HELPER: Find and root new servers, and build the fleet ---
    async function updateFleet() {
        const myHackLevel = ns.getHackingLevel();
        const newFleet = new Set();
        const portCrackers = [
            { file: "BruteSSH.exe", open: ns.brutessh },
            { file: "FTPCrack.exe", open: ns.ftpcrack },
            { file: "relaySMTP.exe", open: ns.relaysmtp },
            { file: "HTTPWorm.exe", open: ns.httpworm },
            { file: "SQLInject.exe", open: ns.sqlinject },
        ];
        const availableCrackers = portCrackers.filter(c => ns.fileExists(c.file, "home"));

        for (const server of allServerData) {
            // First, attempt to root any server that is not yet rooted.
            if (!ns.hasRootAccess(server.hostname) && server.reqHackLevel <= myHackLevel) {
                if (server.portsRequired <= availableCrackers.length) {
                    ns.print(`INFO: Attempting to root ${server.hostname}...`);
                    availableCrackers.forEach(cracker => cracker.open(server.hostname));
                    ns.nuke(server.hostname);
                }
            }
            // After attempting to root, check if we have access. If so, add to fleet.
            if (ns.hasRootAccess(server.hostname)) {
                newFleet.add(server.hostname);
            }
        }
        
        const oldFleetSize = fleet.length;
        fleet = Array.from(newFleet);
        if (fleet.length > oldFleetSize) {
            ns.tprint(`SUCCESS: Fleet expanded. Total servers: ${fleet.length}`);
        }
        
        // **FIX: Always ensure all fleet members have the worker scripts**
        for (const host of fleet) {
            // Check if scripts exist, and copy if they don't
            const missingScripts = workerScripts.filter(script => !ns.fileExists(script, host));
            if (missingScripts.length > 0) {
                await ns.scp(workerScripts, "home", host);
                ns.print(`INFO: Copied scripts to ${host}`);
            }
        }
    }

    // --- INITIALIZE & MAIN LOOP ---
    await updateFleet();
    updateTarget();
    if (target === '') {
        ns.tprint("ERROR: Could not find an initial target. Exiting.");
        return;
    }

    while (true) {
        if (cycleCounter > 0 && cycleCounter % updateInterval === 0) {
            await updateFleet();
            updateTarget();
        }

        const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
        const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
        let action;

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            action = 'weaken.js';
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            action = 'grow.js';
        } else {
            action = 'hack.js';
        }

        for (const host of fleet) {
            const scriptRam = ns.getScriptRam(action, host);
            if (scriptRam === 0) {
                ns.print(`WARN: ${action} not found on ${host}, skipping...`);
                continue;
            }
            const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
            const threads = Math.floor(availableRam / scriptRam);
            if (threads > 0) {
                const pid = ns.exec(action, host, threads, target);
                if (pid === 0) {
                    ns.print(`WARN: Failed to execute ${action} on ${host}`);
                }
            }
        }

        await ns.sleep(1000);
        cycleCounter++;
    }
}
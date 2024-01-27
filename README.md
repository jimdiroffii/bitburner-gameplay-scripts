# bitburner-gameplay-scripts

The scripts I used for playing BitBurner.

I played the Steam version of the game. All scripts are using the NS2 interface.

The goal of this project is to completely automate the Bitburner gameplay. This should be possible, and the game is built for automation. However, in previous playthroughs, there was always some part of my strategy that used manual actions. I would like to be able to launch a single script at the beginning of each game reset, and know that all actions are being handled appropriately without further intervention.

## Setup

I'm using `VS Code`, and the Bitburner extension, to edit files from an IDE and have them copied to the game automatically. From `BitBurner` file menu, may have to exit fullscreen, click on `API Server`. Enable the API Server and optionally enable autostart. Then copy the auth token. Using the command window in VS Code, use the `Add Auth Token` command and paste the key in. Then use the same command window to enable file watcher. I also setup a `test.js` with some content and use the command `Push All Files to the Game`. Once `test.js` shows up in game, the connection is complete.

## First Idea

My new idea is to begin with the simpliest program possible, a `while` loop that executes another file and then sleeps. This core file should rarely change, and merely launches another program. This allows the main program to be edited on the fly.

`00-mainLoop.js`

```javascript
/** @param {NS} ns */
export async function main(ns) {
 while (true) {
  await ns.sleep(10000);
 }
}
```

## Hack Programs

The three hack programs are `hack`, `grow` and `weaken`. I want to use these individually, so before I create any automation program, I want to get these created. Other than the main function, these scripts expect an argument with a target hostname.

`hack.js`

```javascript
/** @param {NS} ns */
export async function main(ns) {
 const target = args[0];
 await ns.hack(target);
}
```

>grow and weaken are respectively the same

## Server List

We need a list of servers. I've used both files to store the scan data in previous playthroughs, but I'm not sure we need that yet. Therefore, let's just setup a scan. We can recursively scan and retrieve all known servers in a list. We are also going to create the main automation program, which will launch the server list creation. External functions will be located in the lib file.

`controller.js`
`lib.js`

```javascript
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
```

## Nukes

With the list of all servers, we can run the `NUKE.exe` program and setup the rules for when the later programs and unlocked.

```javascript
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
```

## Execution Server List (hosts)

To make them distinct, I will call servers that can run scripts, `hosts`.

```javascript
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

```

## Target List

We need a list of targets. This will require several conditionals.

```javascript
export async function filterTargets(ns, servers, singleTarget = false, thisTarget = '') {
 /**
  *Change these values to set a variable hack level or target
  * particular servers
  */
 const minHackLevel = 1;
 const maxHackLevel = ns.getHackingLevel();
 
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
```

## Basic Hack

Finally time to attack a target. We need to loop our targets and make a decision on which hack function to run. We loop through both hosts and targets, relooping targets if we haven't run out of hosts yet.

```javascript
export async function executeBasicHacks(ns, hosts, targets) {
 let i = 0;
 for (const host of hosts) {
  //ns.print(host);
  const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  var moneyThresh = ns.getServerMaxMoney(targets[i]) * 0.75;
  var securityThresh = ns.getServerMinSecurityLevel(targets[i]) + 5;

  if (ns.getServerSecurityLevel(targets[i]) > securityThresh) {
    //weaken(targets[i]);
    const threads = Math.floor(availableRam / ns.getScriptRam('weaken.js'));
    if (threads != 0) {
     ns.exec('weaken.js', host, threads, targets[i]);
    }
  } else if (ns.getServerMoneyAvailable(targets[i]) < moneyThresh) {
    //grow(targets[i]);
    const threads = Math.floor(availableRam / ns.getScriptRam('grow.js'));
    if (threads != 0) {
     ns.exec('grow.js', host, threads, targets[i]);
    }
  } else {
    //hack(targets[i]);
    const threads = Math.floor(availableRam / ns.getScriptRam('hack.js'));
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
```

## The Controller

This isn't so much of a controller yet, but is just logically progressing through our functions to ensure everything is working as expected. The main loop continually launches this file, so a while loop isn't necessary.

```javascript
/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * Logic Controller
 **/
import * as lib from "lib.js";
export async function main(ns) {
 /**
  * The objective is to control the logic for all game 
  * functionality. This file is launched automatically
  * on the schedule set by 00-mainLoop.js. 
  */

 /**
  * Get all available servers
  */
 let allServers = await lib.scanNetwork(ns);
 //ns.tprint(allServers);

 /**
  * Nuke servers (and copy hacks)
  */
 await lib.nukeServers(ns, allServers);

 /**
  * Find Host Servers
  */
 let hosts = await lib.filterHosts(ns, allServers);

 /**
  * Find Target servers, change strategy per level
  */
 let targets = [];
 if (ns.getHackingLevel() < 20) {
  targets = await lib.filterTargets(ns, allServers, true, 'n00dles');
 }
 else if (ns.getHackingLevel() < 200) {
  targets = await lib.filterTargets(ns, allServers, true, 'joesguns');
 }
 else {
  targets = await lib.filterTargets(ns, allServer);
 }
 //ns.tprint(targets);

 /**
  * Hacks
  */
 await lib.executeBasicHacks(ns, hosts, targets);
}
```

## Darkweb

Accessing the darkweb server is necessary to speed up the process of getting additional exploits. Purchasing the darkweb router is the first manual task in the game, outside of running the first script. Buying the darkweb server can be automated later in the game. For now, I'll purchase `BruteSSH.exe` manually.

## Factions

Factions is another aspect that can't be automated at the early game. To join up with `CyberSec` and start earning some faction rep, we need to go find them. Using `scan-analyze 3` should populate the CSEC server. `BruteSSH` is required to have been bought first. By the time I find `CSEC`, the automated controller should have already found and nuked the server. After connecting to `CSEC`, running `backdoor`, and joining the faction, we can start carrying out hacking contracts with them.

`Sector-12`, if you remain in the home city, should contact soon as well.

Pay attention to the faction rep, as the amounts are quite low at the beginning of the game for augmentation installation.

## Variable Targeting

After level 150, we should have some money, exploits, and many nuked servers running scripts. It is time to split up the workload. Filtering based on hacking level has been added. It requires the modification of the script variables to modify the range of servers being targeted. Once the level is high enough, we can target all servers.

```javascript
let targets = [];
 if (ns.getHackingLevel() < 20) {
  targets = await lib.filterTargets(ns, allServers, true, 'n00dles');
 }
 else if (ns.getHackingLevel() < 150) {
  targets = await lib.filterTargets(ns, allServers, true, 'joesguns');
 }
 else if (ns.getHackingLevel() < 500) {
  targets = await lib.filterTargets(ns, allServers, false, '', 40, 20);
 }
 else {
  targets = await lib.filterTargets(ns, allServers);
 }
 ns.tprint("targets: " + targets);
```

## Moving Forward

Some augments can be obtained and work towards the first reset can be accomplished. The hacking algorithm needs some work to improve efficiency. The threads are all being allocated at the same time, manually split with `sleep`, which is making money progression slower than necessary. Improving initial money generation and purchasing servers is the next step.

## Upgrading

Upgrading the home server RAM is next priority, so more and better scripts can be run. The first upgrade is only $1M, and likely could have been done before resetting for augmentations (whoops). After leaving the game running for a while, I was able to work up to 512 GB of RAM on the home server, which should be plenty to start.

Since the upgrade has been completed. The next phase of the operation begins. Efficient hacking through "proto-batchers" and purchased servers.

## Proto-Batching (or planning to, at least)

The BitBurner docs refer to a proto-batcher algorithm as a manager that separates the scripts and performs all deployments from a master script based on threads and need. Much of what has already been accomplished has worked towards this goal. The part that needs the most refinements is the calculation of necessary threads to perform any given action on a target. If available threads are also updated to the console regularly, it would be easy to monitor the effectiveness of the hacks.

The goals are going to become more complex. Now I want to reduce the hack algorithm to a single target, and update the console with a status dashboard.

### Following the Threads

The docs include a `monitor.js` that includes several interesting outputs, and uses a couple functions that are not documented. Specifically, `hackAnalyzeThreads` and `growthAnalyze`. The `weaken` thread count is statically defined by calculating the difference between the minimum security level and current security level, then multipling the result by 20. This is all wrapped in a while loop to give a near-realtime view into the hack progression of a server.

```javascript
   const server = flags._[0];
   let money = ns.getServerMoneyAvailable(server);
   if (money === 0) money = 1;
   const maxMoney = ns.getServerMaxMoney(server);
   const minSec = ns.getServerMinSecurityLevel(server);
   const sec = ns.getServerSecurityLevel(server);
   ns.clearLog(server);
   ns.print(`${server}:`);
   ns.print(` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
   ns.print(` security: +${(sec - minSec).toFixed(2)}`);
   ns.print(` hack____: ${ns.tFormat(ns.getHackTime(server))} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`);
   ns.print(` grow____: ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
   ns.print(` weaken__: ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil((sec - minSec) * 20)})`);
   await ns.sleep(flags.refreshrate);
```

These are interesting, and will probably become useful. However, I need to break this process down into indivdual steps. In order to split up the jobs, I need to know how much total RAM I have available to split up across all servers, and the RAM cost of the hack scripts. `getRamStatistics()`. With the stats in hand, it is calculated that each script uses about 1.75 GB of RAM. I think this can be rounded to 2 GB per script to make the math easier. All servers have a ram count that is a multiple of 2. Additionally, we have 396 GB of server host ram to work with at hack level 256. This means we can run 198 scripts, or threads. Keep in mind that all these calculations are excluding `home` for now, which has grown to 1TB in size. Moving up to 2 GB per thread for the calcution leaves about 25% of ram underutilized, but I suspect that the hacks will still be far more efficient than the current extreme overhacking that is taking place.

It has been shown through monitoring how effective a using weaken to keep the security level low truly is. Hack and grow are much, much more effective and efficient when the security level is as low as possible. This will be part of the balance. Furthermore, calculations in-game are only updated once a script has completed. So, if a bunch of hack scripts all finish at the same time, each subsequent one will experience a higher security level, and therefore hack less money. It is also notable that it is possible to hack only a certain percentage of money that can be calculated. As the game docs say, we want to keep the money high, and the security level low.

I've stopped all hacks for now, to get some quantifible data on these calculations. First, let's weaken `joesguns` to its minimum security level. Right now, our monitor states that this will require 63 threads. Let's run the `weaken` from `n00dles`, with 2 threads. There are 4 GB available, so about 3.5 should get used. The expectation is that `joesguns` weaken thread count will decrease by 2 in 43 seconds. This is precisely what happened. Let's try putting this into a function, `executeBatchHacks()`.

The first iteration of this function is mostly working as intended. It is calculating the total threads necessary per target process, and allocating servers to run against that target. The primary issue now is that when our loop executes again, we don't have prior knowledge of what has been launched already. This is causing an overhack condition because each time the loop runs, it recalculates the full thread load. This was somewhat mitagated with a stopgap solution to just check if the file is running and skip that host, but that just pushes the problem to hosts that are not running that particular hack script at that moment.

However, the first iteration is working well enough as a proof of concept. All three hack functions are working, and the security level is kept to a very low level, typically less than 1.5 over the minimum. At least this makes the overhacking as efficient as possible.

Another way around this problem might be to expand the target list. To do this correctly would factor in the total threads needed for a target, then moving to the next target. This would continue until we are out of threads or exhausted all targets. If the amount of targets was kept high enough, the entire thread count would be exhausted, which would over over hacking the targets, while leaving the last target underhacked.

Leaving the controller running overnight hacking `joesguns` turned into `$185k` per second. Not bad.

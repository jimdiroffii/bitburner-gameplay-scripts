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

Accessing the darkweb server is necessary to speed up the process of getting additional exploits. Purchasing the darkweb router is the first manual task in the game, outside of running the first script.

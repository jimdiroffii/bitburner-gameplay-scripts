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

## Target List

We need a list of targets. I've used both files to store the scan data in previous playthroughs, but I'm not sure we need that yet. Therefore, let's just setup a scan. We can recursively scan and retrieve all known servers in a list. We are also going to create the main automation program, which will launch the server list creation.

`controller.js`

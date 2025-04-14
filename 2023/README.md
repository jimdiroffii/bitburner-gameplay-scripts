# bitburner-scripts

A collection of bitburner scripts that I used to play the game.

The initial project template is build on bitburner official typescript template which includes the remote API feature. This allows directly working with bitburner's API from your local IDE.

## Getting Started

Run `npm install` to install all the dependencies.
Run `npm run watch` to open the API connection.

The default port is set to `12525`.

Open the game options, set the API port and click on the `Connect` button.

Additional documentation on the template can be found [on the official repository](https://github.com/bitburner-official/typescript-template).

## Gameplay

I'm going to do my best to commit scripts sequentially, as I progress through the game. Starting from a fresh install, fresh template, and fresh character. We have no root access to any remote servers, and only access to the Nuke.exe program. With a couple basic scripts, initial progress should come quickly. Then we can start to automate the process of gaining root access to remote servers, and start to build up our hacking empire.

The ultimate goal is to be able to completely automate the workflow the game.

### Day 1

Starting a new game and connecting the web socket copies over the `template.js` file. We have $1.113k and a 8GB home server. First order of business is to make some money. The goal here is automation. I'd like to start by generating a server list that we can use repeatedly.

- [x] Create a script that will generate a list of servers to hack.

`scanToFile.js` scans the local network for servers, and stores the hostnames to a JSON-formatted file called `servers.js`. Files created in-game are not copied back to our local machine. We don't need them to develop our scripts, but they might be useful for reference and debugging. Download a file from the game with the `download` command, and I've been storing them in the `download` folder for quick access. I don't want these dymamically created files to end up in the dist, so ensure they do not get copied to `src`.

Now we have our list of servers, we can use it to connect and root them.

- [x] Create a script that will connect to a server and root it.

`conn.js` will connect to a server and root it. The root process can only be done if we meet the hacking level, which will continuously increase. As our hacking level increases, we want to ensure we gain access to newly available servers. Running `conn.js` continually will ensure we are always connected to the highest level server we can access. We will have to later modify our scans to append to the `servers.txt` file to ensure we access new servers. We also want to skip servers that we have already rooted, or too high of a hacking level.

We have access to our first servers and now its time to hack them.

- [x] Create a script that will hack a server.

`basicHack.js` will execute a self-contained hack that includes grow(), weaken() and hack() in the same file. To automate this, we will require a script that looks for rooted servers, copies the hack file to them, and executes it. For that we will need another file that is running on our home server, `copyHacks.js`. I've begun to copy the code for excluded servers, so we might as well make that a seperate file too, `excludedServers.txt`.

With our 3 scripts running, `conn.js` and `copyHacks.js` at home, and `basicHack.js` on the remote servers, we can now automate the process of hacking servers. We can now start to make some money. `conn.js` and `copyHacks.js` keep running on the home server, and will hack, copy and execute on new servers as our hack level grows.

#### Day 1 Summary

- [x] Create a script that will generate a list of servers to hack.
- [x] Create a script that will connect to a server and root it.
- [x] Create a script that will hack a server.
- [x] Leave scripts running on home server

### Day 2

While we wait on our first scripts to start producing, we can play some other aspects of the game. Prior to further automation, let's get a basic job, and a single Hacknet node. The Hacknet node just earns some passive income while we start things up, and while we are not playing the game. Upgrading is expensive, but it may be worth getting the first level upgrades to speed up the passive income. Better that we just get a job (or perform crime) and start earning some money. I decided to start at Joe's Guns, and take some easy cash. I'll need the extra money to upgrade the home server and run more scripts as our two running scripts take up most of our current resources. With the job in hand, I upgraded the hacknet node to level 10, and earned our first $10k. We need $200k to buy a Tor router, and $1M to upgrade the home server to 16GB. This should happen fairly quickly as our scripts continue to run.

- [x] Get a job at Joe's Guns
- [x] Buy a Hacknet Node

We've made it beyond hacking level 30 and have $100k in our account. The idea so far has been to automate the process of hacking new servers, and so far that goal has been successful. As we level up, new servers are showing up in our active scripts list. Each server just hacks itself. There is another way to approach the hacks, and that would be to use all available threads to hack a single server over and over again. That actually might be a faster way to earn quicker cash here in the early game. However, our current approach should start producing decent cash flow before too long, and we really want a better hacking algorithm anyways. So, before we get too ahead of ourselves, let's stick to this simple solution. There are many more aspects that need to be covered, like buying more servers, and gaining access to new programs.

One thing that I would like to cover now, is a startup process. If bitburner breaks, or we break it with a script, we might need to kill all script to restart the game. To simplify this process, I'm going to create a simple startup file and loads our scripts for us.

- [x] Create a startup script that loads our scripts.

`startup.js` checks if the server lists exist, and creates and populates them if they don't. Then it starts up `conn.js`, and spawns `copyHacks.js`. Spawn will kill `startup.js`, wait a few seconds, then execute `copyHacks.js`. `copyHacks.js` will take care of running the hacks on the remote servers.

#### Day 2 Summary

- [x] Get a job at Joe's Guns
- [x] Buy a Hacknet Node
- [x] Create a startup script that loads our scripts.

### Day 3

Our hack scripts are finally making their first returns after about 45 minutes. We have root access on all the base level servers except for `iron-gym`, which will unlock at level 100. We won't have access to backdoor functionality until later in the game, so we need to connect to each server, analyze and backdoor them.

```javascript
connect n00dles
analyze
backdoor
home
```

Repeat for each server. Our faction invites came in too, and we can find those servers now, and manually hack them to start gaining access to the faction storyline. To do that, we will need `BruthSSH.exe`, which I will start creating now, finally finishing our shift at JoesGuns. It is possible to buy it from the DarkWeb, but we will reserve that for a bit later, and automate that process. Once `BruthSSH.exe` is finished, I access the CSEC server, backdoor it, join the faction, and begin working on hacking contracts.

Now I feel like is a decision point about how to proceed. Let's take a look at our current situation.

- [x] We have a list of servers to hack
- [x] We have a script that will connect to a server and root it.
- [x] We have a script that will hack a server.
- [x] We have a startup script that loads our scripts.
- [x] We have a Hacknet Node
- [x] We had a job at Joe's Guns
- [x] We have a faction invite to CSEC
- [x] We have `BruthSSH.exe`
- [x] We are working on hacking contracts

We need to expand our network and hacking power. We can buy more servers, upgrade the home server, optimize our existing scripts, or replicate our current process to deeper servers. We also need to pick up the Tor node and buy more programs to unlock more servers.

### Day 4

I decided to take a break instead, and relaunched the game after 12 hours or so. We now have about $6.2M and level 182 hack level. This gives access to more programs, and servers to hack. I purchased a Tor node, and upgrade the home server RAM to 16GB. With the darknet node, I purchased FTPCrack.exe, ServerProfiler.exe, and DeepscanV1.exe. This allows us to hack servers that require 2 ports to be open. Let's update the `conn.js` script to use the new programs. Then kill and restart the script on the home server. `iron-gym` should now show up in our active scripts list.

With `iron-gym` hacked, I logged in and backdoored the server.

Upon analyzing our status, we are definitely not very efficient. Our server scripts that are hacking each server as slowly working the weaken and grow commands, and not hacking. The only server that has produced income is n00dles. It may have been more efficient to choose a server, and let every other server throw resources at hacking it. However, after checking each of our servers using the ServerProfiler.exe, all of the execution times have dropped well below 2 minutes. I'm going to let this configuration ride for a bit longer, expecting that once these scripts start hacking, we will quickly gain tens of millions of dollars.

Instead, while these scripts run, let's do something else. We have these hacking contracts available, and our joesguns server has one. `contract-694985.cct`. Running this contract shows us a Caesar Cipher to solve. We are practicing programming, so lets write a script that will solve this challenge for us.

- [x] Create a script that will solve the Caesar Cipher challenge.

`caesar.js` will solve the Caesar Cipher challenge.

Our next contract is on `harakiri-sushi`, `contract-33480-CyberSec`. This is `Algorithmic Stock Trader I`, which gives an array of values that represent stock prices. You are instructed to perform a single trade, buy and sell, to maximize profit. The algorithm required is a little more complicated. If we just try to find the lowest stock value on any given day, there is no guarentee that the later dates will offer a larger return than trading during some previous day. This looks like a multiple pointers problem, where we keep track of several states at once.

- [x] Create a script that will solve the Algorithmic Stock Trader I challenge.

`stock.js` will solve the Algorithmic Stock Trader I challenge.

All necessary reputation has been gained for CSEC, so I switched to a software job at that CIA. We also have some more funds, so the home server was upgraded to 32GB.

I should also look at expanding with new home servers. Let's create a script that returns all the prices of available servers to purchase.

- [x] Create a script that will return all the prices of available servers to purchase.

`serverPrices.js` will return all the prices of available servers to purchase and write them to a file called `serverPrices.txt`.

```text
serverPrices.txt

2GB: $110000
4GB: $220000
8GB: $440000
16GB: $880000
32GB: $1760000
64GB: $3520000
128GB: $7040000
256GB: $14080000
512GB: $28160000
1024GB: $56320000
2048GB: $112640000
4096GB: $225280000
8192GB: $450560000
16384GB: $901120000
32768GB: $1802240000
65536GB: $3604480000
131072GB: $7208960000
262144GB: $14417920000
524288GB: $28835840000
1048576GB: $57671680000
```

The biggest server we can afford right now is the 64GB version. I want to accelerate making some money, so I'm going to just start hacking the base servers from this new server. We can cycle through the servers one at a time, to help avoid over hacking any particular server. The basic scripts will still be running on the servers themselves to ensure grow and weaken keep running. We need a script that will purchase the new server, copy the scripts to it, and execute them.

- [x] Create a script that will purchase a new server, copy the scripts to it, and execute them.

`newServer.js` will purchase a new server, copy the scripts to it, and execute them. `hackAllServers.js` will loop through all servers and hack them directly. I hardcoded in a single server purchase to test and see how this works. It is immediately apparent that we are about to take all the money as we shot up $10M in just a few minutes. The new `hackAllServers.js` script runs with 36 threads on a 64GB server. This won't be sustainable without executing grow, and finding more servers to hack. I'm thinking that we can chain some spawn() commands to perform our basic hack loop, but spawn instances of hack, grow and weaken, that loop over all servers, and then respawn the basic hack process to determine which command to execute next.

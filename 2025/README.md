# 2025

I needed a break from the day-to-day, so I figured I'd jump into BitBurner for awhile.

## File Watch API

BitBurner has an official file syncing [repo](https://github.com/bitburner-official/bitburner-filesync).

Just run `npx bitburner-filesync` in the root directory to run the server.

The server is controlled by `filesync.json`.

## Saves

All save files are located in `.saves` and should be exported at the end of gameplay, and imported at the beginning of gameplay. This is mostly to facilitate transferring saves between computers, otherwise the game state is saved in the browser.

## Gameplay

As before, we want to automate the hacking from the very beginning. It is nice to have a startup script. That way we can launch our startup script, and that kicks off the rest of the processes.

### Startup

Run a startup script that finds all available servers. Then we need to mark targets for hacking that is continually updated as our hack level grows.

The `exec` and `run` functions have a high RAM cost, so if we are going to run multiple scripts, we need to chain them together to run sequentially, instead of all in one script.

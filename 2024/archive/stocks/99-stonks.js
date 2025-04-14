/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		if (ns.getServerMoneyAvailable('home') < 20000000000) {
			await ns.sleep(10000);
			continue;
		}
		else {
			break;
		}
	}
	
	//const startingCapital=50,000,000,000;
	const startingCapital = 20000000000;
	let availableFunds = startingCapital;
	const maxInvestmentPerStock = 0.1; // Max 10% of total funds per stock

	while (true) {
		const stocks = ns.stock.getSymbols();
			//const stocks = ns.getStockSymbols();

			for (const stock of stocks) {
				//ns.tprint(stock);
					const forecast = ns.stock.getForecast(stock);
					const [sharesOwned, avgPx, , , , ] = ns.stock.getPosition(stock);

					if (forecast > 0.6 && sharesOwned === 0) {
							availableFunds = await tryBuyStock(ns, stock, availableFunds, maxInvestmentPerStock * startingCapital);
					} else if (forecast < 0.5 && sharesOwned > 0) {
						availableFunds = await trySellStock(ns, stock, sharesOwned, avgPx, availableFunds);

					}
			}

			await ns.sleep(10000); // Wait for a minute before repeating the process
	}
}

async function tryBuyStock(ns, stock, availableFunds, maxInvestment) {
	const stockPrice = ns.stock.getPrice(stock);
	const maxSharesToBuy = Math.floor(maxInvestment / stockPrice);
	const sharesToBuy = Math.min(maxSharesToBuy, Math.floor(availableFunds / stockPrice));

	if (sharesToBuy > 0) {
			ns.stock.buyStock(stock, sharesToBuy);
			availableFunds -= sharesToBuy * stockPrice;
	}
	return availableFunds;
}

async function trySellStock(ns, stock, sharesOwned, avgPx, availableFunds) {
    ns.stock.sellStock(stock, sharesOwned);
    return availableFunds + (sharesOwned * avgPx);
}


/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script solves Algorithmic Stock Trader I.
 *
 * You are given the following array of stock prices (which are numbers)
 * where the i-th element represents the stock price on day i:
 * 85,177,25,168,34,192,155,158,131,131,21,192,33,22,94,152,135,56,93,123,122,188,162,167,190,165,109,78,4,149,156,177,144,123,147,57,23,12,73
 *
 * Determine the maximum possible profit you can earn using at most one
 * transaction (i.e. you can only buy and sell the stock once). If no
 * profit can be made then the answer should be 0. Note that you have to
 * buy the stock before you can sell it.
 *
 * Returns: 173
 */

export async function main(ns) {
	const stockPrices = [
		85, 177, 25, 168, 34, 192, 155, 158, 131, 131, 21, 192, 33, 22, 94, 152,
		135, 56, 93, 123, 122, 188, 162, 167, 190, 165, 109, 78, 4, 149, 156, 177,
		144, 123, 147, 57, 23, 12, 73,
	];

	const result = stockTrader(stockPrices);
	ns.tprint(result);

	function stockTrader(prices) {
		let maxProfit = 0;

		for (let i = 0; i < prices.length; i++) {
			const buyPrice = prices[i];
			for (let j = i + 1; j < prices.length; j++) {
				const sellPrice = prices[j];
				const profit = sellPrice - buyPrice;
				if (profit > maxProfit) {
					maxProfit = profit;
				}
			}
		}

		return maxProfit;
	}
}

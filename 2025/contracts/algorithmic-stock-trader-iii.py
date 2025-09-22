# Algorithmic Stock Trader III
#
# Given an array of stock prices (one per day), find the maximum profit
# that can be made with at most 2 transactions. A transaction is a buy followed
# by a sell. You must sell the stock before you buy again.

def max_profit(prices):
    if not prices:
        return 0

    n = len(prices)
    left_profits = [0] * n
    right_profits = [0] * n

    # Calculate max profit for one transaction from the left
    min_price = prices[0]
    for i in range(1, n):
        min_price = min(min_price, prices[i])
        left_profits[i] = max(left_profits[i - 1], prices[i] - min_price)

    # Calculate max profit for one transaction from the right
    max_price = prices[-1]
    for i in range(n - 2, -1, -1):
        max_price = max(max_price, prices[i])
        right_profits[i] = max(right_profits[i + 1], max_price - prices[i])

    # Combine the two profits
    max_total_profit = 0
    for i in range(n):
        max_total_profit = max(max_total_profit, left_profits[i] + right_profits[i])

    return max_total_profit

if __name__ == "__main__":
    prices = [104,60,97,37,49,187,91,180,90,68,75,32,90,114,163,91,142,152,157,1,117,3,160,116,94,197,90,59,93,137,69,168,26]
    print(max_profit(prices))

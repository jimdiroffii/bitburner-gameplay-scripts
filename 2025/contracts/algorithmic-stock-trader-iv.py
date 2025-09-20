# You are given an array with two elements:
# [3, [10, 22, 5, 75, 65, 80]]
#
# The first element is the maximum number of transactions you are allowed to make.
# The second element is an array of stock prices (which are numbers) where the
# i-th element represents the stock price on day i.
#
# A transaction is defined as buying and then selling one share of the stock.
# You cannot engage in multiple transactions at the same time (i.e., you must sell the stock
# before you buy again).
#
# If no profit can be made, then the answer should be 0.

def max_profit(k, prices):
    n = len(prices)
    if n == 0:
        return 0

    # If k is greater than n/2, we can make maximum number of transactions
    if k >= n // 2:
        total_profit = 0
        for i in range(1, n):
            if prices[i] > prices[i - 1]:
                total_profit += prices[i] - prices[i - 1]
        return total_profit

    # DP table to store the maximum profit at each transaction and day
    dp = [[0] * n for _ in range(k + 1)]

    for t in range(1, k + 1):
        max_diff = -prices[0]
        for d in range(1, n):
            dp[t][d] = max(dp[t][d - 1], prices[d] + max_diff)
            max_diff = max(max_diff, dp[t - 1][d] - prices[d])

    return dp[k][n - 1]

if __name__ == "__main__":
    arr = [6, [169,144,150,160,73,30,52,108,25,14,77,117,100,81,146,72]]
    k = arr[0]
    prices = arr[1]
    print(max_profit(k, prices))
    

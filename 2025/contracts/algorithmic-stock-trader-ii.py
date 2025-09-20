# Algorithmic Stock Trader II
# Determine the max profit from an array of stock prices, making as many 
# buy/sell transactions as you like (but you must sell before you buy again).
def max_profit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit

if __name__ == "__main__":
    prices = [122,144,137,114,166,143,146,11,198,177,108,169,176,10,182]
    print(max_profit(prices))


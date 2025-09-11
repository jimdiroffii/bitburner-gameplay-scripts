# You are given the following array of stock prices (which are numbers) where 
# the i-th element represents the stock price on day i:
#
# Determine the maximum possible profit you can earn using at most one 
# transaction (i.e. you can only buy and sell the stock once). If no profit can
# be made then the answer should be 0. Note that you have to buy the stock 
# before you can sell it.
#
# Example: 82,82,30,106,109,163,42,90,56,79,114,50,140,152,102,63,65,108,158,155,45,86,177,29,103,83,77,184,66,46,122,200,43,98,52,44,119,172,102,41,102,159,63,167,108

def max_profit(prices):
  max_profit = 0
  for price in prices:
    for future_price in prices[prices.index(price):]:
      #print("price: ", price, "future_price: ", future_price)
      profit = future_price - price
      if profit > max_profit:
        max_profit = profit
  return max_profit


if __name__ == "__main__":
  prices = [82,82,30,106,109,163,42,90,56,79,114,50,140,152,102,63,65,108,158,155,45,86,177,29,103,83,77,184,66,46,122,200,43,98,52,44,119,172,102,41,102,159,63,167,108]
  print(max_profit(prices))

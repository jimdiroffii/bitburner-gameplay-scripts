# Given an array of arrays of numbers representing intervals, merge all 
# overlapping intervals. Intervals must be returns in ascending order. You can
# assume that in an interval, the first number will always be smaller than the
# second.
# Example: [[1,3],[8,10],[2,6],[10,16]]
# Returns: [[1,6],[8,16]]

def mergeIntervals(intervals):
  if not intervals:
    return []

  # Sort intervals based on the start time
  intervals.sort(key=lambda x: x[0])
  merged = [intervals[0]]

  for current in intervals[1:]:
    last = merged[-1]
    
    # If the current interval overlaps with the last merged interval, merge them
    if current[0] <= last[1]:
      last[1] = max(last[1], current[1])
    else:
      merged.append(current)

  return merged

if __name__ == "__main__":
  # intervals = [[1,3],[8,10],[2,6],[10,16]]
  #intervals = [[7,16],[15,23],[18,23],[25,27],[2,9],[17,19],[5,6],[22,27],[1,10]]
  intervals = [[2,7],[11,21],[20,26],[24,31],[5,15],[22,27],[25,29],[18,26],[9,10],[10,15],[8,18],[11,15],[5,12],[8,12],[25,35],[22,26],[17,20],[23,32]]
  print(mergeIntervals(intervals))
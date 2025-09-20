# You are given data representing a graph.
# Note that "graph", as used here, refers to the field of graph theory, and has
#  no relation to statistics or plotting. The first element of the data 
# represents the number of vertices in the graph. Each vertex is a unique 
# number between 0 and 9. The next element of the data represents the edges of 
# the graph. Two vertices u,v in a graph are said to be adjacent if there exists 
# an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u], as order 
# does not matter. You must construct a 2-coloring of the graph, meaning that you 
# have to assign each vertex in the graph a "color", either 0 or 1, such that no 
# two adjacent vertices have the same color. Submit your answer in the form of an 
# array, where element i represents the color of vertex i. If it is impossible to 
# construct a 2-coloring of the given graph, instead submit an empty array.

def proper_2_coloring_graph(data):
    num_vertices = data[0]
    edges = data[1]
    
    # Create adjacency list
    graph = {i: [] for i in range(num_vertices)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    
    colors = [-1] * num_vertices  # -1 means uncolored
    
    def bfs(start):
        queue = [start]
        colors[start] = 0  # Start coloring with color 0
        
        while queue:
            node = queue.pop(0)
            current_color = colors[node]
            next_color = 1 - current_color
            
            for neighbor in graph[node]:
                if colors[neighbor] == -1:  # If uncolored
                    colors[neighbor] = next_color
                    queue.append(neighbor)
                elif colors[neighbor] == current_color:
                    return False  # Found a conflict
        return True
    
    for vertex in range(num_vertices):
        if colors[vertex] == -1:  # If uncolored
            if not bfs(vertex):
                return []  # Not bipartite, return empty array
    
    return colors

if __name__ == "__main__":
    data = [10,[[8,9],[2,7],[1,6],[2,3],[2,9],[7,8],[0,5],[4,8],[3,8],[4,5],[6,9],[6,7],[1,4],[3,4],[0,1]]]
    print(proper_2_coloring_graph(data))

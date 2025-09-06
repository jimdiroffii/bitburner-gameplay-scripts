# Lempel-Ziv (LZ) compression is a data compression technique which encodes 
# data using references to earlier parts of the data. In this variant of LZ, 
# data is encoded in two types of chunk. Each chunk begins with a length L, 
# encoded as a single ASCII digit from 1 to 9, followed by the chunk data, 
# which is either:
#
# 1. Exactly L characters, which are to be copied directly into the 
#  uncompressed data.
# 2. A reference to an earlier part of the uncompressed data. To do this, the 
# length is followed by a second ASCII digit X: each of the L output characters
#  is a copy of the character X places before it in the uncompressed data.
#
# For both chunk types, a length of 0 instead means the chunk ends immediately, 
# and the next character is the start of a new chunk. The two chunk types 
# alternate, starting with type 1, and the final chunk may be of either type.
#
# You are given the following input string:
#
#     XU6HJKF188jDMBDqCXFDHcy1Zxk1Z846S568L568L568L568LWsiWsiWsi4WsuBsUdGGJLdHWr
#
#  Encode it using Lempel-Ziv encoding with the minimum possible output length.
#
# Examples (some have other possible encodings of minimal length):
#     abracadabra     ->  7abracad47
#     mississippi     ->  4miss433ppi
#     aAAaAAaAaAA     ->  3aAA53035
#     2718281828      ->  627182844
#     abcdefghijk     ->  9abcdefghi02jk
#     aaaaaaaaaaaa    ->  3aaa91
#     aaaaaaaaaaaaa   ->  1a91031
#     aaaaaaaaaaaaaa  ->  1a91041

import heapq

def lzCompression(s: str) -> str:
    n = len(s)
    if n == 0:
        return ""

    INF = 10**9
    # dist[pos][type] = best total encoded length to reach this state
    dist = [[INF, INF] for _ in range(n + 1)]
    # prev[pos][type] = (prev_pos, prev_type, edge_encoding_str)
    prev = [[None, None] for _ in range(n + 1)]

    # start at pos=0 with chunk_type=0 (literal)
    dist[0][0] = 0
    pq = [(0, 0, 0)]  # (cost, pos, type)

    def push(nd, np, nt, pp, pt, enc):
        if nd < dist[np][nt]:
            dist[np][nt] = nd
            prev[np][nt] = (pp, pt, enc)
            heapq.heappush(pq, (nd, np, nt))

    while pq:
        d, pos, typ = heapq.heappop(pq)
        if d != dist[pos][typ]:
            continue
        # If we've consumed all input, first goal popped by Dijkstra is optimal
        if pos == n:
            # Reconstruct encoding from prev pointers
            path = []
            cur_pos, cur_typ = pos, typ
            while prev[cur_pos][cur_typ] is not None:
                ppos, ptyp, enc = prev[cur_pos][cur_typ]
                path.append(enc)
                cur_pos, cur_typ = ppos, ptyp
            return "".join(reversed(path))

        if typ == 0:
            # Literal chunks: L in [1..9], must not overrun
            maxL = min(9, n - pos)
            for L in range(1, maxL + 1):
                enc = str(L) + s[pos:pos+L]
                nd = d + 1 + L
                push(nd, pos + L, 1, pos, typ, enc)
            # Zero-length switch
            push(d + 1, pos, 1, pos, typ, "0")

        else:
            # Reference chunks: try length L and distance X ∈ [1..min(9,pos)]
            maxL = min(9, n - pos)
            maxX = min(9, pos)
            for L in range(1, maxL + 1):
                for X in range(1, maxX + 1):
                    # Validate that s[pos:pos+L] equals the rolling backref
                    ok = True
                    for i in range(L):
                        if s[pos + i] != s[pos - X + (i % X)]:
                            ok = False
                            break
                    if ok:
                        enc = str(L) + str(X)
                        nd = d + 2
                        push(nd, pos + L, 0, pos, typ, enc)
            # Zero-length switch
            push(d + 1, pos, 0, pos, typ, "0")

    # Should never reach here for valid inputs
    return ""

def verify_compression(original, compressed):
    """Verify that the compression correctly decodes to the original string"""
    decoded = ""
    i = 0
    chunk_type = 0  # 0 = literal, 1 = reference
    
    while i < len(compressed):
        length = int(compressed[i])
        i += 1
        
        if length == 0:
            # Switch chunk type and continue
            chunk_type = 1 - chunk_type
            continue
        
        if chunk_type == 0:  # Literal
            decoded += compressed[i:i + length]
            i += length
        else:  # Reference
            distance = int(compressed[i])
            i += 1
            
            for _ in range(length):
                decoded += decoded[len(decoded) - distance]
        
        chunk_type = 1 - chunk_type
    
    return decoded == original

def lzDecompression(compressed: str) -> str:
    """
    Decompresses a string that was encoded using the lzCompression logic.
    """
    decoded = ""
    i = 0
    chunk_type = 0  # 0 = literal, 1 = reference, starts with literal
    
    while i < len(compressed):
        try:
            length = int(compressed[i])
        except (ValueError, IndexError):
            # Handle malformed compressed string
            print(f"Error: Invalid character in compressed string at index {i}")
            return decoded

        i += 1
        
        if length == 0:
            # A length of 0 means we switch chunk type and continue
            chunk_type = 1 - chunk_type
            continue
        
        if chunk_type == 0:  # Literal chunk
            # Copy 'length' characters directly from the compressed string
            chunk_data = compressed[i : i + length]
            decoded += chunk_data
            i += length
        else:  # Reference chunk
            try:
                distance = int(compressed[i])
                i += 1
            except (ValueError, IndexError):
                print(f"Error: Missing distance value in reference chunk at index {i-1}")
                return decoded

            # Copy 'length' characters by looking back 'distance' in the decoded string
            for _ in range(length):
                if len(decoded) < distance:
                    print(f"Error: Invalid back-reference. Distance {distance} is too large.")
                    return decoded
                decoded += decoded[len(decoded) - distance]
        
        # Alternate chunk type for the next block
        chunk_type = 1 - chunk_type
    
    return decoded

if __name__ == "__main__":
    # inputString = "XU6HJKF188jDMBDqCXFDHcy1Zxk1Z846S568L568L568L568LWsiWsiWsi4WsuBsUdGGJLdHWr"
    inputString = "atwbrfmnbrfmnuaDmnuaDmnuDmnuaDmADmnuaDmAD6gfAD6gfA5iitA5OxT5Fw6A5OxT5Fw6"
    result = lzCompression(inputString)
    print(f"Compressed: {result}")

    # inputString = "2hh920978cJfhhcPx393G8D77660xhcA5647oyb"
    # result = lzDecompression(inputString)
    # print(f"Decompressed: {result}")

    

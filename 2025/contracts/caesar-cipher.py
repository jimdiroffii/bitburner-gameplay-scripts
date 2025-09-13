# Caesar cipher is one of the simplest encryption technique. It is a type of 
# substitution cipher in which each letter in the plaintext is replaced by a 
# letter some fixed number of positions down the alphabet. For example, with 
# a left shift of 3, D would be replaced by A, E would become B, and A would 
# become X (because of rotation).
#
# You are given an array with two elements:
#   ["VIRUS CACHE EMAIL TABLE CLOUD", 10]
#
#  The first element is the plaintext, the second element is the left shift value.
#
# Return the ciphertext as uppercase string. Spaces remains the same.

def caesar_cipher(arr):
    plaintext, shift = arr
    ciphertext = ""

    for char in plaintext:
        if char == " ":
            ciphertext += " "
        elif char.isalpha():
            shifted = chr((ord(char) - ord('A') - shift) % 26 + ord('A'))
            ciphertext += shifted
        else:
            ciphertext += char  # Non-alphabetic characters remain unchanged

    return ciphertext

if __name__ == "__main__":
    print(caesar_cipher(["VIRUS CACHE EMAIL TABLE CLOUD", 10]))
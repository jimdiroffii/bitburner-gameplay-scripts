# You are given an array with two elements:
#   ["ATTACKATDAWN", "LEMON"]
#
# The first element is the plaintext, the second element is the keyword.
# Return the ciphertext as uppercase string.

def vigenere_cipher(arr):
    plaintext, keyword = arr
    ciphertext = ""
    keyword_repeated = (keyword * (len(plaintext) // len(keyword) + 1))[:len(plaintext)]

    for p_char, k_char in zip(plaintext, keyword_repeated):
        if p_char.isalpha():
            shift = ord(k_char) - ord('A')
            encrypted_char = chr((ord(p_char) - ord('A') + shift) % 26 + ord('A'))
            ciphertext += encrypted_char
        else:
            ciphertext += p_char  # Non-alphabetic characters remain unchanged

    return ciphertext

if __name__ == "__main__":
    arr = ["LOGINARRAYFRAMEDEBUGLOGIC", "NETWORK"]
    print(vigenere_cipher(arr))
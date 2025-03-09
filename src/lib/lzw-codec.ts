// LZW encoding and decoding functions for Case Clicker 2 save files

// Character mappings for the encoding
const numberToChar: Record<string, string> = {
    "0": "=",
    "1": "!",
    "2": "?",
    "3": "$",
    "4": "%",
    "5": "&",
    "6": "/",
    "7": "\\",
    "8": "-",
    "9": "+",
  }
  
  // Character mappings for the decoding
  const charToNumber: Record<string, string> = {
    "=": "0",
    "!": "1",
    "?": "2",
    $: "3",
    "%": "4",
    "&": "5",
    "/": "6",
    "\\": "7",
    "-": "8",
    "+": "9",
  }
  
  // Special characters used in the encoding
  const specialChars = Object.keys(charToNumber).join("")
  
  // Helper function to escape special characters in JSON
  const escapeJson = (str: string): string => {
    return str
  }
  
  // Helper function to unescape special characters in JSON
  const unescapeJson = (str: string): string => {
    return str
  }
  
  /**
   * Encodes a JSON string using LZW compression algorithm
   * @param jsonStr The JSON string to encode
   * @returns The encoded string
   */
  export function lzw_encode(jsonStr: string): string {
    jsonStr = escapeJson(jsonStr)
  
    const dict: Record<string, number> = {}
    const data = (jsonStr + "").split("")
    const result: number[] = []
  
    let current = data[0]
    let dictSize = 256
  
    for (let i = 1; i < data.length; i++) {
      const char = data[i]
  
      if (dict[current + char] !== undefined) {
        current += char
      } else {
        result.push(current.length > 1 ? dict[current] : current.charCodeAt(0))
        dict[current + char] = dictSize
        dictSize++
        current = char
      }
    }
  
    if (current !== "") {
      result.push(current.length > 1 ? dict[current] : current.charCodeAt(0))
    }
  
    return result
      .map((code) => {
        const base36 = code.toString(36)
        const lastChar = base36[base36.length - 1]
  
        return (
          base36.substring(0, base36.length - 1) +
          (lastChar.match(/[0-9]/) ? numberToChar[lastChar] : lastChar.toUpperCase())
        )
      })
      .join("")
  }
  
  /**
   * Decodes an LZW-encoded string back to a JSON string
   * @param encoded The encoded string
   * @returns The decoded JSON string
   */
  export function lzw_decode(encoded: string): string {
    const codes: number[] = []
    let buffer = ""
  
    for (let i = 0; i < encoded.length; i++) {
      const char = encoded[i]
  
      if (char.match(/[A-Z]/) || specialChars.includes(char)) {
        buffer += specialChars.includes(char) ? charToNumber[char] : char.toLowerCase()
        codes.push(Number.parseInt(buffer, 36))
        buffer = ""
      } else {
        buffer += char
      }
    }
  
    const dict: Record<number, string> = {}
    let firstChar = String.fromCharCode(codes[0])
    let oldPhrase = firstChar
    const result = [firstChar]
    let dictSize = 256
  
    for (let i = 1; i < codes.length; i++) {
      const code = codes[i]
      let phrase: string
  
      if (code < 256) {
        phrase = String.fromCharCode(code)
      } else {
        phrase = dict[code] ? dict[code] : oldPhrase + firstChar
      }
  
      result.push(phrase)
      firstChar = phrase[0]
      dict[dictSize] = oldPhrase + firstChar
      dictSize++
      oldPhrase = phrase
    }
  
    return unescapeJson(result.join(""))
  }
  
  
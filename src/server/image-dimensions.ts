export interface ImageDimensions {
  width: number
  height: number
}

function uint16be(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

function uint24le(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)
}

function uint32be(bytes: Uint8Array, offset: number) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0)
}

export function readImageDimensions(
  bytes: Uint8Array,
  format: 'png' | 'jpeg' | 'webp' | 'gif'
): ImageDimensions | null {
  if (format === 'png' && bytes.length >= 24) {
    return { width: uint32be(bytes, 16), height: uint32be(bytes, 20) }
  }

  if (format === 'gif' && bytes.length >= 10) {
    return {
      width: bytes[6] | (bytes[7] << 8),
      height: bytes[8] | (bytes[9] << 8),
    }
  }

  if (format === 'webp' && bytes.length >= 30) {
    const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
    if (chunk === 'VP8X') {
      return { width: 1 + uint24le(bytes, 24), height: 1 + uint24le(bytes, 27) }
    }
    // Lossless WebP stores both 14-bit dimensions in the first four payload bytes.
    if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
      const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24)
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) }
    }
    // Lossy WebP frame header contains a start code followed by 14-bit dimensions.
    if (chunk === 'VP8 ' && bytes.length >= 30) {
      for (let i = 20; i + 9 < bytes.length && i < 40; i++) {
        if (bytes[i + 3] === 0x9d && bytes[i + 4] === 0x01 && bytes[i + 5] === 0x2a) {
          return {
            width: uint16be(bytes, i + 6) & 0x3fff,
            height: uint16be(bytes, i + 8) & 0x3fff,
          }
        }
      }
    }
  }

  if (format === 'jpeg') {
    let offset = 2
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset++
        continue
      }
      const marker = bytes[offset + 1]
      const length = uint16be(bytes, offset + 2)
      if (length < 2) return null
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: uint16be(bytes, offset + 7), height: uint16be(bytes, offset + 5) }
      }
      offset += length + 2
    }
  }

  return null
}

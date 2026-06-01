export function compressImage(
  dataUrl: string,
  maxSizeMB = 1,
  maxWidth = 1920
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context not available')); return }

      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.8
      let compressed = canvas.toDataURL('image/jpeg', quality)

      while (compressed.length > maxSizeMB * 1024 * 1024 * 0.75 && quality > 0.1) {
        quality -= 0.1
        compressed = canvas.toDataURL('image/jpeg', quality)
      }

      resolve(compressed)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

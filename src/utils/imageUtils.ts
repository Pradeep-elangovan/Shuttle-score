/**
 * Resizes an uploaded image file on an offscreen canvas and returns a compact JPEG data URL.
 * Keeps photos lightweight (~30-50KB) so React state and rendering remain fast and responsive.
 */
export function resizeImageFile(file: File, maxDimension = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(event.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Extracts 1-2 letter initials from a name string (e.g. "John Doe" -> "JD", "Alex" -> "A")
 */
export function getInitials(name: string, fallback = 'P'): string {
  const trimmed = name.trim()
  if (!trimmed) return fallback
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const KB = 1024
export const MB = 1024 * 1024
export const GB = 1024 * 1024 * 1024

export function formatFileSize(number, fixDigit = 1) {
  let result
  switch (true) {
    case number < KB:
      result = number + 'bytes'
      break
    case number < MB:
      result = (number / KB).toFixed(fixDigit) + 'KB'
      break
    case number < GB:
      result = (number / MB).toFixed(fixDigit) + 'MB'
      break
    default:
      result = (number / GB).toFixed(fixDigit) + 'GB'
      break
  }
  return result
}

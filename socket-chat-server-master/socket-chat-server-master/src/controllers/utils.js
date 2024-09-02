// 计算占位图的宽高
const getPHSize = function(width, height, maxWidth = 200, minWidth = 50, maxHeight = 200, minHeight = 50) {
  if (width > maxWidth) {
    height *= maxWidth / width
    width = maxWidth
  }

  if (height > maxHeight) {
    width *= maxHeight / height
    height = maxHeight
  }

  if (width < minWidth) {
    height *= minWidth / width
    width = minWidth
    height = height > maxHeight ? maxHeight : height
  }

  if (height < minHeight) {
    width *= minHeight / height
    height = minHeight
    width = width > maxWidth ? maxWidth : width
  }

  return { width: Math.ceil(width), height: Math.ceil(height) }
}

module.exports = {
  getPHSize,
}
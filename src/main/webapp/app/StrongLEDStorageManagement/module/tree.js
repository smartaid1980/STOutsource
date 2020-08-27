export class Tree {
  constructor(data, levelCount) {
    // 根節點只有一個
    this.root = createRootDummyNode(data)
    this.levelCount = levelCount
  }
  getLevelData(level = this.levelCount) {
    if (isNaN(Number(level))) {
      console.warn('參數 level 是數字')
      return {}
    }
    if (level < 1 || level > this.levelCount) {
      console.warn(`參數 level 只能介於 ${1} ～ ${this.levelCount}`)
      return {}
    }
    let levelDataMap = Object.fromEntries(
      Array.from(new Array(level), (val, key) => [key + 1, []])
    )
    let sameLevelNodeQueue = [this.root]
    _.times(level, (i) => {
      sameLevelNodeQueue = sameLevelNodeQueue
        .map((parent) => parent.hasChildren && parent.child)
        .flat()
        .filter((v) => v)
      levelDataMap[i + 1].push(...sameLevelNodeQueue)
    })
    return levelDataMap
  }
  has(node) {
    let levelNodeSet = new Set(this.root.child)
    while (levelNodeSet.size && !levelNodeSet.has(node)) {
      levelNodeSet = new Set(
        Array.from(levelNodeSet, ({ hasChildren, child }) =>
          hasChildren ? child : []
        ).flat()
      )
    }
    return levelNodeSet.size > 0
  }
}
function createRootDummyNode(data) {
  const nodeData = {
    child: Array.isArray(data) ? data : [data],
    isDummy: true,
  }
  return new Node(nodeData)
}
export class Node {
  constructor(data, parent = null, level = 0, index) {
    this.data = data
    this.hasChildren = !!(Array.isArray(data.child) && data.child.length)
    this.child = this.hasChildren
      ? data.child.map(
          (childData, i) => new Node(childData, this, level + 1, i)
        )
      : null
    this.parent = parent
    this.level = level
    this.index = index
  }
}

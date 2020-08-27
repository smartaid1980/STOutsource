import { awesomeIcon } from '../../../js/servtech/module/element/button.js'
import { basicElement } from '../../../js/servtech/module/element/basic.js'
import { Tree } from './tree.js'

const getFoldModeIcon = () =>
  awesomeIcon('fa-minus-circle', {
    className: ['fa-lg'],
  })

export function drawNode(node, index = 0, callBackMap = {}, option) {
  const { level } = node
  const hasChildren = !!node.child
  const container = basicElement(
    'li',
    hasChildren
      ? {
          className: ['parent_li'],
          attributes: {
            role: 'treeitem',
          },
        }
      : {}
  )
  const span = basicElement('span', {
    dataset: {
      index,
    },
  }) // 顯示的節點
  const { afterNodeDraw, beforeNodeListDraw } = callBackMap
  const { hideLevelAfter } = option
  const isHideChildren = hideLevelAfter && level >= hideLevelAfter - 1

  container.insertAdjacentElement('afterBegin', span)

  if (afterNodeDraw) {
    afterNodeDraw(container, index, node)
  }

  if (hasChildren && !isHideChildren) {
    const nodeListContainer = drawNodeList(node.child, callBackMap, option)
    span.insertAdjacentElement('afterBegin', getFoldModeIcon())
    container.insertAdjacentElement('beforeEnd', nodeListContainer)
  }

  return container
}

export function drawNodeList(nodeList, callBackMap = {}, option) {
  const [{ level }] = nodeList
  const nodeListContainer = basicElement('ul', {
    attributes: {
      role: level === 0 ? 'tree' : 'group',
    },
    dataset: {
      level,
    },
  })
  const {
    afterNodeDraw,
    afterNodeListDraw,
    beforeNodeListDraw,
    beforeNodeDraw,
  } = callBackMap
  nodeList.forEach((node, i) =>
    nodeListContainer.append(drawNode(node, i, callBackMap, option))
  )
  if (afterNodeListDraw) {
    afterNodeListDraw(nodeListContainer, level, nodeList)
  }
  return nodeListContainer
}

// 畫樹不畫 dummyRootNode
export function drawTree(tree, callBackMap = {}, option = {}) {
  if (!(tree instanceof Tree)) {
    return console.warn('drawTree 參數 root 必須是 Tree 的實例')
  }
  const {
    afterNodeDraw,
    afterNodeListDraw,
    afterTreeDraw,
    beforeNodeListDraw,
    beforeNodeDraw,
  } = callBackMap
  const { isDummy } = tree.root.data
  const rootNodeList = isDummy ? tree.root.child : [tree.root]
  const nodeListContainer = drawNodeList(
    rootNodeList,
    {
      afterNodeDraw,
      afterNodeListDraw,
      beforeNodeListDraw,
      beforeNodeDraw,
    },
    option
  )
  const treeContainer = basicElement('div', {
    className: ['tree', 'smart-form'],
  })
  treeContainer.append(nodeListContainer)
  if (afterTreeDraw) {
    afterTreeDraw(treeContainer, tree)
  }
  return treeContainer
}

export class TreeView {
  constructor(root, container, callBackMap = {}, option = {}) {
    this.container = container
    this.root = root
    this.callBackMap = _.mapObject(callBackMap, (fn) => fn.bind(this))
    this.treeContainer = null
    this.option = option
    this.refresh()
  }
  refresh(tree) {
    if (tree) {
      this.root = tree
    }
    if (this.treeContainer) {
      this.treeContainer.remove()
    }
    this.treeContainer = drawTree(this.root, this.callBackMap, this.option)
    this.container.append(this.treeContainer)
  }
}

import { getPositionStructure } from '../positionStructure.js'
import {
  ajax,
  fetchParamJsonFile,
} from '../../../../js/servtech/module/servkit/ajax.js'
import {
  loadingButton,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import { TreeView } from '../treeView.js'
import { Tree } from '../tree.js'
import {
  createButton,
  editButton,
  deleteButton,
  iconButton,
} from '../../../../js/servtech/module/element/button.js'
import { basicElement } from '../../../../js/servtech/module/element/basic.js'

export default async function render() {
  const positionStructure = await getPositionStructure()
  const storageConfig = await fetchParamJsonFile('storage/config.json')

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      indexOfCurrNode: 0, // 新增、編輯、刪除節點時取得當前節點資訊
      levelOfCurrNode: 0, // 新增、編輯、刪除節點時取得當前節點資訊
      currNodeIndexPath: null, // 新增、編輯、刪除節點時取得當前節點資訊
      currNodeData: null, // 新增、編輯、刪除節點時取得當前節點資訊
      currNodeListData: null, // 新增、編輯、刪除節點時取得當前節點資訊
      autoSaveSchedule: null,
      autoSavePeriod: 10 * 60 * 1000, // 編輯模式下每 10 分鐘自動儲存
      isEditingTree: false,
      treeView: null,
      levelCount: null,
      addingNodesCount: 0,
      storageMap: null,
      structureMap: null,
      zoneDeleteList: [],
      storeDeleteList: [],
      positionDeleteList: [],
      pillarLightDeleteList: [],
      positionLightDeleteList: [],
      loadingAddBtn: loadingButton(document.getElementById('confirm-add-btn')),
      loadingAddPositionBtn: loadingButton(
        document.getElementById('confirm-add-position-btn')
      ),
      loadingSaveBtn: loadingButton(document.getElementById('save-tree-btn')),
      $treeViewContainer: $('#storage'),
      $editTreeBtn: $('#edit-tree-btn'),
      $saveTreeBtn: $('#save-tree-btn'),
      $quitEditTreeBtn: $('#quit-edit-tree-btn'),
      $addFormGroupBtn: $('#create-btn'),
      $addNodeForm: $('#create-form'),
      $confirmAddNodeBtn: $('#confirm-add-btn'),
      $addNodeModal: $('#add-node-modal'),
      $editNodeModal: $('#edit-node-modal'),
      $editNodeForm: $('#edit-form'),
      $confirmEditBtn: $('#confirm-edit-btn'),
      $deleteNodeModal: $('#delete-node-modal'),
      alertConifg: {
        success: {
          title: `${i18n('Save_Success')}`,
          color: '#2e8b57',
        },
        fail: {
          title: `${i18n('Save_Failed')}`,
          color: '#a90329',
        },
      },
      main() {
        const context = this

        context.storageMap = JSON.parse(
          JSON.stringify(positionStructure.storage)
        ) // deep clone
        context.levelCount = positionStructure.structure.length
        context.structureMap = positionStructure.getStructureMap()
        context.renderStructure(context.structureMap)
        context.initWidgetBtn()
        context.initTreeView(context.storageMap)
        context.initAddNodeModal()
        context.initAddPositionModal()
        context.initEditNodeModal()

        $('#confirm-delete-btn').on('click', context.deleteNode.bind(context))

        // 離開時確認要不要存檔
        function hashChangeHandler() {
          if (context.isEditingTree && confirm(`${i18n('Exit_Info')}`)) {
            context.saveStorage(true)
          }
          $(window).off('hashchange', hashChangeHandler)
        }
        $(window).on('hashchange', hashChangeHandler)
      },
      initWidgetBtn() {
        const context = this
        const { $saveTreeBtn, $quitEditTreeBtn, $editTreeBtn } = context

        $saveTreeBtn.on('click', context.saveStorage.bind(context))
        $quitEditTreeBtn.on('click', context.quitEditTree.bind(context))
        $editTreeBtn.on('click', context.editTree.bind(context))
      },
      initAddNodeModal() {
        const context = this
        const { $addFormGroupBtn, $addNodeForm, $confirmAddNodeBtn } = context

        $.validator.addMethod(
          'addNodeIdDuplicate',
          function (value, element, params) {
            let currNodeListData = context.storageMap
            context.currNodeIndexPath.forEach((index) => {
              currNodeListData = currNodeListData[index].child
            })
            const existedIdSet = new Set(_.pluck(currNodeListData, 'id'))
            const siblingArticleList = $(element)
              .closest('article')
              .siblings()
              .toArray()
            const siblingNodeIdSet = new Set(
              siblingArticleList.map((article) =>
                $(article).find('[data-type=id]').val()
              )
            )
            const isDuplicate =
              existedIdSet.has(value) || siblingNodeIdSet.has(value)

            return this.optional(element) || !isDuplicate
          },
          i18n('Exist_ID')
        )

        $addFormGroupBtn.on('click', context.addNodeFormGroup.bind(context))

        validateForm($addNodeForm, $confirmAddNodeBtn)
        $confirmAddNodeBtn.on('click', context.addNode.bind(context))
        $addNodeForm
          // 擋住預設行為
          .on('keydown', function (e) {
            if (e.which === 13) {
              $confirmAddNodeBtn.click() // 觸發新增
              return false // 擋住預設行為
            }
          })
          .on(
            'click',
            '.delete-create-node',
            context.revertAddingNode.bind(context)
          )
      },
      addNodeFormGroup() {
        const context = this
        const { $addNodeForm } = context

        // 新增節點
        context.addingNodesCount++
        // 建立新增節點輸入框
        $addNodeForm.append(`<article>
          <section class="col col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <div class="form-group">
              <label class="col-md-3 control-label form-text">${i18n(
                'ID'
              )}</label>
              <div class="col-md-8 input">
                <input class="form-control" data-type="id" name="id${
                  context.addingNodesCount
                }" type="text">
              </div>
            </div>
          </section>
          <section class="col col-xs-12 col-sm-12 col-md-5 col-lg-5">
            <div class="form-group">
              <label class="col-md-2 control-label form-text">${i18n(
                'Name'
              )}</label>
              <div class="col-md-9 input">
                <input class="form-control" data-type="name" type="text">
              </div>
            </div>
          </section>
          <section class="col col-xs-12 col-sm-12 col-md-1 col-lg-1">
            <button class="btn btn-danger btn-sm delete-create-node" title="${i18n(
              'Delete'
            )}"><i class="fa fa-times"></i></button>
          </section>
        </article>`)

        // 每建立一個都要加上驗證
        $(`[name=id${context.addingNodesCount}]`).rules('add', {
          required: true,
          pattern: /^[a-zA-Z0-9]*$/,
          addNodeIdDuplicate: true,
          messages: {
            pattern: `${i18n('Only_English_Or_Number')}`,
          },
        })

        // 如果只有一個就不用刪除輸入框的按鈕
        const $formGroupList = $addNodeForm.find('article')
        $formGroupList
          .find('section:last')
          .toggleClass('hide', $formGroupList.length === 1)
      },
      addNode() {
        const context = this
        const { $addNodeForm, $addNodeModal } = context
        // 子節點
        const childNodeList = context.currNodeData.child
        const addingNodeDataList = []
        const articleList = $addNodeForm.find('article').toArray()

        context.loadingAddBtn.doing()

        for (let el of articleList) {
          const $id = $(el).find('[data-type=id]')
          const $name = $(el).find('[data-type=name]')
          const name = $name.val()
          const id = $id.val()
          const nodeData = {
            id,
            name,
            level: String(context.levelOfCurrNode + 1),
            type: '',
            child: [],
          }
          addingNodeDataList.push(nodeData)
        }

        childNodeList.push(...addingNodeDataList)
        context.refreshTreeView()
        context.loadingAddBtn.done()
        $addNodeModal.modal('hide')
      },
      getLastLightId() {
        const context = this
        const { treeView } = context
        const { root: tree } = treeView
        const { levelCount } = tree
        const levelData = tree.getLevelData()
        const lastLevelData = levelData[levelCount]
        let result = -1

        if (lastLevelData && lastLevelData.length) {
          let ligthIdToNumber
          lastLevelData.forEach(({ data: { light_id } }) => {
            ligthIdToNumber = Number(light_id)
            if (!isNaN(ligthIdToNumber)) {
              result = Math.max(result, ligthIdToNumber)
            }
          })
        }
        return result
      },
      revertAddingNode(e) {
        const context = this
        const { $addNodeForm } = context
        const target = e.currentTarget
        const $formGroupList = $addNodeForm.find('article')

        // 新增時刪除多餘的新增欄位
        e.preventDefault()
        $(target).closest('article').remove()
        if ($formGroupList.length === 1) {
          $formGroupList.find('section:last').addClass('hide')
        }
      },
      initAddPositionModal() {
        const context = this

        $('#add-position-form').on('keydown', function (e) {
          if (e.which === 13) {
            $('#confirm-add-position-btn').trigger('click') // 觸發新增
            return false // 擋住預設行為
          }
        })
        servkit.validateForm(
          $('#add-position-form'),
          $('#confirm-add-position-btn')
        )
        $('#confirm-add-position-btn').on(
          'click',
          context.addPosition.bind(context)
        )
      },
      addPosition() {
        // 新增儲位節點
        const context = this
        const positionIdPrefix = storageConfig.positionTag
        let currNodeData = context.storageMap

        context.loadingAddPositionBtn.doing()
        context.currNodeIndexPath.forEach((index, level) => {
          currNodeData = currNodeData[index]
          if (level !== context.currNodeIndexPath.length - 1) {
            currNodeData = currNodeData.child
          }
        })
        let lastIdIndex = 0
        const lastChild = _.last(currNodeData.child) // 拿到目前最後一筆
        if (lastChild) {
          lastIdIndex = +lastChild.id.replace(positionIdPrefix, '') // 拿掉 prefix
        }
        const positionCountToAdd = $('#add-position-form [name=quantity]').val()
        let nodeData
        let id
        let lightIdStartIndex = $('#add-position-form [name=light-start]').val()
        if (lightIdStartIndex) {
          lightIdStartIndex = +lightIdStartIndex
        }
        _.times(positionCountToAdd, (offset) => {
          lastIdIndex++
          id =
            positionIdPrefix +
            lastIdIndex
              .toString()
              .padStart(storageConfig.positionLength || 8, '0')
          nodeData = {
            id,
            level: String(context.levelOfCurrNode + 1),
            name: id,
            type: '',
            child: [],
          }
          if (lightIdStartIndex !== '' || lightIdStartIndex !== undefined) {
            nodeData.light_id = String(lightIdStartIndex + offset)
          }
          currNodeData.child.push(nodeData)
        })

        context.treeView.refresh(
          new Tree(context.storageMap, context.levelCount)
        )
        context.loadingAddPositionBtn.done()
        $('#add-position-node-modal').modal('hide')
      },
      // TODO: 檢查燈號是否重複(新增 / 更新)
      initEditNodeModal() {
        const context = this
        const { $editNodeForm, $confirmEditBtn } = context

        $.validator.addMethod(
          'editNodeIdDuplicate',
          function (value, element, params) {
            const { currNodeData, currNodeListData } = context
            const isIdChanged = value !== currNodeData.id
            const isDuplicate =
              isIdChanged &&
              currNodeListData.some((nodeData) => nodeData.id === value)

            return this.optional(element) || !isDuplicate
          },
          i18n('Exist_ID')
        )

        $editNodeForm.on('keydown', function (e) {
          if (e.which === 13) {
            $confirmEditBtn.click() // 觸發新增
            return false // 擋住預設行為
          }
        })
        validateForm($editNodeForm, $confirmEditBtn)
        // 編輯的id加上驗證
        $editNodeForm.find('[name=id]').rules('add', {
          required: true,
          pattern: /^[a-zA-Z0-9]*$/,
          editNodeIdDuplicate: true,
          messages: {
            pattern: `${i18n('Only_English_Or_Number')}`,
          },
        })
        $confirmEditBtn.on('click', context.updateNodeData.bind(context))
      },
      updateNodeData() {
        // 編輯節點
        const context = this
        const {
          currNodeData,
          $editNodeForm,
          levelOfCurrNode,
          levelCount,
          $editNodeModal,
        } = context
        const $id = $editNodeForm.find('[data-type=id]')
        const id = $id.val()
        const name = $editNodeForm.find('[data-type=name]').val()
        const lightId = $editNodeForm.find('[data-type=light]').val()
        const isPostionLevel = levelOfCurrNode === levelCount.length
        const isPillarLevel = levelOfCurrNode === levelCount.length - 2

        currNodeData.id = id
        currNodeData.name = name
        if (lightId) {
          // 更新燈號
          currNodeData.light_id = lightId
        } else if (currNodeData.light_id) {
          // 刪除燈號
          if (isPostionLevel && currNodeData.db_id) {
            context.positionLightDeleteList.push(currNodeData.db_id)
          } else if (isPillarLevel) {
            // 柱燈編號刪除時要將底下的 store_id 都加入 pillarLightDeleteList
            context.pillarLightDeleteList.push(
              ..._.chain(currNodeData.child).pluck('db_id').compact().value()
            )
          }
          delete currNodeData.light_id
        }

        context.refreshTreeView()
        $editNodeModal.modal('hide')
      },
      deleteNode() {
        // 刪除節點
        const context = this
        const {
          levelOfCurrNode,
          currNodeData,
          currNodeListData,
          levelCount,
          $deleteNodeModal,
        } = context
        const { db_id } = currNodeData
        const isPositionLevel = levelOfCurrNode === levelCount
        const isStoreLevel = levelOfCurrNode === levelCount - 1
        const isPillarLevel = levelOfCurrNode === levelCount - 2
        const isZoneLevel = levelOfCurrNode === levelCount - 3

        if (isPositionLevel && db_id) {
          context.positionDeleteList.push(db_id)
        } else if (isStoreLevel && db_id) {
          context.storeDeleteList.push(db_id)
        } else if (isPillarLevel && currNodeData.child) {
          // 刪倒數第三層的節點就要將底下的 store 一一刪除
          context.storeDeleteList.push(
            ..._.chain(currNodeData.child).pluck('db_id').compact().value()
          )
        } else if (isZoneLevel && db_id) {
          context.zoneDeleteList.push(db_id)
        }
        currNodeListData.splice(context.indexOfCurrNode, 1)
        context.refreshTreeView()
        $deleteNodeModal.modal('hide')
      },
      editTree() {
        // 開始編輯
        const context = this
        const { $editTreeBtn, $saveTreeBtn, $quitEditTreeBtn } = context

        context.isEditingTree = true
        $editTreeBtn.addClass('hide')
        $saveTreeBtn.removeClass('hide')
        $quitEditTreeBtn.removeClass('hide')
        $('#storage').removeClass('view')

        // 每10分鐘自動存檔
        if (context.autoSaveSchedule) {
          context.autoSaveSchedule.start()
        } else {
          context.initAutoSaveSchedule()
        }
      },
      initAutoSaveSchedule() {
        const context = this
        const { autoSavePeriod } = context
        const isRunImmediately = false
        const isAutoSave = true

        context.autoSaveSchedule = servkit
          .schedule('autoSave', isRunImmediately)
          .freqMillisecond(autoSavePeriod)
          .action(context.saveStorage.bind(context, isAutoSave))
          .start()
      },
      quitEditTree() {
        // 檢視
        const context = this
        const {
          $editTreeBtn,
          $saveTreeBtn,
          $quitEditTreeBtn,
          $treeViewContainer,
        } = context

        context.isEditingTree = false
        $editTreeBtn.removeClass('hide')
        $saveTreeBtn.addClass('hide')
        $quitEditTreeBtn.addClass('hide')
        $treeViewContainer.addClass('view')
        context.storageMap = positionStructure.storage
        context.refreshTreeView()
        context.autoSaveSchedule.stop()
      },
      // 組合儲位架構的字串
      renderStructure(structureMap) {
        $('#structure').html(
          Object.entries(structureMap)
            .sort(([levelA], [levelB]) => levelA - levelB)
            .map(([, name]) => name)
            .join(' - ')
        )
      },
      getCreateTitle(label) {
        // 拿到create時modal的字串
        const context = this
        const { structure } = positionStructure
        const { levelOfCurrNode } = context
        const parentNodeName = structure[levelOfCurrNode - 1].name
        const currNodeName = structure[levelOfCurrNode].name
        return `${parentNodeName} : ${label} - ${i18n('Add')}[${currNodeName}]`
      },
      saveStorage(isAutoSave) {
        const context = this

        $('#widget-grid button').attr('disabled', true)
        context.loadingSaveBtn.doing()

        return new Promise((res, rej) =>
          ajax(
            {
              url: 'api/storage/storage/saveJsonFile',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                file_name: 'storage',
                data: context.storageMap,
                lastLevel: String(context.levelCount),
                zoneDeleteList: context.zoneDeleteList,
                storeDeleteList: context.storeDeleteList,
                positionDeleteList: context.positionDeleteList,
                pillerLightDeleteList: context.pillarLightDeleteList, // TODO: 前後端參數名稱修改：piller => pillar
                positionLightDeleteList: context.positionLightDeleteList,
              }),
            },
            {
              success(data) {
                res(data)
              },
              fail() {
                rej()
              },
              exception() {
                rej()
              },
            }
          )
        )
          .then((response) => {
            context.zoneDeleteList.length = 0
            context.storeDeleteList.length = 0
            context.positionDeleteList.length = 0
            context.pillarLightDeleteList.length = 0
            context.positionLightDeleteList.length = 0
            return positionStructure.refreshStorage(JSON.parse(response))
          })
          .then(() => {
            context.storageMap = positionStructure.storage
            context.refreshTreeView()
            context.smallBoxAlert('success')
          })
          .catch((e) => {
            console.warn(e)
            context.smallBoxAlert('fail')
          })
          .finally(() => {
            context.loadingSaveBtn.done()
            $('#widget-grid button').attr('disabled', false)
          })
      },
      smallBoxAlert(type) {
        const context = this

        $.smallBox(
          Object.assign(
            {
              timeout: 3000,
            },
            context.alertConifg[type]
          )
        )
      },
      foldNode(node) {
        const span = node.children.item(0)
        const ul = span.nextElementSibling
        const i = span.children.item(0)
        let liList = ul?.children || []

        liList = Array.from(liList)
        if (i && i.nodeName === 'I') {
          i.classList.remove('fa-minus-circle')
          i.classList.add('fa-plus-circle')
        }
        liList.forEach((li) => (li.style.display = 'none'))
        return liList
      },
      foldDescendantsExceptCurrPath(
        liElementList,
        pathIndexList = [],
        isFoldAllDescendant
      ) {
        const context = this
        const index = pathIndexList[0]
        let children

        // 在路徑上的節點以及最後一個節點的子孫都不會被闔起
        if (
          !liElementList ||
          !liElementList.length ||
          (!isFoldAllDescendant && !pathIndexList.length)
        ) {
          return
        }
        liElementList.forEach((li, i) => {
          if (!isFoldAllDescendant && i === index) {
            children = li.children.item(1)?.children // ul
            context.foldDescendantsExceptCurrPath(
              children ? Array.from(children) : [],
              pathIndexList.slice(1),
              false
            )
          } else {
            children = context.foldNode(li)
            context.foldDescendantsExceptCurrPath(
              children,
              pathIndexList.slice(1),
              true
            )
          }
        })
      },
      initTreeView(data) {
        const context = this
        const { $treeViewContainer, levelCount } = context
        const getCreateBtn = () =>
          createButton({
            className: ['create-node'],
          })
        const getEditBtn = () =>
          editButton({
            className: ['edit-node'],
          })
        const getDeleteBtn = () =>
          deleteButton({
            className: ['delete-node'],
          })
        const getFoldBtn = () =>
          iconButton(
            {
              className: ['fold-node', 'btn-xs', 'btn', 'btn-default'],
              attributes: {
                title: i18n('All_Fold'),
              },
            },
            'fa-folder'
          )
        const getUnfoldBtn = () =>
          iconButton(
            {
              className: ['unfold-node', 'btn-xs', 'btn', 'btn-default'],
              attributes: {
                title: i18n('All_Unfold'),
              },
            },
            'fa-folder-open'
          )
        const tree = new Tree(data, levelCount)

        context.treeView = new TreeView(tree, $treeViewContainer, {
          afterTreeDraw(treeContainer, tree) {
            // 重繪樹時，除了上一個操作過的節點，其他節點都收起來
            if (!context.currNodeIndexPath) {
              return
            }
            const firstUlEl = treeContainer.children[0]
            let nodeList = Array.from(firstUlEl.children)

            context.foldDescendantsExceptCurrPath(
              nodeList,
              context.currNodeIndexPath,
              false
            )
          },
          afterNodeDraw(container, index, node) {
            const span = container.firstElementChild
            const { hasChildren, data, level } = node
            const { id, name, db_id } = data || {}
            const { levelCount } = this.root
            const nodeName = basicElement('div', {
              text: id + (name ? `(${name})` : ''),
              className: ['node-name'],
            })
            span.append(nodeName)
            if (level < levelCount) {
              span.append(getCreateBtn())
            }
            span.append(getEditBtn())
            if (level !== 1) {
              span.append(getDeleteBtn())
            }
            if (hasChildren) {
              span.append(getFoldBtn())
              span.append(getUnfoldBtn())
            }
            if (db_id) {
              span.dataset.dbId = db_id
            }
          },
        })
        context.setNodeEvent() // 綁定事件
      },
      refreshTreeView() {
        const context = this
        context.treeView.refresh(
          new Tree(context.storageMap, context.levelCount)
        )
      },
      setNodeEvent() {
        // 各個節點的事件
        const context = this

        context.$treeViewContainer
          .on(
            'click',
            'li:has(ul) > span',
            context.toggleFoldingNode.bind(context)
          )
          .on('click', '.create-node', context.createNodeHandler.bind(context))
          .on('click', '.edit-node', context.editNodeHandler.bind(context))
          .on('click', '.delete-node', context.deleteNodeHandler.bind(context))
          .on('click', '.fold-node', function (e) {
            context.toggleFoldingAllDescendants(e, true)
          })
          .on('click', '.unfold-node', function (e) {
            context.toggleFoldingAllDescendants(e, false)
          })
      },
      toggleFoldingNode(e) {
        // 將目前的節點摺疊或展開
        const context = this
        const $target = $(e.currentTarget)
        const $children = $target.parent('li.parent_li').find(' > ul > li')
        const isCurrentVisible = $children.is(':visible')

        e.stopPropagation()
        if (isCurrentVisible) {
          $children.hide('fast')
          $target
            .find(' > i')
            .removeClass('fa-minus-circle')
            .addClass('fa-plus-circle')
        } else {
          $children.show('fast')
          $target
            .find(' > i')
            .removeClass('fa-plus-circle')
            .addClass('fa-minus-circle')
        }
      },
      createNodeHandler(e) {
        // 按下「新增」跳出新增節點視窗
        const context = this
        const { $addNodeForm, $addFormGroupBtn, $addNodeModal } = context
        const $target = $(e.currentTarget)

        e.preventDefault()
        e.stopImmediatePropagation()

        context.addingNodesCount = 0
        const nodeInfo = context.getNodeInfo($target, true)
        const isStoreLevel =
          Number(context.levelOfCurrNode) === context.levelCount - 1
        if (isStoreLevel) {
          $('#quantity-error').remove()
          $('[name=quantity]').val('')
          $('#add-position-form [data-type=light-start]').val('')
          $('#confirm-add-position-btn').data('id', nodeInfo.id)
          $('#confirm-add-position-btn').data('name', nodeInfo.name)
          $('#add-position-node-level-text').html(
            context.getCreateTitle(nodeInfo.label)
          )
          $('#add-position-node-modal').modal('show')
        } else {
          $addNodeForm.empty()
          $addFormGroupBtn.trigger('click')
          $('#create-node-level-text').html(
            context.getCreateTitle(nodeInfo.label)
          )
          $addNodeModal.modal('show')
        }
      },
      editNodeHandler(e) {
        // 按下「編輯」編輯節點
        const context = this
        const $target = $(e.currentTarget)
        const nodeInfo = context.getNodeInfo($target)
        const {
          $editNodeForm,
          levelOfCurrNode,
          levelCount,
          $editNodeModal,
        } = context
        const isPositionLevel = levelOfCurrNode === levelCount
        const isPillarLevel = levelOfCurrNode === levelCount - 2

        e.preventDefault()
        e.stopImmediatePropagation()
        $editNodeForm.find('[data-type=id]').val(nodeInfo.id)
        $editNodeForm.find('[data-type=name]').val(nodeInfo.name)

        if (isPositionLevel || isPillarLevel) {
          $editNodeForm
            .find('[data-type=light]')
            .val(nodeInfo.light_id || '')
            .closest('section')
            .removeClass('hide')
        } else {
          $editNodeForm
            .find('[data-type=light]')
            .closest('section')
            .addClass('hide')
        }
        $('#edit-node-level-text').html(
          `${i18n('Edit')} : ` + context.structureMap[levelOfCurrNode]
        )
        $editNodeModal.modal('show')
      },
      deleteNodeHandler(e) {
        // 按下「刪除」刪除節點
        const context = this
        const { $deleteNodeModal } = context
        const $target = $(e.currentTarget)
        const nodeInfo = context.getNodeInfo($target)
        const levelName = context.structureMap[context.levelOfCurrNode]

        e.preventDefault()
        e.stopImmediatePropagation()
        $('#delete-node-level-text').text(`${levelName} : ${nodeInfo.label}`)
        $deleteNodeModal.modal('show')
      },
      toggleFoldingAllDescendants(e, isFold) {
        // 全部折疊 / 展開
        const $target = $(e.currentTarget)
        let isToggle
        let $descentdant

        $target
          .closest('li')
          .find('span')
          .toArray()
          .reverse()
          .forEach((ele) => {
            $descentdant = $(ele)
            isToggle = $descentdant
              .find('i')
              .hasClass(isFold ? 'fa-minus-circle' : 'fa-plus-circle')
            if (isToggle) {
              $descentdant.click()
            }
          })
        e.stopImmediatePropagation()
      },
      getNodeInfo($ele, isCreate) {
        const context = this

        // 拿到這筆是這層的第幾筆
        context.indexOfCurrNode = $ele.closest('span').data('index')
        // 拿到目前在第幾層
        context.levelOfCurrNode = $ele.closest('ul').data('level')

        // 拿到祖先們的位置(在那層的第幾筆)
        context.currNodeIndexPath = $ele
          .parents('li')
          .toArray()
          .map((li) => {
            return $(li).children('span').data('index')
          })
          .reverse() // $ele.parents() 回傳 index 的順序為由內而外，所以要 reverse 才能從外到內搜尋

        // 拿到目前所在的節點的資料
        let currNodeData = context.storageMap
        context.currNodeIndexPath.forEach((nodeIndex, index) => {
          currNodeData = currNodeData[nodeIndex]
          if (index + 1 !== context.currNodeIndexPath.length) {
            currNodeData = currNodeData.child
            context.currNodeListData = currNodeData
          }
        })
        context.currNodeData = currNodeData

        let label = currNodeData.id
        if (currNodeData.name) {
          label += '(' + currNodeData.name + ')'
        }
        return {
          label,
          id: currNodeData.id,
          name: currNodeData.name,
          light_id: currNodeData.light_id,
          data: currNodeData,
        }
      },
    },
  })
}

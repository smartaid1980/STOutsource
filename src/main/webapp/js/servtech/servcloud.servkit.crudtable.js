/*
  ** 若table有composite key(複合鍵)，而且使用「超easy crud api」時，需將html的stk-entity-pk設為pks

  !!!!!stk-input-template的name會先存起來後刪除，所以要在一開始就設定好name，不然就不會被顯示出來!!!!!
  ** 可用$(tableSelector).data('crudTable') 取出 datatable api instance **
  ** 可用$(tableSelector).data('crudTableConfig') 取出當初傳進來的 config **
  ** 可用$(tr).data('rowData') 取出read傳回來的data 或是 create時送出的data **
  ** 欄未說明可用tooltip, 在該欄位 th 加上屬性 data-original-title="要顯示的說明" **
  ** 下拉式選單直接從HTML呼叫API
  <select name="" class="form-control custom-scroll" multiple="multiple" stk-api="api/read" stk-option-value="id(DB裡的欄位名稱)" stk-option-text="name(DB裡的欄位名稱)"></select>

  servkit.crudtable({
    tableSelector: 'crudTable的table名稱',
    tableModel: '', // 使用超eazy crud 時會幫你帶給API用的參數
    inputTemplate: {    //客製化input
      物件的stk-handler這個attribute的名稱: function (element, data) {}    //element為要客製化的物件，data為API傳回的結果
    },
    modal: { // 編輯模式為modal時，oldTd會是元件外面那層<label>，oldTr則是<form>
      id: '#modalId',
      headFunc: function (oldTr) {}, // modal header部分的客製(若為create oldTr會是null)
      bodyFunc: function (oldTr) {} // modal body部分的客製(若為create oldTr會是null)
    },
    columns: [// 編輯模式為modal時，定義每一欄的值為api/read傳回的data的哪一個key值
      {
        data: ''
      }
    ],
    customBtns: ['<button class='btn margin-right-10'><span class='fa fa-trash-o fa-lg'></span></button>'],    //客製化的按鈕 html
    hideCols: [1, 2],    //要隱藏的欄位，從1開始。適用於不能顯示給使用者看到，但儲存需要使用的欄位
    centerColumn: [1, 2],    //指定欄位置中
    leftColumn: [4, 5],    //指定欄位靠左
    rightColumn: [6, 7, 8, 9, 10],    //指定欄位靠右
    naturalSortColumn: [1, 2],    //指定欄位為自然排序
    order: [[0, 'asc' || 'desc']],    //預設排序的欄位
    onRow: function (row, data) {},            // optional
    onDraw: function (tableData, pageData) {}, // optional
    create: {
      unavailable: true,    //若不使用create功能
      url: 'api/create',
      start: function(newTr, table) {},
      send: function(tdEles) {
        return {
          name: (function() { return '' }()),    //name is HTML attribute
          switch-name: (function () {    //開關預設為ON時'Y'，OFF時'N'
            if ($(tdEles[第幾欄]).find(':checkbox').prop('checked')) {
              return 自訂ON時回傳至DB的值
            } else {
              return 自訂OFF時回傳至DB的值
            }
          }())
        }
      },
      end: {
        第幾欄: function(td, formData) {
          return ''
        }
      },
      fail: function(data, createConfig){},
      finalDo: function(newRow) {}
    },
    read: {
      url: 'api/read',
      whereClause: '', // (optional)使用stdcrud或getdata/db時要過濾的條件
      type: 'POST', // (optional)預設為GET，ajax的方法
      requestParam: {}, // (optional)會帶入API的資料
      preventReadAtFirst: true, // 設true可防止初始化就執行read，不設或設false則反之；可搭配changeReadUrl來達成動態改變
      dataset: 值(數字),    //當資料太多時分段載入，dataset的值是載入一次資料的筆數
      end: {
        第幾欄: function(data, rowData) {
          return
            1. 自訂樣式：''    //字串
            2. 要包成tag樣式：    //把傳回去的值包成陣列
              (1) return [data]
              (2) _.map(data, function (ele) {    //使用直接在<select>呼叫API，此時的data會是[{},{},...]的型態
                    return ele.要傳回去的值
                  })
            3. 要包成開關樣式：
              {
                switchValue: data
              }
        }
      },
      fail: function(data, readConfig){},
      finalDo: function() {}
    },
    update: {
      unavailable: true,    //若不使用update功能
      url: 'api/update',
      start: {
        第幾欄: function(oldTd, newTd, oldTr, newTr, table) {}
      },
      send: function(tdEles) {
        return {
          name: (function() { return '' }())    //name is HTML attribute
          switch-name: (function () {    //開關預設為ON時'Y'，OFF時'N'
            if ($(tdEles[第幾欄]).find(':checkbox').prop('checked')) {
              return 自訂ON時回傳至DB的值
            } else {
              return 自訂OFF時回傳至DB的值
            }
          }())
        }
      },
      end: {
        第幾欄: function(td, formData) {
          return ''
        }
      },
      fail: function(data, updateConfig){},
      finalDo: function(newRow) {}
    },
    "delete": {
      unavailable: true,    //若不使用delete功能
      start: function (deleteId) { return 要傳給API的資料 },
      titleFunc: function (deleteIds) { return '刪除視窗的標題內容'},
      contentFunc: function (deleteIds) { return '刪除視窗的文字內容'},
      fail: function(data, deleteConfig){},
      finalDo: function() {}
    },
    // 拖拉功能(optional)
    rowReorder: {
      url: 'api/saveRowReorder',
      index: '要當作排序欄的key',
      option: { // 額外設定，會extend defaults物件，詳細有哪些屬性可以參考jquery.dataTables.rowReordering中defaults物件
        iIndexColumn: 0, // 哪一欄是index，預設為0
        ...
      }
    },
    validate: {
      第幾欄: function(td, table) {}
    },
    excel: {
      url: 'api/excel'
    }
  });

  ## 初始化後回傳的物件
  ### 屬性
  * table
    * 型態：Object
    * 說明：dataTable API
  * selectFilter
    * 型態：Object
    * 說明：key是index(同一行，最一開始的狀態，不算隱藏欄位和checkbox)，value是HTML node
  
  ### 方法
  * getSelectedRow()
    * 說明：取得checkbox所選的tr Array
    * 參數：無
    * 回傳：Array<HTML node>
  * getSelectedRowData()
    * 說明：取得checkbox所選的rowData Array，rowData有可能是Array或是Object(有設定columns)
    * 參數：無
    * 回傳：Array<rowData>
  * changeReadUrl(url, requestParam)
    * 說明：改變Read的URL/whereClause/requestParam
    * 參數
      * url
        * String) 修改url
        * Object<String, String>) 會extend url / whereClause ，可只給其中一個
      * requestParam
        * Object<String, Object>) 會extend requestParam
    * 回傳：無
  * refreshTable()
    * 說明：重整Table，和按下refreshBtn的行為一樣，提供一個接口
    * 參數：無
    * 回傳：無
*/

;(function (global, $, _) {
  global.servkit = global.servkit || {}

  var html = {
    headCheckbox:
      "<th style='width:2%' class='hidden-xs hidden-sm'><input class='stk-delete-all-checkbox' type='checkbox' /></th>",
    headWrench:
      "<th class='crud-update-unavailable hidden-xs hidden-sm' style='text-align:center'><i class='fa fa-fw fa-wrench hidden-sm hidden-xs'></i></th>",
    deleteCheckbox:
      "<td style='width:2%' class='hidden-xs hidden-sm'><input type='checkbox' /></td>",
    deleteUnvailable:
      "<th class='crud-delete-unavailable hidden-xs hidden-sm'></th>",
    deleteUnvailableTd:
      "<td class='crud-delete-unavailable hidden-xs hidden-sm'></td>",
    updateUnvailable:
      "<th class='crud-update-unavailable hidden-xs hidden-sm'></th>",
    updateUnvailableTd:
      "<td class='crud-update-unavailable hidden-xs hidden-sm'></td>",
    editRowBtn:
      "<td style='width:2%' class='hidden-xs hidden-sm'><button class='btn btn-xs btn-primary stk-edit-btn' title='Edit'><i class='fa fa-pencil'></i></button></td>",
    saveRowBtn:
      "<td class='save-td' style='width:2%'><button class='btn btn-xs btn-success stk-save-btn' title='Save'><i class='fa fa-save'></i></button></td>",
    cancelRowBtn:
      "<td class='cancel-td' style='width:2%'><button class='btn btn-xs btn-danger stk-cancel-btn' title='Cancel'><i class='fa fa-times'></i></button></td>",
    deleteBtn:
      "<button class='btn btn-danger stk-delete-btn hidden-xs hidden-sm' title='Delete selected rows'><span class='fa fa-trash-o fa-lg'></span></button>",
    insertBtn:
      "<button class='btn btn-primary stk-insert-btn hidden-xs hidden-sm' title='Add new data'><span class='fa fa-plus fa-lg'></span></button>",
    refreshBtn:
      "<button class='btn btn-primary stk-refresh-btn' title='Refresh'><span class='fa fa-refresh fa-lg'></span></button>",
    saveOrderBtn:
      "<button class='btn btn-success stk-saveOrder-btn' title='Save order'><span class='fa fa-save fa-lg'></span></button>",
    excelBtn:
      "<button class='btn btn-success stk-excel-btn' title='Excel'><span class='fa fa-file-excel-o fa-lg'></span></button>",
    datasetSelect:
      "<label><select class='stk-dt-dataset-select form-control'></select></label>",
    tagStart:
      "<span class='label label-primary' style='float:left;margin:5px;'><i class='fa fa-tag'></i>&nbsp;",
    tagEnd: '</span>',
    switchStartOn: "<span class='label label-success'>",
    switchStartOff: "<span class='label label-default'>",
    switchEnd: '</span>',
  }
  var trim = function (str) {
    if (str) {
      return str.replace(/^\s+|\s+$/, '')
    } else {
      return ''
    }
  }
  var valueToView = function (value) {
    var result = []
    if (_.isArray(value)) {
      result.push('<div>')
      _.each(value, function (eachValue) {
        if (eachValue !== '') {
          result.push(html.tagStart)
          result.push(trim(eachValue))
          result.push(html.tagEnd)
        }
      })
      result.push('</div>')
      return result.join('')
    } else if (value !== undefined && value.switchValue !== undefined) {
      if (
        value.switchValue === 1 ||
        value.switchValue === 'Y' ||
        value.switchValue === true
      ) {
        result.push(html.switchStartOn)
        result.push('ON')
      } else {
        result.push(html.switchStartOff)
        result.push('OFF')
      }
      result.push(html.switchEnd)
      return result.join('')
    } else {
      return value !== undefined && value !== null ? value : ''
    }
  }
  var viewToFormElement = function (viewElement, formElement) {
    // 只處理 input[type="text"] 與 預設的select
    if (
      (formElement instanceof window.HTMLInputElement &&
        formElement.type === 'text') ||
      formElement instanceof window.HTMLTextAreaElement
    ) {
      formElement.value = viewElement.textContent
    } else if (formElement instanceof window.HTMLSelectElement) {
      var labels = $(viewElement)
        .find('span.label')
        .map(function () {
          return this.value || trim(this.textContent)
        })
        .toArray()
      // 單選下拉式選單就會只有文字沒有 .label
      if (labels.length === 0) {
        labels = $(viewElement).text()
      }
      _.each(formElement.options, function (option) {
        // var optionText = trim(option.textContent);
        // if (optionText === "") {
        //   option.selected = false;
        //   return;
        // }
        // option.selected = (labels.indexOf(optionText) !== -1);
        // var optionVal = (option.value || trim(option.textContent))
        var optionVal = trim(option.textContent)
        if (!optionVal) {
          option.selected = false
          return
        }
        option.selected = labels.indexOf(optionVal) !== -1
      })
    }
  }
  var bling = function (blingTimes, frequency, $elements, color) {
    var actBlingTimes = blingTimes * 2 + 1
    var blingCount = 1

    setTimeout(function change() {
      if (blingCount < actBlingTimes) {
        if (blingCount++ % 2 === 0) {
          $elements.css('background-color', '')
        } else {
          $elements.css('background-color', color)
        }
        setTimeout(change, frequency)
      }
    }, 0)
  }
  function alignTableCell($stkCrudTableEle, alignColumnArr, alignClass) {
    if (alignColumnArr) {
      var filterSelector = _.map(alignColumnArr, function (n) {
        return ':nth-of-type(' + (n + 1) + ')' // :nth-of-type starting with 1
      }).join(', ')

      $stkCrudTableEle
        .find('td:not(.dataTables_empty)')
        .filter(filterSelector)
        .addClass(alignClass)
    }
  }

  servkit.crudtable = function (config) {
    var $stkCrudTableEle = $(config.tableSelector)
    var stkCrudTableEle = $stkCrudTableEle[0]
    var entityPk = $stkCrudTableEle.attr('stk-entity-pk')
    var stkDeleteAllCheckboxEle
    var pageAllSelectCheckbox = []
    var $deleteCheckDialog = $(
      "<div id='deleteCheckDialog" + config.tableSelector + "'></div>"
    )
    var $reqFailDialog = $(
      "<div id='reqFailDialog" + config.tableSelector + "'></div>"
    )
    var excelFormId
    var excelFormCount = 0
    var columnNames
    var trEditTemp
    var checkTableData

    const selectFilter = (($table, hideCols) => {
      let $select
      let hideColCountBefore = 0
      let indexAfterHideCols
      const hideColsSorted = _.isArray(hideCols) ? _.sortBy(hideCols) : []
      const selectFilterMap = $table
        .find('thead>tr:first-child th')
        .toArray()
        .reduce((a, th, i) => {
          $select = $(th).find('select')
          if (hideColsSorted[0] === i) {
            hideColsSorted.pop()
            hideColCountBefore++
          }
          if ($select.length) {
            indexAfterHideCols = i - hideColCountBefore
            a[indexAfterHideCols] = $select[0]
          }
          return a
        }, {})
      return selectFilterMap
    })($stkCrudTableEle, config.hidecols)

    if (config.tableModel) {
      servkit.ajax(
        {
          url: 'api/stdcrud/schema?tableModel=' + config.tableModel,
          type: 'GET',
          contentType: 'application/json',
        },
        function (data) {
          checkTableData = data
        }
      )
    }
    var trEleTemplate = (function () {
      // 把 stk-input-template 備份起來之後可以直接複製來使用
      var eleTemplate, editEle, trEleTemplate
      if (config.modal) {
        eleTemplate = $(config.modal.id)[0]
        editEle = eleTemplate.querySelectorAll('section')
        trEleTemplate = eleTemplate.querySelector('form')
      } else {
        // $stkCrudTableEle.find('tr[stk-input-template] > td').addClass('text-center')
        $stkCrudTableEle
          .find('tr[stk-input-template]')
          .addClass('hidden-xs hidden-sm')
          .prepend(html.cancelRowBtn)
          .append(html.saveRowBtn)
          .removeAttr('hidden')
          .find('td')
          .addClass('text-center')
          .find('input[type=text]:first, select:first, textarea:first')
          .addClass('full-width')
        if (config.hideCols) {
          const tds = _.map(config.hideCols, (index) => {
            return `td:nth-child(${index + 1})`
          }).join(', ')
          $stkCrudTableEle
            .find('tr[stk-input-template]')
            .find(tds)
            .addClass('hide')
        }

        trEleTemplate = stkCrudTableEle
          .querySelector('tr[stk-input-template]')
          .cloneNode(true)
        trEleTemplate.removeAttribute('stk-input-template')
        $stkCrudTableEle.find('tr[stk-input-template]').remove()
        eleTemplate = trEleTemplate
        editEle = trEleTemplate.querySelectorAll('td')
      }

      // 把每個 td 底下的第一個含有 name 屬性的值存起來，當成該欄要送給後端資料的 key
      columnNames = _.reduce(
        editEle,
        function (memo, ele) {
          var nameEle = ele.querySelector('[name]')
          if (nameEle) {
            memo.push(nameEle.getAttribute('name'))
          }
          return memo
        },
        []
      )

      // 長好 select 選項
      var selectList = eleTemplate.querySelectorAll('select')

      _.each(selectList, function (ele) {
        if (ele.getAttribute('stk-getdata-source') === 'db') {
          var selectValue = ele.getAttribute('stk-getdata-column-value')
          var selectText = ele.getAttribute('stk-getdata-column-text')
          var data = {
            table: ele.getAttribute('stk-getdata-name'),
            columns: [selectValue, selectText],
            whereClause: ele.getAttribute('stk-getdata-where'),
          }
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(data),
            },
            function (data) {
              var selectData = _.map(data, function (row) {
                return {
                  key: row[selectValue],
                  name: row[selectText],
                }
              }).sort(servkit.naturalCompareValue)
              $(ele).append(
                _.map(selectData, function (row) {
                  return (
                    "<option style='padding:3px 0 3px 3px;' value='" +
                    row.key +
                    "'>" +
                    row.name +
                    '</option>'
                  )
                })
              )
              servkit.multiselectHeightOptimization(ele)
            }
          )
        }

        // 用指定的 api 拿資料，再用指定的 handler 處理
        if (ele.getAttribute('stk-api')) {
          servkit.ajax(
            {
              url: ele.getAttribute('stk-api'),
              type: 'GET',
            },
            function (data) {
              if (
                ele.getAttribute('stk-option-value') &&
                ele.getAttribute('stk-option-text')
              ) {
                var selectData = _.map(data, function (row) {
                  return {
                    key: row[ele.getAttribute('stk-option-value')],
                    name: row[ele.getAttribute('stk-option-text')],
                  }
                }).sort(servkit.naturalCompareValue)
                $(ele).append(
                  _.map(selectData, function (row) {
                    return `<option style='padding:3px 0 3px 3px;' value='${row.key}'>${row.name}</option>`
                  })
                )
                servkit.multiselectHeightOptimization(ele)
              } else {
                var handler = ele.getAttribute('stk-handler')
                if (handler) {
                  config.inputTemplate[handler](ele, data)
                }
              }
            }
          )
        }
      })

      return trEleTemplate
    })()
    var getSelectedRow = function () {
      // return _.filter(stkCrudTableEle.querySelectorAll('tbody > tr'), function (trEle) {
      //   var input = trEle.querySelector('td:first-child input')
      //   return input === null ? false : input.checked
      // })
      var selectRow = []
      for (let row = 0; row < table.data().length; row++) {
        if (table.rows(row).nodes().to$().find(':checkbox').prop('checked')) {
          selectRow.push(table.rows(row).nodes()[0])
        }
      }
      return selectRow
    }
    var getSelectedRowData = function () {
      var selectedTr = []
      for (let row = 0; row < this.table.data().length; row++) {
        if (
          this.table.rows(row).nodes().to$().find(':checkbox').prop('checked')
        ) {
          selectedTr.push(this.table.rows(row).data()[0])
        }
      }
      return selectedTr
    }
    var getRowCellsExcludeHeadTail = function (trEle) {
      //            return _.reject(trEle.querySelectorAll('td'), function(e, i) {
      //                     return i === 0 || i === trEle.children.length;
      //                   });
      var cells = _.reject(trEle.querySelectorAll('td'), function (e) {
        return $(e).hasClass('save-td') || $(e).hasClass('cancel-td')
      })
      if (config.modal) {
        cells = _.map(trEle.querySelectorAll('section'), (ele) => {
          return $(ele).find('input, select, textarea').closest('label')[0]
        })
      }
      return cells
    }
    var swapTr = function (newTr, oldTr) {
      newTr.setAttribute('stk-db-id', oldTr.getAttribute('stk-db-id'))
      newTr.setAttribute('role', oldTr.getAttribute('role'))
      $(newTr).addClass(oldTr.getAttribute('class'))
      oldTr.parentNode.replaceChild(newTr, oldTr)
    }
    var disableFeature = function (disabled) {
      $stkCrudTableEle
        .find('thead > tr:first-child input, thead > tr:first-child select')
        .attr('disabled', disabled)
      $stkCrudTableEle
        .parent()
        .find(".dt-toolbar input[type='search'], .dt-toolbar-footer select")
        .attr('disabled', disabled)
      $stkCrudTableEle
        .parent()
        .find('.btn:not(.stk-cancel-btn, .stk-save-btn)')
        .attr('disabled', disabled)
      if (disabled) {
        $stkCrudTableEle
          .parent()
          .find('.dt-toolbar-footer > div:last-child')
          .css({
            visibility: 'hidden',
          })
      } else {
        $stkCrudTableEle
          .parent()
          .find('.dt-toolbar-footer > div:last-child')
          .css({
            visibility: 'visible',
          })
      }
    }
    var showRowLeft = function (display) {
      if (display) {
        $stkCrudTableEle.find('.crud-delete-unavailable').removeClass('hide')
      } else {
        $stkCrudTableEle.find('.crud-delete-unavailable').addClass('hide')
      }
    }
    var showRowRight = function (display) {
      if (display) {
        $stkCrudTableEle.find('.crud-update-unavailable').removeClass('hide')
      } else {
        $stkCrudTableEle.find('.crud-update-unavailable').addClass('hide')
      }
    }
    var ajax = function (config, cb) {
      function refreshSpinBuffer() {
        setTimeout(function () {
          $('.stk-refresh-btn .fa-refresh').removeClass('fa-spin')
        }, 500)
      }

      var responseAction = {}
      if (cb.error) responseAction.error = cb.error
      responseAction.success = function (data) {
        disableFeature(false)
        cb.success && cb.success(data)
      }
      responseAction.fail = function (data) {
        cb.fail && cb.fail(data)
      }
      responseAction.always = function () {
        refreshSpinBuffer()
        cb.always && cb.always()
      }

      disableFeature(true)
      $('.stk-refresh-btn .fa-refresh').addClass('fa-spin')

      servkit.ajax(config, responseAction)
    }
    var reqFailHandler = function (data, configCRUDType) {
      var errorMsg = '動作失敗，請聯絡系統管理員。'
      if (configCRUDType.fail && typeof configCRUDType.fail === 'function') {
        errorMsg = configCRUDType.fail(data)
        $reqFailDialog.html('<p>' + errorMsg + '</p>')
        $reqFailDialog.dialog('open')
      } else {
        if (data === 'i18n_ServCloud_StdCrud_Foreign_Key') {
          errorMsg = i18n('StdCrud_Foreign_Key')
        } else {
          console.warn('請求(' + configCRUDType.url + ')錯誤未處理: ' + data)
        }
        $.smallBox({
          title: errorMsg,
          color: servkit.colors.red,
        })
      }
    }
    var saveFunc = function (trTarget) {
      // 按下送出後的行為
      var $trTarget = $(trTarget)
      var newData = config.columns ? {} : []
      var newRow
      var formData =
        _.omit($trTarget.data('rowData'), [
          'create_time',
          'create_by',
          'modify_time',
          'modify_by',
        ]) || {}
      const isCreate = trTarget.hasAttribute('stk-create')
      _.extendOwn(
        formData,
        _.reduce(
          columnNames,
          function (result, columnName) {
            var $ele = $trTarget.find(
              "input[name='" +
                columnName +
                "'], textarea[name='" +
                columnName +
                "']"
            )
            if ($ele.hasClass('onoffswitch-checkbox')) {
              if ($ele.prop('checked')) {
                result[columnName] = 'Y'
              } else {
                result[columnName] = 'N'
              }
            } else if ($ele.next().hasClass('bootstrap-tagsinput')) {
              // tagsinput
              result[columnName] = _.compact(
                $ele
                  .val()
                  .split(',')
                  .concat($ele.next().find('input').val().split(','))
              ).join(',')
            } else if ($ele.length) {
              result[columnName] = $ele.val()
            } else {
              $ele = $trTarget.find("select[name='" + columnName + "']")
              if ($ele.length) {
                result[columnName] = $ele.val()
                // if (result[columnName] && $ele.attr('multiple') !== undefined) {
                //   result[columnName] = []
                // }
              }
            }
            return result
          },
          {}
        )
      )

      // 拿掉錯誤訊息
      $trTarget.find('.note-error').remove()

      // 幫她補反斜線或跳脫字元
      if (formData) {
        _.each(formData, function (val, index) {
          formData[index] = servkit.inputDataCheck.checkEscapeSymbol(val)
        })
      }

      // 這是一個新增動作
      if (isCreate) {
        if (config.create.send) {
          _.extendOwn(
            formData,
            config.create.send(getRowCellsExcludeHeadTail(trTarget))
          )
        }
        // 進行資料的驗證
        validate($trTarget, formData, isCreate).then((isValid) => {
          if (!isValid) {
            return
          }
          if (config.tableModel) {
            formData.tableModel = config.tableModel
          }

          ajax(
            {
              url: config.create.url,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(formData),
            },
            {
              success: function (data) {
                let columnName
                let columnValue
                _.each(getRowCellsExcludeHeadTail(trTarget), function (td, i) {
                  if (config.create.end && config.create.end[i + 1]) {
                    columnValue = config.create.end[i + 1](td, formData)
                  } else if (td.querySelector('.onoffswitch')) {
                    columnValue = valueToView({
                      switchValue: $(td).find(':checkbox').prop('checked'),
                    })
                  } else {
                    var ele = td.querySelector('input, select, textarea')
                    if (
                      ele instanceof window.HTMLInputElement ||
                      ele instanceof window.HTMLTextAreaElement
                    ) {
                      columnValue = $(ele).val()
                    } else if (
                      ele instanceof window.HTMLSelectElement &&
                      ele.getAttribute('multiple') === null
                    ) {
                      columnValue = $(ele).find('option:selected').text()
                    } else if (ele instanceof window.HTMLSelectElement) {
                      columnValue = valueToView(
                        _.chain(ele.children)
                          .filter(function (option) {
                            return option.selected
                          })
                          .map(function (option) {
                            return option.textContent
                          })
                          .value()
                      )
                    }
                  }
                  if (config.columns) {
                    columnName = td.querySelector('[name]').name
                    newData[columnName] = columnValue
                  } else {
                    newData.push(columnValue)
                  }
                })
                if (config.columns) {
                  newData.isNewCreate = true
                }
                newRow = table.row.add(newData).draw().node()

                if (config.ajax) {
                  $('html, body').animate(
                    {
                      scrollTop: $(newRow).find('td').offset().top,
                    },
                    1000
                  )
                  bling(4, 300, $(newRow).find('td'), 'rgba(0, 255, 0, 0.2)')
                } else {
                  newRow.setAttribute('stk-db-id', JSON.stringify(data))
                  $(newRow).data('rowData', formData)

                  var index
                  for (let row = 0; row < table.data().length; row++) {
                    if (
                      $(table.rows(row).nodes()[0]).attr('stk-db-id') ===
                      JSON.stringify(data)
                    ) {
                      newRow = table.rows(row).nodes()[0]
                      index =
                        table
                          .rows({
                            order: 'applied',
                          })
                          .nodes()
                          .indexOf(newRow) + 1
                    }
                  }

                  table
                    .page(
                      index % table.page.len() === 0
                        ? Math.floor(index / table.page.len()) - 1
                        : Math.floor(index / table.page.len())
                    )
                    .draw(false)
                  $('html, body').animate(
                    {
                      scrollTop: $(newRow).find('td').offset().top,
                    },
                    1000
                  )
                  bling(4, 300, $(newRow).find('td'), 'rgba(0, 255, 0, 0.2)')
                }

                // 更新完 table 後執行
                if (
                  config.create.finalDo &&
                  typeof config.create.finalDo === 'function'
                ) {
                  config.create.finalDo(newRow)
                }
                if (config['delete']['unavailable']) {
                  showRowLeft(false)
                }
                if (config['update']['unavailable']) {
                  showRowRight(false)
                }

                if (!_.isEmpty(selectFilter)) {
                  const tableData = table.data()
                  fillSelectFilterOptions(tableData)
                }
                if (config.modal) {
                  $(config.modal.id).modal('hide')
                }
              },
              fail: function (data) {
                reqFailHandler(data, config.create)
              },
            }
          )
        })

        // 這是一個修改動作
      } else {
        if (!formData[entityPk]) {
          formData[entityPk] = JSON.parse(trTarget.getAttribute('stk-db-id'))
        }

        if (config.update.send) {
          _.extendOwn(
            formData,
            config.update.send(getRowCellsExcludeHeadTail(trTarget))
          )
        }
        // 進行資料的驗證
        validate($trTarget, formData, isCreate).then((isValid) => {
          if (!isValid) {
            return
          }
          if (config.tableModel) {
            formData.tableModel = config.tableModel
          }

          ajax(
            {
              url: config.update.url,
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(formData),
            },
            {
              success: function (data) {
                let columnName
                let columnValue
                _.each(getRowCellsExcludeHeadTail(trTarget), function (td, i) {
                  if (config.update.end && config.update.end[i + 1]) {
                    columnValue = config.update.end[i + 1](td, formData)
                  } else if (td.querySelector('.onoffswitch')) {
                    columnValue = valueToView({
                      switchValue: $(td).find(':checkbox').prop('checked'),
                    })
                  } else {
                    var ele = td.querySelector('input, select, textarea')
                    if (
                      ele instanceof window.HTMLInputElement ||
                      ele instanceof window.HTMLTextAreaElement
                    ) {
                      columnValue = $(ele).val()
                    } else if (
                      ele instanceof window.HTMLSelectElement &&
                      ele.getAttribute('multiple') === null
                    ) {
                      columnValue = $(ele).find('option:selected').text()
                    } else if (ele instanceof window.HTMLSelectElement) {
                      columnValue = valueToView(
                        _.chain(ele.children)
                          .filter(function (option) {
                            return option.selected
                          })
                          .map(function (option) {
                            return option.textContent
                          })
                          .value()
                      )
                    }
                  }
                  if (config.columns) {
                    columnName = td.querySelector('[name]').name
                    newData[columnName] = columnValue
                  } else {
                    newData.push(columnValue)
                  }
                })
                newRow = table
                  .row(trEditTemp)
                  .data(
                    config.columns
                      ? _.extend(table.row(trEditTemp).data(), newData)
                      : newData
                  )
                  .draw(false)
                  .node()
                newRow.setAttribute('stk-db-id', JSON.stringify(data))
                bling(4, 300, $(newRow).find('td'), 'rgba(0, 255, 0, 0.2)')

                // 更新完 table 後執行
                if (
                  config.update.finalDo &&
                  typeof config.update.finalDo === 'function'
                ) {
                  config.update.finalDo(newRow)
                }
                if (config['delete']['unavailable']) {
                  showRowLeft(false)
                }
                if (config['update']['unavailable']) {
                  showRowRight(false)
                }
                if (!_.isEmpty(selectFilter)) {
                  const tableData = table.data()
                  fillSelectFilterOptions(tableData)
                }
                if (config.modal) {
                  $(config.modal.id).modal('hide')
                }
              },
              fail: function (data) {
                reqFailHandler(data, config.update)
              },
            }
          )
        })
      }
    }
    const validate = ($trTarget, formData, isCreate) => {
      let isValid = true
      return new Promise((res) => {
        // 根據DB欄位類型、長度等等驗證
        if (checkTableData) {
          _.each(formData, function (val, columnName) {
            // 確認是否有之後會再轉換型態的欄位
            if (checkTableData[columnName]) {
              // let type = checkTableData[columnName].type
              // let size = checkTableData[columnName].size
              const errorMsg = servkit.inputDataCheck.switchFunc(
                val,
                checkTableData[columnName]
              )
              if (errorMsg) {
                const $target = $trTarget.find(`[name=${columnName}]`)
                isValid = false
                if ($target.parent()[0].insertAdjacentHTML) {
                  $target
                    .parent()[0]
                    .insertAdjacentHTML(
                      'beforeend',
                      "<code class='note-error'>" + errorMsg + '</code>'
                    )
                } else if ($target.nodeName) {
                  console.warn(
                    `${columnName}此欄沒有通過DB欄位型態的檢查，且未出現於畫面中無法顯示錯誤訊息，請再確認。附上此欄的值和欄位資訊`,
                    val,
                    checkTableData[columnName]
                  )
                }
              }
            }
          })
        }
        res()
      }).then(() => {
        if (config.validate) {
          return new Promise((res) => {
            // 重複ID驗證
            if (
              config.validate.entityPk &&
              typeof config.validate.entityPk === 'function' &&
              isCreate
            ) {
              var entityPkValue = config.validate.entityPk(
                getRowCellsExcludeHeadTail($trTarget[0])
              )
              if (config.validate.async && config.validate.async.pk) {
                return config.validate.async
                  .pk(entityPkValue)
                  .then((isDuplicate) => {
                    if (isDuplicate) {
                      _.each($trTarget.find('[stk-pk]'), function (pkEle) {
                        isValid = false
                        var td = $(pkEle).parent()[0]
                        if (!td.querySelector('.note-error')) {
                          td.insertAdjacentHTML(
                            'beforeend',
                            `<code class='note-error'>${
                              config.validate.entityPkErrorMsg || 'ID exists!!'
                            }</code>`
                          )
                        }
                      })
                    }
                    res()
                  })
              } else {
                const rows = table.rows().nodes()
                const duplicatePk =
                  rows.length === 1 && _.isArray(rows[0])
                    ? false
                    : _.find(rows, function (tr) {
                        return _.isEqual(
                          entityPkValue,
                          JSON.parse(tr.getAttribute('stk-db-id'))
                        )
                      })

                if (duplicatePk) {
                  _.each($trTarget.find('[stk-pk]'), function (pkEle) {
                    isValid = false
                    var td = $(pkEle).parent()[0]
                    if (!td.querySelector('.note-error')) {
                      td.insertAdjacentHTML(
                        'beforeend',
                        `<code class='note-error'>${
                          config.validate.entityPkErrorMsg || 'ID exists!!'
                        }</code>`
                      )
                    }
                  })
                }
                res()
              }
            } else {
              res()
            }
          }).then(() => {
            // 自訂驗證
            const promiseAr = getRowCellsExcludeHeadTail($trTarget[0]).map(
              (td, i) => {
                if (config.validate[i + 1]) {
                  var msg = config.validate[i + 1](td, table)
                  if (msg) {
                    isValid = false
                    if (!td.querySelector('.note-error')) {
                      td.insertAdjacentHTML(
                        'beforeend',
                        "<code class='note-error'>" + msg + '</code>'
                      )
                    }
                  }
                  return Promise.resolve()
                } else if (
                  config.validate.async &&
                  config.validate.async[i + 1]
                ) {
                  return config.validate.async[i + 1](td, table).then((msg) => {
                    if (msg) {
                      isValid = false
                      if (!td.querySelector('.note-error')) {
                        td.insertAdjacentHTML(
                          'beforeend',
                          "<code class='note-error'>" + msg + '</code>'
                        )
                      }
                    }
                    return Promise.resolve()
                  })
                } else {
                  return Promise.resolve()
                }
              }
            )
            return Promise.all(promiseAr).then(() => {
              return Promise.resolve(isValid)
            })
          })
        } else {
          return Promise.resolve(isValid)
        }
      })
    }
    const fillSelectFilterOptions = (tableData) => {
      if (!tableData) {
        return
      }
      const isDataObject = !!config.columns
      let optionsArr
      let allColumnNames = []
      let columnName
      let colConfig
      let selectValue
      if (isDataObject) {
        allColumnNames = _.pluck(config.columns, 'name')
      }
      _.each(selectFilter, (select, i) => {
        selectValue = select.value
        columnName = isDataObject ? allColumnNames[i] : i
        colConfig = isDataObject
          ? config.columns.find((map) => map.name === columnName)
          : {}
        optionsArr = _.chain(tableData)
          .pluck(columnName)
          .uniq()
          .map((s) => ({ name: s.toString() }))
          .sort(servkit.naturalCompareValue)
          .map(
            (opt) =>
              `<option value="${opt.name}">${
                colConfig.render
                  ? colConfig.render(opt.name, 'display')
                  : opt.name
              }</option>`
          )
          .value()
        optionsArr.unshift(`<option value="">${i18n('Filter')}</option>`)
        $(select).html(optionsArr.join(''))
        select.value = selectValue
      })
    }
    const changeReadUrl = (url, requestParam) => {
      if (_.isObject(url)) {
        _.extend(config.read, _.pick(url, ['url', 'whereClause', 'whereParam']))
      } else if (url && _.isString(url)) {
        config.read.url = url
      }
      if (requestParam && _.isObject(requestParam)) {
        if (config.read.requestParam) {
          Object.assign(config.read.requestParam, requestParam)
        } else {
          config.read.requestParam = requestParam
        }
      }
    }
    const getBlingRow = function (colNum, data) {
      var index
      var newRow
      for (let row = 0; row < table.data().length; row++) {
        let text
        if (
          $(table.rows(row).nodes()[0]).find('td:eq(0)').hasClass('hidden-xs')
        )
          text = $(table.rows(row).nodes()[0])
            .find('td:eq(' + (colNum + 1) + ')')
            .text()
        else
          text = $(table.rows(row).nodes()[0])
            .find('td:eq(' + colNum + ')')
            .text()
        if (text === data) {
          newRow = table.rows(row).nodes()[0]
          index =
            table
              .rows({
                order: 'applied',
              })
              .nodes()
              .indexOf(newRow) + 1
        }
      }
      if (index !== undefined)
        table
          .page(
            index % table.page.len() === 0
              ? Math.floor(index / table.page.len()) - 1
              : Math.floor(index / table.page.len())
          )
          .draw(false)
      bling(4, 300, $(newRow).find('td'), 'rgba(0, 255, 0, 0.2)')
    }
    $stkCrudTableEle.find('thead th > select').on('change', function () {
      // 處理溢出字元
      let regExSearch
      const colIndex = $(this).parent().index() - 1 // 前面有checkbox
      if (this.value === '') {
        regExSearch = ''
      } else if (this.value === '__empty_string__') {
        regExSearch = '^$'
      } else if (config.ajax) {
        regExSearch = `^${this.value}$`
      } else {
        regExSearch = `^${this.value
          .toString()
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`
      }
      table
        .column(colIndex + ':visible')
        .search(regExSearch, true, false)
        .draw()
    })
    var responsiveHelper
    var breakpointDefinition = {
      tablet: 991,
      phone: 767,
    }

    if (config.naturalSortColumn) {
      config.columnDefs = [
        {
          type: 'natural-nohtml',
          targets: config.naturalSortColumn,
        },
      ]
    }

    let isAddCustomBtn = false
    var table = $stkCrudTableEle.DataTable(
      _.extend(
        {
          sDom:
            "<'dt-toolbar'<'col-xs-12 col-sm-6 hide table-search'f>r>" +
            't' +
            "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs table-info text-center'i><'col-xs-12 col-sm-4'p>>",
          autoWidth: false,
          destroy: true,
          order: config.order || [[0, 'asc']],
          language: {
            sProcessing: i18n('sProcessing'),
            sLengthMenu: i18n('sLengthMenu'),
            sZeroRecords: i18n('sZeroRecords'),
            sInfo: i18n('sInfo'),
            sInfoEmpty: i18n('sInfoEmpty'),
            sInfoFiltered: i18n('sInfoFiltered'),
            sInfoPostFix: '',
            sSearch: i18n('sSearch'),
            sEmptyTable: i18n('sEmptyTable'),
            sLoadingRecords: i18n('sLoadingRecords'),
            sInfoThousands: i18n('sInfoThousands'),
            paginate: {
              sFirst: i18n('oPaginate_sFirst'),
              sPrevious: i18n('oPaginate_sPrevious'),
              sNext: i18n('oPaginate_sNext'),
              sLast: i18n('oPaginate_sLast'),
            },
            aria: {
              sSortAscending: i18n('oAria_sSortAscending'),
              sSortDescending: i18n('oAria_sSortDescending'),
            },
          },
          headerCallback: function () {
            if (
              $stkCrudTableEle.find(
                'i.fa.fa-question-circle.fa-question-circle'
              ).length === 0
            ) {
              $stkCrudTableEle
                .find('th[data-original-title]')
                .append("<i class='fa fa-question-circle'></i>")
                .tooltip({
                  container: 'body',
                  html: 'true',
                })
            }
            // <thead> 中的每列補上頭的 checkbox 與尾的 action
            if (stkCrudTableEle.querySelector('thead th').firstElementChild) {
              $stkCrudTableEle
                .find('thead > tr:first-child')
                .prepend(html.deleteUnvailable)
                .append(html.updateUnvailable)
              if (config['delete']['unavailable']) {
                $stkCrudTableEle
                  .find('thead > tr:last-child')
                  .prepend(html.deleteUnvailable)
                  .append(html.headWrench)
              } else {
                $stkCrudTableEle
                  .find('thead > tr:last-child')
                  .prepend(html.headCheckbox)
                  .append(html.headWrench)
              }
              stkDeleteAllCheckboxEle = stkCrudTableEle.querySelector(
                '.stk-delete-all-checkbox'
              )
            }
          },
          preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper) {
              responsiveHelper = new ResponsiveDatatablesHelper(
                $stkCrudTableEle,
                breakpointDefinition
              )
            }
          },
          rowCallback: function (nRow, data) {
            responsiveHelper.createExpandIcon(nRow)

            var $nRow = $(nRow)
            // 填入每列第一欄的 checkbox 和最後一欄的 edit btn
            // if ($nRow.find('> td').length < columnNames.length + 2) {
            if (config['delete']['unavailable']) {
              if (
                !$nRow.children(':first').hasClass('crud-delete-unavailable')
              ) {
                $nRow.prepend(html.deleteUnvailableTd)
              }
            } else {
              if (!$nRow.find('td:first').find('[type=checkbox]').length) {
                $nRow.prepend(html.deleteCheckbox)
              }
            }
            if (config['update']['unavailable']) {
              if (
                !$nRow.children(':last').hasClass('crud-update-unavailable')
              ) {
                $nRow.append(html.updateUnvailableTd)
              }
            } else {
              if (!$nRow.find('td:last').find('.stk-edit-btn').length) {
                $nRow.append(html.editRowBtn)
              }
            }
            // }

            if (config.onRow) {
              config.onRow(nRow, data)
            }
          },
          drawCallback: function () {
            if (!isAddCustomBtn) {
              $stkCrudTableEle.prev().prepend(
                (function () {
                  var node = document.createElement('DIV')
                  node.classList.value = 'col-xs-12 col-sm-6'
                  if (!config['delete']['unavailable']) {
                    node.insertAdjacentHTML('beforeend', html.deleteBtn)
                  }
                  if (!config['create']['unavailable']) {
                    node.insertAdjacentHTML('beforeend', html.insertBtn)
                  }
                  node.insertAdjacentHTML('beforeend', html.refreshBtn)
                  if (config['rowReorder']) {
                    node.insertAdjacentHTML('beforeend', html.saveOrderBtn)
                  }
                  if (config['excel']) {
                    node.insertAdjacentHTML('beforeend', html.excelBtn)
                  }
                  if (config['read']['dataset']) {
                    node.insertAdjacentHTML('beforeend', html.datasetSelect)
                  }
                  if (config.customBtns) {
                    _.each(config.customBtns, function (ele) {
                      if (ele instanceof HTMLElement) node.appendChild(ele)
                      else node.insertAdjacentHTML('beforeend', ele)
                    })
                  }
                  return node
                })()
              )
              isAddCustomBtn = true
            }
            if (config['delete']['unavailable']) {
              showRowLeft(false)
            }

            if (config['update']['unavailable']) {
              showRowRight(false)
            }

            alignTableCell($stkCrudTableEle, config.rightColumn, 'text-right')
            alignTableCell($stkCrudTableEle, config.leftColumn, 'text-left')
            alignTableCell($stkCrudTableEle, config.centerColumn, 'text-center')

            responsiveHelper.respond()

            // 因為加上了 checkbox 和 action 兩欄，所以提示無資料的 td 要將 colspan 加 2
            var $emptyTipRow = $stkCrudTableEle.find('.dataTables_empty')
            if ($emptyTipRow.length > 0) {
              $emptyTipRow.attr('colspan', $emptyTipRow.attr('colspan') + 2)
            }

            // input template 的 width 要設定成計算出來的，不然寬度會一直亂跳
            // $stkCrudTableEle.find('thead > tr:first-child th').each(function (i) {
            //   var inputEle = this.querySelector('input')
            //   var tdTemplate = trEleTemplate.querySelectorAll('td')[i]
            //   if (inputEle) {
            //     // tdTemplate.firstElementChild.style.width = window.getComputedStyle(inputEle).width
            //     tdTemplate.firstElementChild.className += ' full-width'
            //     tdTemplate.style.padding = window.getComputedStyle(inputEle.parentNode).padding
            //   }
            // })
            if (config.onDraw) {
              var api = this.api()
              config.onDraw(
                _.map(api.data(), function (d) {
                  return d
                }),
                _.map(
                  api
                    .rows({
                      page: 'current',
                    })
                    .data(),
                  function (d) {
                    return d
                  }
                ),
                api
              )
            }

            if (config.hideCols) {
              var cols = _.map(config.hideCols, (index) => {
                return `tr>th:nth-child(${index + 1}), tr>td:nth-child(${
                  index + 1
                })`
              }).join(',')
              $stkCrudTableEle.find(cols).addClass('hide')
            }

            // 排序沒辦法在執行到一半拿掉的話，只好在 draw 完後開啟所有按鈕，避免在編輯狀態按到排序
            disableFeature(false)
          },
          /*
          datatable新增一個row時觸發
          參數:
            row: tr的html
            data: row的資料，格式為array ["資料1", "資料2", "資料3"];
            dataIndex: datatable裡面資料的index (0~n)
        */
          createdRow: function (row, data, dataIndex) {
            if (config.rowReorder) {
              $(row).attr('id', 'row-' + dataIndex) // tr一定要有ID才能排序
            }
          },
        },
        config
      )
    )

    $stkCrudTableEle.data('crudTable', table)
    $stkCrudTableEle.data('crudTableConfig', config)

    // responsive
    table.on('resize', function () {
      // 若在編輯模式下
      if (window.outerWidth < breakpointDefinition.tablet) {
        $('.stk-cancel-btn').trigger('click')
      }
      // 判斷沒有thead頭尾時
      if (stkCrudTableEle.querySelector('thead th').firstElementChild) {
        // 重新把thead頭尾補上
        disableFeature(false)
        $stkCrudTableEle
          .find('thead > tr:first-child')
          .prepend(html.deleteUnvailable)
          .append(html.updateUnvailable)
        if (config['delete']['unavailable']) {
          $stkCrudTableEle
            .find('thead > tr:last-child')
            .prepend(html.deleteUnvailable)
            .append(html.headWrench)
        } else {
          $stkCrudTableEle
            .find('thead > tr:last-child')
            .prepend(html.headCheckbox)
            .append(html.headWrench)
        }
        stkDeleteAllCheckboxEle = stkCrudTableEle.querySelector(
          '.stk-delete-all-checkbox'
        )

        // 先把stk-edit-btn刪掉再加到最後一欄
        $stkCrudTableEle
          .find('.stk-edit-btn, .crud-update-unavailable')
          .each(function () {
            var thisTr = $(this).closest('tr')
            $(this).closest('td').detach().appendTo(thisTr)
          })

        if (config['delete']['unavailable']) {
          showRowLeft(false)
        }

        if (config['update']['unavailable']) {
          showRowRight(false)
        }
      }
    })

    if (config.rowReorder) {
      $stkCrudTableEle
        .DataTable()
        .rowReordering(
          config.rowReorder.option && _.isObject(config.rowReorder.option)
            ? config.rowReorder.option
            : null
        )
    }

    // 過濾欄位事件綁定
    $stkCrudTableEle.find('thead th > input[type=text]').on(
      'keyup change',
      _.debounce(function () {
        table
          .column($(this).parent().index() - 1 + ':visible') // 減 1 的用意是因為第一欄已經被塞了 checkbox
          .search(this.value)
          .draw()
      }, 500)
    )

    if (!config['delete']['unavailable']) {
      // 換頁要先確認此頁的 deleteAll 是否有被 checked，然後把所有 disabled 的 element 都打開
      $stkCrudTableEle.on('page.dt', function () {
        if (pageAllSelectCheckbox[table.page.info().page]) {
          stkDeleteAllCheckboxEle.checked = true
        } else {
          stkDeleteAllCheckboxEle.checked = false
        }

        disableFeature(false)
      })

      // checkbox 全選
      $stkCrudTableEle.on('change', '.stk-delete-all-checkbox', function (e) {
        pageAllSelectCheckbox[table.page.info().page] = e.target.checked
        $stkCrudTableEle.find('tbody tr td:first-child').each(function () {
          if (!this.firstElementChild.disabled)
            this.firstElementChild.checked = e.target.checked
        })
      })

      // 刪除確認的 Dialog
      $stkCrudTableEle.append($deleteCheckDialog)
      $.widget(
        'ui.dialog',
        $.extend({}, $.ui.dialog.prototype, {
          // 讓 Dialog 的 title 可以用 HTML 字串來設定
          _title: function (title) {
            if (!this.options.title) {
              title.html('&#160;')
            } else {
              title.html(this.options.title)
            }
          },
        })
      )
      $deleteCheckDialog.dialog({
        autoOpen: false,
        width: 600,
        resizable: false,
        // modal: true,
        title:
          "<div class='widget-header'><h4><i class='fa fa-warning'></i> " +
          i18n('Delete_title') +
          ' </h4></div>',
        buttons: [
          {
            html: '<i class="fa fa-trash-o"></i>&nbsp; ' + i18n('Yes_Delete'),
            class: 'btn btn-danger',
            click: function () {
              var $this = $(this)
              $this.dialog('close')
              ajax(
                {
                  url:
                    config['delete'].url === 'api/stdcrud' && config.tableModel
                      ? config['delete'].url +
                        `?tableModel=${config.tableModel}&key=${entityPk}`
                      : config['delete'].url,
                  type: 'DELETE',
                  contentType: 'application/json',
                  data: $this.data('deleteIds'),
                },
                {
                  success: function () {
                    _.each(getSelectedRow(), function (trEle) {
                      table.row(trEle).remove()
                    })
                    table.draw()

                    pageAllSelectCheckbox[table.page.info().page] = false
                    stkDeleteAllCheckboxEle.checked = false

                    // delete 完之後執行
                    if (
                      config['delete'].finalDo &&
                      typeof config['delete'].finalDo === 'function'
                    ) {
                      config['delete'].finalDo($this.data('deleteIds'))
                    }

                    if (!_.isEmpty(selectFilter)) {
                      const tableData = table.data()
                      fillSelectFilterOptions(tableData)
                    }
                  },
                  fail: function (data) {
                    reqFailHandler(data, config['delete'])
                    disableFeature(false)
                  },
                }
              )
            },
          },
          {
            html: '<i class="fa fa-times"></i>&nbsp; ' + i18n('No_Delete'),
            class: 'btn btn-default',
            click: function () {
              $(this).dialog('close')
            },
          },
        ],
      })
    } // end of delete.unavailible check

    // fail dialog
    $stkCrudTableEle.append($reqFailDialog)
    $reqFailDialog.dialog({
      autoOpen: false,
      resizable: false,
      modal: true,
      title:
        "<div class='widget-header'><h4><i class='fa fa-warning'></i> Error!!</h4></div>",
      buttons: [
        {
          html: "<i class='fa fa-frown-o'></i>&nbsp; OK",
          class: 'btn btn-primary',
          click: function () {
            $(this).dialog('close')
          },
        },
      ],
    })

    const $tbody = $stkCrudTableEle.find('tbody')
    $tbody
      // 按下儲存
      .on('click', '.stk-save-btn', function () {
        var trTarget = this.parentNode.parentNode
        saveFunc(trTarget)
      })
      // multiselect without ctrl
      .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
      .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)
      // 按下編輯
      .on('click', '.stk-edit-btn', function () {
        var oldTr = this.parentNode.parentNode

        var newTr
        if (config.modal) {
          newTr = $(config.modal.id).find('form')[0]
          $(newTr).find('.note-error').remove()
        } else {
          newTr = trEleTemplate.cloneNode(true)
        }
        trEditTemp = oldTr

        for (var i = 0; i <= columnNames.length; i++) {
          var newTd = newTr.children[i]
          if (config.modal) {
            i
              ? (newTd = $(newTr)
                  .find('[name=' + columnNames[i - 1] + ']')
                  .closest('label')[0])
              : (newTd = null)
          }
          if (config.update.start && config.update.start[i]) {
            config.update.start[i](
              oldTr.children[i],
              newTd,
              oldTr,
              newTr,
              table
            )
          } else {
            var formElement = newTd
              ? newTd.querySelector('input, select, textarea')
              : null
            if (formElement) {
              viewToFormElement(oldTr.children[i], formElement)
            }
            if (formElement && formElement.hasAttribute('stk-pk')) {
              formElement.disabled = true
            }
            if ($(formElement).hasClass('onoffswitch-checkbox')) {
              if (oldTr.children[i].textContent === 'ON') {
                formElement.checked = true
              } else {
                formElement.checked = false
              }
            }
          }
        }
        $(newTr).data('rowData', $(oldTr).data('rowData'))
        if (config.modal) {
          $(config.modal.id).find('form').removeAttr('stk-create')
          if (
            config.modal.headFunc &&
            typeof config.modal.headFunc === 'function'
          ) {
            config.modal.headFunc(oldTr)
          }
          if (
            config.modal.bodyFunc &&
            typeof config.modal.bodyFunc === 'function'
          ) {
            config.modal.bodyFunc(oldTr)
          }
          $(config.modal.id).modal('show')
        } else {
          if (config['delete']['unavailable']) {
            showRowLeft(true)
          }

          trEditTemp = oldTr
          swapTr(newTr, oldTr)

          if (newTr.querySelector('input:not([disabled])')) {
            newTr.querySelector('input:not([disabled])').focus()
          }

          disableFeature(true)
        }
      })
      // 按下取消，若是新增的就直接移除，若是修改的要用暫存的 tr 還原回去
      .on('click', '.stk-cancel-btn', function () {
        var tr = this.parentNode.parentNode
        if (tr.hasAttribute('stk-create')) {
          $(tr).remove()
        } else {
          tr.parentNode.replaceChild(trEditTemp, tr)
        }
        disableFeature(false)
        if (config['update']['unavailable']) {
          showRowRight(false)
        }
        if (config['delete']['unavailable']) {
          showRowLeft(false)
        }
      })

    if (config.modal) {
      // modal按下儲存
      $(config.modal.id)
        .find('.modal-footer')
        .on('click', 'button', function () {
          var trTarget = $(this).closest('.modal-content').find('form')[0]
          saveFunc(trTarget)
        })
    }
    const refreshTable = () => {
      if (config.ajax) {
        $('.stk-refresh-btn .fa-refresh').addClass('fa-spin')
        table.clearPipeline().draw()
        setTimeout(
          () => $('.stk-refresh-btn .fa-refresh').removeClass('fa-spin'),
          1000
        )
      } else {
        // 資料分段取
        var readParam = {},
          setCounts,
          $datasetSelect,
          datasetVal
        if (config.read.dataset) {
          setCounts = config.read.dataset.setCounts || 1000
          $datasetSelect = $stkCrudTableEle
            .prev()
            .find('.stk-dt-dataset-select')
          datasetVal = $datasetSelect.val() || 0
          readParam = {
            startPosition: datasetVal * setCounts,
            setCounts: setCounts,
          }
          // console.log(readParam);
        }
        var readURL = config.read.url || 'api/stdcrud'
        if (readURL === 'api/stdcrud') {
          if (config.tableModel) {
            readParam.tableModel = config.tableModel
          }
          if (config.read.whereClause) {
            readParam.whereClause = config.read.whereClause
          }
        }
        if (readURL === 'api/getdata/db') {
          if (config.read.whereClause) {
            readParam.whereClause = config.read.whereClause
          }
        }
        if (config.read.requestParam) {
          Object.assign(readParam, config.read.requestParam)
        }
        const ajaxConfig = {
          url: readURL,
          type: config.read.type || 'GET',
          data: readParam,
        }
        if (ajaxConfig.type !== 'GET') {
          ajaxConfig.contentType = 'application/json'
          ajaxConfig.data = JSON.stringify(readParam)
        }
        return new Promise((res) => {
          ajax(ajaxConfig, {
            success: function (respDdata) {
              res(respDdata)
            },
            fail: function (data) {
              reqFailHandler(data, config.read)
            },
          })
        }).then((respDdata) => {
          var data = respDdata
          if (config.read.dataset) {
            var totalCounts = respDdata.totalCounts
            data = respDdata.data
            // console.log(totalCounts, setCounts, Math.ceil(totalCounts / setCounts));
            var optionsHtml = _.chain(Math.ceil(totalCounts / setCounts))
              .range()
              .map(function (e) {
                return (
                  '<option value="' +
                  e +
                  '">' +
                  i18n('Data_Set') +
                  ' ' +
                  (e + 1) +
                  '</option>'
                )
              })
              .value()
              .join('')
            $datasetSelect.html(optionsHtml).val(datasetVal)
          }

          table.clear()

          var newData
          if (config.columns) {
            newData = _.map(data, function (rowData) {
              return _.mapObject(rowData, function (value, key) {
                var index = _.findIndex(config.columns, function (col) {
                  return col.data === key
                })
                const select = $(trEleTemplate).find('[name=' + key + ']')[0]
                if (config.read.end && config.read.end[index + 1]) {
                  return valueToView(config.read.end[index + 1](value, rowData))
                } else if (
                  $(trEleTemplate)
                    .find('[name=' + key + ']')
                    .hasClass('onoffswitch-checkbox')
                ) {
                  return valueToView({
                    switchValue: value,
                  })
                } else if (
                  select instanceof window.HTMLSelectElement &&
                  !_.isArray(value)
                ) {
                  try {
                    return _.find(select.children, function (option) {
                      return option.value === value
                    }).textContent
                  } catch (error) {
                    return valueToView(value)
                  }
                } else {
                  return valueToView(value)
                }
              })
            })
          } else {
            newData = _.map(data, function (ele) {
              return _.map(columnNames, function (columnName, i) {
                const select = $(trEleTemplate).find(
                  '[name=' + columnName + ']'
                )[0]
                if (config.read.end && config.read.end[i + 1]) {
                  return valueToView(
                    config.read.end[i + 1](ele[columnName], ele)
                  )
                } else if (
                  $(trEleTemplate)
                    .find('[name=' + columnName + ']')
                    .hasClass('onoffswitch-checkbox')
                ) {
                  return valueToView({
                    switchValue: ele[columnName],
                  })
                } else if (
                  select instanceof window.HTMLSelectElement &&
                  !_.isArray(ele[columnName])
                ) {
                  try {
                    return _.find(select.children, function (option) {
                      return option.value === ele[columnName]
                    }).textContent
                  } catch (error) {
                    return valueToView(ele[columnName])
                  }
                } else {
                  return valueToView(ele[columnName])
                }
              })
            })
          }

          var rows = table.rows.add(newData).draw().nodes()

          // 在每列 tr 塞入 stk-db-id
          _.each(data, function (ele, i) {
            rows[i].setAttribute('stk-db-id', JSON.stringify(ele[entityPk]))
            $(rows[i]).data('rowData', ele)
          })

          if (!_.isEmpty(selectFilter)) {
            const tableData = table.data()
            fillSelectFilterOptions(tableData)
          }

          // read 完之後執行
          if (
            config.read.finalDo &&
            typeof config.read.finalDo === 'function'
          ) {
            config.read.finalDo()
          }
        })
      }
    }
    /**
     * DataTable Option中有設定language.url，所以整個initialization變成async
     * initialization後面的code會抓不到table_wrapper或dt_tool(客製dom)
     *  */

    const $crudTableParent = $stkCrudTableEle.closest('div')
    $crudTableParent
      // 按下更新，到後端取整張表載入頁面
      .on('click', '.stk-refresh-btn', function () {
        refreshTable()
      })
      // 按下儲存排序
      .on('click', '.stk-saveOrder-btn', function () {
        var dataList = []
        if (config.rowReorder.index === undefined) {
          console.warn('請定義排序欄位')
          return false
        }
        $stkCrudTableEle.find('tbody > tr').each(function () {
          var obj = {}
          obj[entityPk] = JSON.parse($(this).attr('stk-db-id'))
          obj[config.rowReorder.index] = $(this).find('td:eq(1)').text()
          dataList.push(obj)
        })
        ajax(
          {
            url: config.rowReorder.url,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(dataList),
          },
          {
            success: function () {},
            fail: function (data) {
              reqFailHandler(data, config.rowReorder)
            },
          }
        )
      })
      // 整批刪除
      .on('click', '.stk-delete-btn', function () {
        var deletedRows = getSelectedRow()

        if (deletedRows.length === 0) {
          // 刪除勾選區塊 bling bling 閃爍提示
          bling(
            5,
            100,
            $stkCrudTableEle.find(
              'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
            ),
            'rgba(255, 0, 0, 0.2)'
          )
          return
        }

        var deleteIds = _.map(deletedRows, function (trEle) {
          return JSON.parse(trEle.getAttribute('stk-db-id'))
        })

        if (
          config['delete'].start &&
          typeof config['delete'].start === 'function'
        ) {
          for (var i = 0; i < deleteIds.length; i++) {
            _.extendOwn(deleteIds[i], config['delete'].start(deleteIds[i]))
          }
        }

        let dialogHtml = i18n('Sure_Delete_Data')
        if (
          config['delete'].contentFunc &&
          typeof config['delete'].contentFunc === 'function'
        ) {
          dialogHtml = config['delete'].contentFunc(deleteIds)
        } else if (typeof deleteIds[0] === 'string') {
          dialogHtml = `${deleteIds.join(', ')}, ${i18n('Sure_Delete_Data')}`
        } else {
          console.warn(
            `Your deleteId is not a string array, plz set delete.contentFunc to customize dialog content.`
          )
        }

        if (
          config['delete'].titleFunc &&
          typeof config['delete'].titleFunc === 'function'
        ) {
          $deleteCheckDialog.dialog(
            'option',
            'title',
            config['delete'].titleFunc(deleteIds)
          )
        }

        $deleteCheckDialog
          .data('deleteIds', JSON.stringify(deleteIds))
          .html(dialogHtml)
          .dialog('open')
      })
      // 按下新增，在第一列增加一列新增欄位
      .on('click', '.stk-insert-btn', function () {
        if (config.modal) {
          const $modal = $(config.modal.id)
          $modal
            .find('form')
            .attr('stk-create', true)
            .data('rowData', {})
            .find('.note-error')
            .remove()
          $modal.find('input, select, textarea').each(function () {
            if (this.nodeName !== 'SELECT') {
              $(this).val('')
            } else {
              $(this).val($(this).find('option:first').val())
            }
            if ($(this).attr('stk-pk') !== undefined) {
              $(this).removeAttr('disabled')
            }
          })
          if (
            config.modal.headFunc &&
            typeof config.modal.headFunc === 'function'
          ) {
            config.modal.headFunc(null)
          }
          if (
            config.modal.bodyFunc &&
            typeof config.modal.bodyFunc === 'function'
          ) {
            config.modal.bodyFunc(null)
          }
          if (config.create.start) {
            config.create.start($(config.modal.id).find('form')[0], table)
          }
          $(config.modal.id).modal('show')
        } else {
          if (config['delete']['unavailable']) {
            showRowLeft(true)
          }
          if (config['update']['unavailable']) {
            showRowRight(true)
          }
          disableFeature(true)
          var newTr = trEleTemplate.cloneNode(true)
          $(newTr)
            .attr('stk-create', true)
            .insertBefore($stkCrudTableEle.find('tbody tr:first-child').first())

          if (config.create.start) {
            config.create.start(getRowCellsExcludeHeadTail(newTr), table)
          }

          newTr.querySelector('input').focus()
        }
      })
      // excel 下載
      .on('click', '.stk-excel-btn', function () {
        excelFormId && $('#' + excelFormId).remove()
        excelFormId = 'excelFormId' + ++excelFormCount

        var $submitForm = $('<form id="' + excelFormId + '"></form>')
        var iframeHtml =
          '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
        $submitForm.attr({
          action: servkit.rootPath + config.excel.url,
          method: 'post',
          target: 'download_target',
        })
        $(this).after($submitForm.hide())
        $submitForm.append(iframeHtml)

        document.querySelector('#' + excelFormId).submit()
      })
      .on('change', '.stk-dt-dataset-select', function () {
        $crudTableParent.find('.stk-refresh-btn').trigger('click')
      })

    if (!config.read.preventReadAtFirst) {
      refreshTable()
    }

    return {
      table: table,
      getSelectedRow: getSelectedRow,
      getSelectedRowData: getSelectedRowData,
      selectFilter,
      changeReadUrl,
      refreshTable,
      getBlingRow,
    }
  }
})(this, $, _)

import servkit from '../servkit/servkit.js'
import { servtechConfig } from '../servtech.config.js'
import breakpointDefinition from './breakpointDefinition.js'

// table 編號，為避免同一頁上有多個表而用來辨別用的
var tableCount = 0

function ReportTable(
  table,
  selectFilter,
  $tableElement,
  $tableWidget,
  showNoData,
  config
) {
  this.table = table
  this.selectFilter = selectFilter
  this.$tableElement = $tableElement
  this.$tableWidget = $tableWidget
  this.showNoData = showNoData
  this.config = config
}
ReportTable.prototype.drawTable = function (dataMatrix) {
  const { config, selectFilter } = this
  if (dataMatrix && dataMatrix.length > 0) {
    // select 先搞定
    _.each(selectFilter, function (select, i) {
      const index = config.columns ? config.columns[i].data : i
      const render = config.columns ? config.columns[i].render : null
      var optionArr = _.chain(dataMatrix)
        .uniq((row) => row[index])
        .map(function (row) {
          return `<option value="${
            row[index]
          }">${render ? render(row[index], 'selectFilter', row) : row[index]}</option>`
        })
        .value()
        .sort()
      optionArr.unshift('<option value="">' + i18n('Filter') + '</option>')
      $(select).html(optionArr.join(''))
    })

    // 然後長表格
    this.table
      .clear()
      .rows.add(dataMatrix)
      .columns(_.keys(this.selectFilter))
      .search('') // 可能會被之前暫記住的塞選條件影響到，調回去
      .draw()
  } else {
    // 清 select
    _.each(this.selectFilter, function (select, i) {
      $(select).html('')
    })

    // 清表格
    this.table.clear().draw()

    if (this.showNoData) {
      // 顯示提示
      $('#dialog-no-data').dialog('open')
    }
  }
}
ReportTable.prototype.appendTable = function (filterData, dataMatrix) {
  const { config, selectFilter } = this
  // select 先搞定
  _.each(selectFilter, function (select, i) {
    const index = config.columns ? config.columns[i].data : i
    const render = config.columns ? config.columns[i].render : null
    var optionArr = _.chain(filterData)
      .uniq((row) => row[index])
      .map(function (row) {
        return `<option value="${
          row[index]
        }">${render ? render(row[index], 'selectFilter', row) : row[index]}</option>`
      })
      .value()
      .sort()
    optionArr.unshift('<option value="">' + i18n('Filter') + '</option>')
    $(select).html(optionArr.join(''))
  })

  if (dataMatrix && dataMatrix.length > 0) {
    // 然後長表格
    this.table.rows
      .add(dataMatrix)
      .columns(_.keys(this.selectFilter))
      .search('') // 可能會被之前暫記住的塞選條件影響到，調回去
      .draw()
  }
}
ReportTable.prototype.clearTable = function () {
  this.$tableElement
    .find('thead tr:first-child')
    .find('select, input')
    .each((i, el) => {
      el.value = ''
    })
  this.table.clear().draw()
}
ReportTable.prototype.resetTable = function () {
  this.table.columns().search('')
  this.table.order(this.config.order || [[0, 'asc']])
  this.clearTable()
}
ReportTable.prototype.showWidget = function () {
  if (this.$tableWidget && this.$tableWidget.length) {
    this.$tableWidget.show()
  }
}
ReportTable.prototype.hideWidget = function () {
  if (this.$tableWidget && this.$tableWidget.length) {
    this.$tableWidget.hide()
  }
}
ReportTable.prototype.getSelectedRow = function (isApplySort) {
  var selectedTr = []
  if (isApplySort) {
    this.table
      .rows()
      .nodes()
      .toArray()
      .filter((tr) => $(tr).find(':checked').length)
      .forEach((tr) => selectedTr.push(this.table.row(tr).data()))
  } else {
    for (let row = 0; row < this.table.data().length; row++) {
      if (
        this.table.rows(row).nodes().to$().find(':checkbox').prop('checked')
      ) {
        selectedTr.push(this.table.rows(row).data()[0])
      }
    }
  }
  if (selectedTr.length === 0) {
    bling(
      5,
      100,
      this.$tableElement.find(
        'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
      ),
      'rgba(255, 0, 0, 0.2)'
    )
  }
  return selectedTr
}
ReportTable.prototype.getSelectedTrArray = function () {
  return this.table
    .rows()
    .nodes()
    .toArray()
    .filter((tr) => tr.querySelector('input[type=checkbox]').checked)
}
ReportTable.prototype.toPage = function (tr) {
  const dataCountPerPage = this.table.page.info().length
  const newRowTableIndex = isNaN(+tr) ? this.table.row(tr).index() : tr
  const newRowDisplayIndex = this.table
    .rows()
    .indexes()
    .toArray()
    .findIndex((i) => i === newRowTableIndex)
  const pageIndex = Math.floor((newRowDisplayIndex + 1) / dataCountPerPage)
  this.table.page(pageIndex).draw(false)
}
ReportTable.prototype.clearSearch = function (showingTr) {
  this.$tableElement
    .find('thead tr:first-child')
    .find('select, input')
    .each((i, el) => {
      el.value = ''
    })
  this.table.columns().search('')
  // 清掉搜尋後要跳到同一筆資料的頁數
  if (showingTr) {
    const rowPerPage = this.table.page.info().length
    const tableIndex = this.table.row(showingTr).index()
    const displayIndex = this.table
      .rows()
      .indexes()
      .toArray()
      .findIndex((i) => i === tableIndex)
    const pageIndex = Math.floor(displayIndex / rowPerPage)
    this.table.page(pageIndex)
  }
}
ReportTable.prototype.getBlingRow = function (colNum, data) {
  var index
  var newRow
  for (let row = 0; row < this.table.data().length; row++) {
    if (
      $(this.table.rows(row).nodes()[0])
        .find('td:eq(' + colNum + ')')
        .text() === data
    ) {
      newRow = this.table.rows(row).nodes()[0]
      index =
        this.table
          .rows({
            order: 'applied',
          })
          .nodes()
          .indexOf(newRow) + 1
    }
  }
  if (index !== undefined)
    this.table
      .page(
        index % this.table.page.len() === 0
          ? Math.floor(index / this.table.page.len()) - 1
          : Math.floor(index / this.table.page.len())
      )
      .draw(false)
  bling(4, 300, $(newRow).find('td'), 'rgba(0, 255, 0, 0.2)')
}
ReportTable.prototype.blingRows = function (trs, color) {
  trs.forEach((tr) => bling(4, 300, $(tr), color || 'rgba(0, 255, 0, 0.2)'))
}
ReportTable.prototype.getData = function (row, cell) {
  const isRow = !(row === undefined || row === null)
  const isCell = !(cell === undefined || cell === null)
  if (isRow && isCell) {
    return this.table.cell(row, cell).data()
  } else if (isRow) {
    return this.table.row(row).data()
  } else {
    return this.table.data().toArray()
  }
}
ReportTable.prototype.getObjectData = function (row, columnDefs, type) {
  const isDataList = row === undefined || row === null
  if (isDataList) {
    return this.getData(row).map((data) =>
      this.dataToObject(data, columnDefs, type)
    )
  } else {
    return this.dataToObject(this.getData(row), columnDefs, type)
  }
}
ReportTable.prototype.getArrayData = function (row) {
  const isDataList = row === undefined || row === null
  if (isDataList) {
    return this.getData(row).map((data) => this.dataToArray(data))
  } else {
    return this.dataToArray(this.getData(row))
  }
}
ReportTable.prototype.dataToObject = function (
  data,
  columnDefs = this.config.columnDefinitions,
  type = 'display'
) {
  const columnDefsIndexByName = _.indexBy(columnDefs, 'name')
  const columnCount = columnDefs.length
  const result = Object.fromEntries(
    data.slice(0, columnCount).map((val, i) => [columnDefs[i].name, val])
  )
  return _.mapObject(result, (val, key) =>
    columnDefsIndexByName[key] && columnDefsIndexByName[key].render
      ? columnDefsIndexByName[key].render(val, type, result)
      : val
  )
}
ReportTable.prototype.dataToArray = function (data) {
  return this.config.columns.map(({ name }) => data[name])
}
ReportTable.prototype.toggleFeature = function (isEnable) {
  this.$tableElement
    .find('thead > tr:first-child input, thead > tr:first-child select')
    .attr('disabled', !isEnable)
  this.$tableElement
    .parent()
    .find(".dt-toolbar input[type='search'], .dt-toolbar-footer select")
    .attr('disabled', !isEnable)
  this.$tableElement
    .parent()
    .find('.btn:not(.stk-cancel-btn, .stk-save-btn)')
    .attr('disabled', !isEnable)
  this.$tableElement
    .parent()
    .find('.dt-toolbar-footer > div:last-child')
    .css({
      visibility: isEnable ? 'visible' : 'hidden',
    })
}
var bling = function (blingTimes, frequency, $elements, color) {
  blingTimes = blingTimes * 2 + 1
  var blingCount = 1

  setTimeout(function change() {
    if (blingCount < blingTimes) {
      if (blingCount++ % 2 === 0) {
        $elements.css('background-color', '')
      } else {
        $elements.css('background-color', color)
      }
      setTimeout(change, frequency)
    }
  }, 0)
}

function alignTableCell($tableElement, alignColumnArr, alignClass) {
  if (alignColumnArr) {
    var filterSelector = _.map(alignColumnArr, function (n) {
      return ':nth-of-type(' + (n + 1) + ')' // :nth-of-type starting with 1
    }).join(', ')

    $tableElement
      .find('td:not(.dataTables_empty)')
      .filter(filterSelector)
      .addClass(alignClass)
  }
}

class SummaryInfo {
  constructor(el, config) {
    this.el = el
    this.textContent = ''
    this.config = config
  }
  text(str) {
    this.el.textContent = str
    this.textContent = str
    if (str) {
      this.show()
    } else {
      this.hide()
    }
  }
  show() {
    this.el.classList.remove('hide')
  }
  hide() {
    this.el.classList.add('hide')
  }
}
const initSummaryInfo = (() => {
  const $infoEl = $(`<h4 class="alert alert-info hide"></h4>`)
  return (summaryInfoConfig, wrapperEl) => {
    if (!summaryInfoConfig) {
      return
    }
    const { customPlacement } = summaryInfoConfig
    const cloneInfo = $infoEl.clone()[0]
    if (customPlacement && typeof customPlacement === 'function') {
      customPlacement(cloneInfo, wrapperEl)
    } else {
      wrapperEl
        .closest('.widget-body')
        .insertAdjacentElement('beforeBegin', cloneInfo)
    }
    return new SummaryInfo(cloneInfo, summaryInfoConfig)
  }
})()

function createReportTable(configObj) {
  var responsiveHelper
  var currTableCount = tableCount++
  var stkToolbarClass = 'stk-toolbar-' + currTableCount

  // configObj 內的東西
  var $tableElement = configObj.$tableElement
  var $tableWidget = configObj.$tableWidget
  var rightColumn = configObj.rightColumn
  var leftColumn = configObj.leftColumn
  var centerColumn = configObj.centerColumn
  var onRow = configObj.onRow
  var onDraw = configObj.onDraw
  var excel = configObj.excel
  var showNoData = true // 2017/07/14 Raynard append
  var pageAllSelectCheckbox = []
  var showHideColBtn = ''
  // 挑出過濾欄位中有 select 的
  const selectFilter = {}
  $tableElement.find('thead th').each(function (i, thEle) {
    const select = thEle.querySelector('select')
    if (select) {
      selectFilter[i] = select
    }
  })
  // header 要先保留下來給 excel 下載用，如果在 excel 下載點擊的時後才取有可能會被欄位篩選影響到
  var tableHeader = _.map(
    $tableElement.find('thead tr:nth-of-type(2) *'),
    function (e) {
      return e.textContent.trim()
    }
  )
  if (configObj.showNoData === false) {
    showNoData = configObj.showNoData
  }

  // 佈署查無資料時的提示視窗
  if ($('#dialog-no-data').length === 0) {
    $('#content').append(
      $('<div id="dialog-no-data" title="Dialog No Data"></div>')
    )
    $('#dialog-no-data').dialog({
      autoOpen: false,
      width: 200,
      resizable: false,
      // modal: true, // 如果同時呼叫dialog和modal會壞掉
      title: i18n('No_Data'),
      buttons: [
        {
          html: '<i class="fa fa-frown-o"></i>&nbsp; OK',
          class: 'btn btn-default',
          click: function () {
            $(this).dialog('close')
          },
        },
      ],
    })
  }

  if (servtechConfig.ST_UI_SHOW_SHOWHIDECOLBTN === false) {
    showHideColBtn = ' hidden-sm hidden-md hidden-lg'
  }

  if (configObj.naturalSortColumn) {
    configObj.columnDefs = [
      {
        type: 'natural-nohtml',
        targets: configObj.naturalSortColumn,
      },
    ]
  }
  let isAddCustomBtn = false
  let isInitailized = false
  var table = $tableElement.DataTable(
    _.extend(
      {
        sDom: `<'dt-toolbar'
        <'pull-right hidden-xs'
          <'${stkToolbarClass}'>
        >
        r
        <'pull-right hidden-xs${showHideColBtn}'C>
        <>
      >
      t
      <'dt-toolbar-footer'
        <'col-xs-12 col-sm-4 hidden-xs'l>
        <'col-xs-12 col-sm-4 hidden-xs table-info text-center'i>
        <'col-xs-12 col-sm-4'p>
      >`,
        oColVis: {
          buttonText: 'Show / hide columns',
          exclude: configObj.hideCols || [],
        },
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
        autoWidth: true,
        destroy: true,
        order: [[0, 'asc']],
        headerCallback: function (thead, data, start, end, display) {
          if (
            $tableElement.find('i.fa.fa-question-circle.fa-question-circle')
              .length === 0
          ) {
            $tableElement
              .find('th[data-original-title]')
              .append("<i class='fa fa-question-circle'></i>")
              .tooltip({
                container: 'body',
                html: 'true',
              })
          }

          // <thead> 中的每列補上頭的 checkbox 與尾的 action
          if (
            configObj.checkbox &&
            $tableElement.find('.stk-all-checkbox').length === 0
          ) {
            $tableElement
              .find('thead > tr:first-child')
              .prepend('<th style="width:2%;"></th>')
            $tableElement
              .find('thead > tr:last-child')
              .prepend(
                '<th><input type="checkbox" class="stk-all-checkbox" /></th>'
              )
          }
        },
        preDrawCallback: function () {
          if (!responsiveHelper) {
            responsiveHelper = new ResponsiveDatatablesHelper(
              $tableElement,
              breakpointDefinition
            )
          }
        },
        rowCallback: function (row, data) {
          try {
            responsiveHelper.createExpandIcon(row)
          } catch (e) {
            console.warn(e)
          }

          if (configObj.checkbox) {
            var $nRow = $(row)
            if ($nRow.find('td:first-child > input:checkbox').length === 0) {
              // 填入每列第一欄的 checkbox
              if (configObj.checkbox) {
                const $checkbox = $('<input type="checkbox" />').data(
                  'row-data',
                  data
                )
                $nRow.prepend($checkbox)
                $checkbox.wrap('<td></td>')
              }
            }
          }

          if (onRow) {
            onRow(row, data)
          }

          $(row).data('row-data', data)
        },
        drawCallback: function (settings) {
          responsiveHelper.respond()

          alignTableCell($tableElement, rightColumn, 'text-right')
          alignTableCell($tableElement, leftColumn, 'text-left')
          alignTableCell($tableElement, centerColumn, 'text-center')

          if (onDraw) {
            var api = this.api()
            onDraw(
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

          if (configObj.checkbox) {
            var $emptyTipRow = $tableElement.find('.dataTables_empty')
            if ($emptyTipRow.length > 0) {
              $emptyTipRow.attr('colspan', $emptyTipRow.attr('colspan') + 1)
            }
          }

          if (configObj.hideCols) {
            this.api().columns(configObj.hideCols).visible(false)
          }

          if (
            configObj.hideCols &&
            configObj.checkbox &&
            !$tableElement.find('.stk-all-checkbox').length
          ) {
            $tableElement
              .find('thead > tr:first-child')
              .prepend('<th style="width:2%;"></th>')
            $tableElement
              .find('thead > tr:last-child')
              .prepend(
                '<th><input type="checkbox" class="stk-all-checkbox" /></th>'
              )
          }

          // 在dt-toolbar長出按鈕
          if (!isAddCustomBtn) {
            // customBtn
            $tableElement.prev().prepend(
              (function () {
                var node = document.createElement('DIV')
                node.classList.value = 'col-xs-12 col-sm-10 col-md-9 col-lg-9'
                if (configObj.customBtns) {
                  _.each(configObj.customBtns, function (ele) {
                    if (ele instanceof HTMLElement) node.appendChild(ele)
                    else node.insertAdjacentHTML('beforeend', ele)
                  })
                }
                return node
              })()
            )

            // excel 下載
            if (excel) {
              const $excelDownloadBtn = $(
                `<a class="excel-btn-${currTableCount} btn btn-success pull-left"><span class="fa fa-file-excel-o fa-lg"></span> ${i18n(
                  'Excel'
                )}</a>`
              )
              $('.' + stkToolbarClass).append($excelDownloadBtn)
              if (excel.template) {
                servkit.downloadCustomizedExcel(
                  $excelDownloadBtn,
                  excel.template(tableHeader, this.api())
                )
              } else {
                servkit.downloadExcel($excelDownloadBtn, function () {
                  var showColumn = table.columns().visible()
                  return {
                    fileName:
                      excel.fileName + moment().format('YYYYMMDDHHmmss'),
                    format: _.filter(excel.format, function (num, key) {
                      return showColumn[key]
                    }),
                    header: excel.customHeaderFunc
                      ? excel.customHeaderFunc(tableHeader)
                      : _.filter(tableHeader, function (num, key) {
                          return showColumn[key]
                        }),
                    matrix: excel.customDataFunc
                      ? excel.customDataFunc(
                          table
                            .rows({
                              order: 'applied',
                              search: 'applied',
                              page: 'all',
                            })
                            .data()
                        )
                      : _.map(
                          table
                            .rows({
                              order: 'applied',
                              search: 'applied',
                              page: 'all',
                            })
                            .data(),
                          function (d) {
                            return _.filter(d, function (num, key) {
                              return showColumn[key]
                            })
                          }
                        ),
                  }
                })
              }
            }

            isAddCustomBtn = true
          }

          if (this.summaryInfo && this.summaryInfo.config.text) {
            this.summaryInfo.text(
              this.summaryInfo.config.text(
                this.api()
                  .rows({ search: 'applied', page: 'all' })
                  .data()
                  .toArray(),
                this.api()
              )
            )
          }

          if (!isInitailized) {
            if (configObj.onInit) {
              configObj.onInit(this.api())
            }
            this.summaryInfo = initSummaryInfo(
              configObj.summaryInfo,
              $tableElement.parent()[0]
            )
            isInitailized = true
          }
        },
        createdRow: function (row, data, dataIndex) {
          if (configObj.rowReorder) {
            $(row).attr('id', 'row-' + dataIndex) // tr一定要有ID才能排序
          }
        },
      },
      configObj
    )
  )

  if (configObj.rowReorder) {
    $tableElement
      .DataTable()
      .rowReordering(
        configObj.rowReorder.option && _.isObject(configObj.rowReorder.option)
          ? configObj.rowReorder.option
          : null
      )
  }
  $tableElement.data('table', table)

  if (configObj.checkbox) {
    // 換頁要先確認此頁的 All 是否有被 checked，然後把所有 disabled 的 element 都打開
    $tableElement.on('page.dt', function () {
      if (pageAllSelectCheckbox[table.page.info().page]) {
        $('.stk-all-checkbox').prop('checked', true)
      } else {
        $('.stk-all-checkbox').prop('checked', false)
      }
    })

    // checkbox 全選
    $tableElement.on('click', '.stk-all-checkbox', function (e) {
      const status = $('.stk-all-checkbox').is(':checked')
      pageAllSelectCheckbox[table.page.info().page] = e.target.checked
      $tableElement.find('tbody tr td:first-child').each(function () {
        if (!$(this.firstElementChild).is(':disabled')) {
          $(this.firstElementChild).prop('checked', status)
        }
      })
    })
  }

  if (configObj.hideCols) {
    table.on('resize', function () {
      table.columns(configObj.hideCols).visible(false)
      // <thead> 中的每列補上頭的 checkbox 與尾的 action
      if (
        configObj.checkbox &&
        $tableElement.find('.stk-all-checkbox').length === 0
      ) {
        $tableElement
          .find('thead > tr:first-child')
          .prepend('<th style="width:2%;"></th>')
        $tableElement
          .find('thead > tr:last-child')
          .prepend(
            '<th><input type="checkbox" class="stk-all-checkbox" /></th>'
          )
      }
    })
  }

  // 過濾欄位事件綁定
  $tableElement.find('thead th > input[type=text]').on('keyup', function () {
    if (configObj.checkbox) {
      table
        .column($(this).parent().index() - 1 + ':visible')
        .search(this.value)
        .draw()
    } else {
      table
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw()
    }
  })
  $tableElement.find('thead th > select').on('change', function () {
    // 處理溢出字元
    var regExSearch =
      this.value === ''
        ? ''
        : '^' +
          this.value.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
          '$'
    if (configObj.checkbox) {
      table
        .column($(this).parent().index() - 1 + ':visible')
        .search(regExSearch, true, false)
        .draw()
    } else {
      table
        .column($(this).parent().index() + ':visible')
        .search(regExSearch, true, false)
        .draw()
    }
  })

  return new ReportTable(
    table,
    selectFilter,
    $tableElement,
    $tableWidget,
    showNoData,
    configObj
  )
}

export { createReportTable }

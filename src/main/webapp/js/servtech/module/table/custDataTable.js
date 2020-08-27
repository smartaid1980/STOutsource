import { servtechConfig } from '../servtech.config'
import breakpointDefinition from './breakpointDefinition'

const showHideColBtn =
  servtechConfig.ST_UI_SHOW_SHOWHIDECOLBTN === false
    ? 'hidden-sm hidden-md hidden-lg'
    : ''
const getCurrTableCount = (() => {
  let tableCount = 0
  return () => tableCount++
})()

let responsiveHelper
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
function getExtendedOption(option, table) {
  let isAddCustomBtn = false
  let isInitailized = false
  const currTableCount = getCurrTableCount()
  const stkToolbarClass = `stk-toolbar-${currTableCount}`
  const {
    $tableElement,
    hideCols,
    onRow,
    onDraw,
    leftColumn,
    centerColumn,
    rightColumn,
    excel,
  } = option
  const tableHeader = _.map(
    $tableElement.find('thead tr:nth-of-type(2) *'),
    function (e) {
      return e.textContent.trim()
    }
  )
  const defaultOption = {
    sDom: `<'dt-toolbar'
        <'pull-right hidden-xs'
          <'${stkToolbarClass}'>
        >
        r
        <'pull-right hidden-xs ${showHideColBtn}'C>
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
      exclude: hideCols || [],
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
        option.checkbox &&
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

      if (option.checkbox) {
        var $nRow = $(row)
        if ($nRow.find('td:first-child > input:checkbox').length === 0) {
          // 填入每列第一欄的 checkbox
          if (option.checkbox) {
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

      if (option.checkbox) {
        var $emptyTipRow = $tableElement.find('.dataTables_empty')
        if ($emptyTipRow.length > 0) {
          $emptyTipRow.attr('colspan', $emptyTipRow.attr('colspan') + 1)
        }
      }

      if (option.hideCols) {
        this.api().columns(option.hideCols).visible(false)
      }

      if (
        option.hideCols &&
        option.checkbox &&
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
            if (option.customBtns) {
              _.each(option.customBtns, function (ele) {
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
                fileName: excel.fileName + moment().format('YYYYMMDDHHmmss'),
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
        if (option.onInit) {
          option.onInit(this.api())
        }
        this.summaryInfo = initSummaryInfo(
          option.summaryInfo,
          $tableElement.parent()[0]
        )
        isInitailized = true
      }
    },
    createdRow: function (row, data, dataIndex) {
      if (option.rowReorder) {
        $(row).attr('id', 'row-' + dataIndex) // tr一定要有ID才能排序
      }
    },
  }
}

class custDataTable {
  constructor(option) {
    this.defaultOption = getExtendedOption(option, this.table)
    this.$tableElement = option.$tableElement
    this.table = this.$tableElement.DataTable(
      Object.assign({}, this.defaultOption, option)
    )
  }
}

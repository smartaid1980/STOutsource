exports.CONSTANTS = {
  dev: true,
  ATTRITION_RATE: 1.03,
}
exports.initRfqCanceledModal = (callback) => {
  let $rfqCanceledModal = $('#canceled-alert-modal-widget')
  if (!$rfqCanceledModal.length) {
    $rfqCanceledModal = $(`<div class="modal fade close-modal" id="canceled-alert-modal-widget" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${i18n('Rfq_Has_Been_Canceled')}</h3>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="margin-top:0">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="border:none !important">
            <h5>${i18n('Sorry')}，${i18n(
      'This_Inquiry_Has_Been_Canceled'
    )}，${i18n('Can_No_Longer_Carry_Out_Any_Operation')}</h5>
          </div>
          <div class="modal-footer" style="margin-top:.5vw;text-align:right;">
            <button type="button" class="btn btn-primary btnClass" data-dismiss="modal" id="confirm-canceled">${i18n(
              'Confirm'
            )}</button>
          </div>
        </div>
      </div>
    </div>`)
    $('#widget-grid>.row').append($rfqCanceledModal)
    $rfqCanceledModal.on('hide.bs.modal', function () {
      if (callback) {
        callback()
      }
    })
  }
  return $rfqCanceledModal
}
exports.checkIsRfqCanceled = ({
  form_id,
  uncancelCallback,
  canceledCallback,
}) => {
  servkit.ajax(
    {
      url: 'api/stdcrud',
      type: 'GET',
      data: {
        tableModel: 'com.servtech.servcloud.app.model.strongLED.DemandList',
        whereClause: `form_id='${form_id}'`,
      },
    },
    {
      success(data) {
        const isCanceled = data[0].status === 96
        if (isCanceled) {
          if (canceledCallback) {
            canceledCallback()
          }
        } else {
          if (uncancelCallback) {
            uncancelCallback()
          }
        }
      },
    }
  )
}
exports.initAuth = (done, status) => {
  const getGroupMap = new Promise((res) => {
    const timestamp = new Date().getTime()
    $.get('./app/StrongLED/data/sysGroupIdMap.json?' + timestamp, (data) => {
      res(data)
    })
  })
  const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
  const userGroup = loginInfo.user_group
  getGroupMap.then((data) => {
    const groupAuth = {}
    _.each(data, (id, name) => {
      groupAuth[name] = userGroup.includes(id)
    })
    const canSeeQuoteAndStatus = groupAuth.assistant
    const canReturnRfq =
      groupAuth.assistant ||
      groupAuth.rd ||
      groupAuth.rdLeader ||
      groupAuth.procurement ||
      groupAuth.financial ||
      groupAuth.presale
    // 詢價單
    const canSeeRfqDetail = true
    const canEditSeriesAndModel =
      (groupAuth.account || groupAuth.accountAst) && status === '0'
    const canEditRfq =
      ((groupAuth.account || groupAuth.accountAst) &&
        (status === '97' || status === '0')) ||
      (groupAuth.presale && status === '1')
    const canSaveIncompleteRfq = canEditRfq && status === '0'
    // 物料資訊
    const canSeeRfqMaterial =
      groupAuth.rd ||
      groupAuth.rdLeader ||
      groupAuth.procurement ||
      (groupAuth.assistant && Number(status) > 11)
    const canSeeMaterialTotalCost = groupAuth.procurement || groupAuth.assistant
    const canSeeMaterialModuleInfo = canSeeRfqMaterial
    const canSeeStdProductInfo = canSeeRfqMaterial
    const canEditRfqMaterialQty =
      (groupAuth.rd && status === '6') ||
      (groupAuth.rdLeader && status === '11')
    const canEditRfqMaterialPrice =
      (groupAuth.procurement && status === '16') ||
      (groupAuth.procurementLeader && status === '21')
    const canCreateRfqMaterial = canEditRfqMaterialQty
    const canDeleteRfqMaterial = canEditRfqMaterialQty
    const canUpdateRfqMaterial =
      canEditRfqMaterialQty || canEditRfqMaterialPrice
    // 標品資訊
    const canSeeSimilarProductTable = groupAuth.assistant
    // 利潤和報價
    const canSeePriceConfirmWidget = groupAuth.assistant || groupAuth.financial
    const canEditQuote = groupAuth.assistant
    const canSeeQuoteRecords = groupAuth.assistant
    const canSeeQuote = groupAuth.assistant
    // 項目管理
    const canSeeAllProject = groupAuth.accountAst
    const canAssignProjectOwner = groupAuth.accountAst
    done(
      _.extend(groupAuth, {
        canSeeQuoteAndStatus,
        canReturnRfq,
        canSeeRfqDetail,
        canEditRfq,
        canSaveIncompleteRfq,
        canSeeRfqMaterial,
        canSeeMaterialTotalCost,
        canSeeMaterialModuleInfo,
        canSeeStdProductInfo,
        canEditRfqMaterialQty,
        canEditRfqMaterialPrice,
        canCreateRfqMaterial,
        canDeleteRfqMaterial,
        canUpdateRfqMaterial,
        canSeeSimilarProductTable,
        canSeePriceConfirmWidget,
        canEditQuote,
        canSeeQuoteRecords,
        canSeeQuote,
        canSeeAllProject,
        canAssignProjectOwner,
        canEditSeriesAndModel,
      })
    )
  })
}
exports.fillTableFilter = ($table, columns) => {
  $table.find('thead>tr:nth-child(1)').append(
    columns.reduce((a, map) => {
      const { filterType } = map
      if (filterType === 'select') {
        return (
          a + `<th class="hasinput"><select class="form-control"></select></th>`
        )
      } else if (filterType === 'input') {
        return (
          a +
          `<th class="hasinput"><input type="text" class="form-control" /></th>`
        )
      } else {
        return a + `<th></th>`
      }
    }, '')
  )
}
exports.fillTableTitle = ($table, columns) => {
  $table.find('thead>tr:nth-child(2)').append(
    columns.reduce((a, map) => {
      const { title } = map
      return a + `<th>${title}</th>`
    }, '')
  )
}
exports.fillFilterOptions = (tableData, reportTable) => {
  const columnSettings = reportTable.table.settings()[0].aoColumns
  const isObject = ((tableData) => (columnId) =>
    tableData.length ? _.isObject(tableData[0][columnId]) : false)(tableData)
  let columnId
  let columnData
  _.each(reportTable.selectFilter, (select, i) => {
    // i為selectFilter在tr中的順位(在被hideCols影響之前)
    columnId = columnSettings[i].sName
    columnData = _.chain(tableData)
      .pluck(columnId)
      .uniq((value) => (isObject(columnId) ? value.filter : value))
      .sortBy(isObject(columnId) ? 'filter' : undefined)
      .value()
    $(select).html(
      `<option value="">${i18n('Filter')}</option>` +
        columnData.reduce(
          (a, data) =>
            a +
            `<option value="${isObject(columnId) ? data.filter : data}">${
              isObject(columnId) ? data.filterDisplay || data.display : data
            }</option>`,
          ''
        )
    )
  })
}
exports.initMomentJSLang = (() => {
  let lang
  return () => {
    const currentLang = servkit.getCookie('lang')
    if (lang !== currentLang) {
      lang = currentLang
      switch (lang) {
        case 'zh':
          moment.locale('zh-cn')
          break
        default:
          moment.locale(lang)
          break
      }
    }
  }
})()
exports.initDataTable = (() => {
  let isAlreadyInit = false
  return () => {
    if (!isAlreadyInit) {
      $.extend(true, $.fn.dataTable.defaults, {
        language: {
          processing: '处理中...',
          lengthMenu: '显示 _MENU_ 项结果',
          zeroRecords: '没有匹配结果',
          info: '显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项',
          infoEmpty: '显示第 0 至 0 项结果，共 0 项',
          infoFiltered: '(由 _MAX_ 项结果过滤)',
          infoPostFix: '',
          search: '搜索:',
          url: '',
          emptyTable: '表中数据为空',
          loadingRecords: '载入中...',
          infoThousands: ',',
          paginate: {
            first: '首页',
            previous: '上页',
            next: '下页',
            last: '末页',
          },
          aria: {
            sortAscending: ': 以升序排列此列',
            sortDescending: ': 以降序排列此列',
          },
        },
      })
      isAlreadyInit = true
    }
  }
})()
exports.disableFeature = (disabled, $table) => {
  // sort
  $table.find('thead > tr:first-child .form-control').attr('disabled', disabled)
  // checkbox
  $table.find(':checkbox').attr('disabled', disabled)
  // footer
  $table
    .parent()
    .find(".dt-toolbar input[type='search'], .dt-toolbar-footer select")
    .attr('disabled', disabled)
  // btns, except save & cancel
  $table
    .parent()
    .parent()
    .find('.btn:not(.cancel-material, .update-material)')
    .each((i, el) => {
      let $el = $(el)
      if (disabled) {
        $el.data('disabled', $el.prop('disabled'))
        $el.attr('disabled', true)
      } else {
        $el.attr('disabled', $el.data('disabled'))
      }
    })
  // pagination
  $table
    .parent()
    .find('.dt-toolbar-footer > div:last-child')
    .css({
      visibility: disabled ? 'hidden' : 'visible',
    })
}
exports.getColumnIndex = (name, columns) =>
  columns.findIndex((map) => map.name === name)

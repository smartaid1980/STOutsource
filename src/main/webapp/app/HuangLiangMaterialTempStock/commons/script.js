exports.matStockGroup = {
  // 廠務
  fs: 'material_stock_factory_service',
  // 生管
  pm: 'material_stock_production_management',
  // 品管
  qc: 'material_stock_quality_control',
  // 品管主管
  qcm: 'material_stock_quality_control_manager',
  // 高階主管
  tm: 'top_manager',
  // 系統管理(MIS)
  mis: 'sys_manager_group',
}
exports.initPONumAutoComplete = function ($input) {
  servkit.ajax(
    {
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'a_huangliang_po_file',
        columns: ['po_no'],
      }),
    },
    {
      success: function (data) {
        $input.autocomplete({
          source: _.chain(data).pluck('po_no').uniq().value().sort(),
        })
      },
      fail: function (data) {
        console.log(data)
      },
    }
  )
}
exports.initMstockNameSelect = function ($select) {
  let mstock_name = ['', 'GOLF', '五金']
  servkit.initSelectWithList(mstock_name, $select, false)
}
exports.savePDF = function (context) {
  // (function ($) {
  //   $.fn.hasScrollBar = function () {
  //     return this.get(0).scrollHeight > this.height();
  //   }
  // })(jQuery);
  let selectedDatas = context.reportTable.getSelectedRow(),
    template = $('.return-record-template'),
    $recordDate = template.find('.record-date'),
    $recordId = template.find('.record-id'),
    $poId = template.find('.po-id'),
    $matId = template.find('.mat-id'),
    $matName = template.find('.mat-name'),
    $returnQty = template.find('.return-qty'),
    JsPDF = jsPDF, // just to avoid eslint new-cap error, constructor should start with an uppercase letter
    pdf = new JsPDF('p', 'cm', 'a4'),
    templateX = 0.5,
    templateW = 20,
    templateH = 13 // A4: H-29.7cm,W-21cm

  if (!selectedDatas.length) return

  selectedDatas = selectedDatas.map((ar) => _.object(context.dataKeys, ar))
  if (context.$progressBar) context.$progressBar.width('1%')
  context.$modal.modal('show')

  if ($('body').height() > $(window).height())
    context.$modal.css('overflow', 'scroll')
  else context.$modal.css('overflow', 'auto')

  function loop(i, resolve) {
    let data = selectedDatas[i],
      templateY = i % 2 === 0 ? 0.5 : 16.2,
      recordId = moment().format('YYMMDDHHmmssSSS')
    // 填值
    $recordDate.html(moment().format('YYYY/MM/DD'))
    $recordId.html(recordId)
    $poId.html(data.po_no)
    $matId.html(data.mat_code)
    $matName.html(data.mat_name + '<br>' + data.iqc_ng_reason)
    $returnQty.html(data.shelf_qty)

    html2canvas(template, {
      // async: false,
      // backgroudColor: '#ffffff',
      onrendered: function (canvas) {
        let imgObj = new Image()
        // console.log(canvas.height, canvas.width)
        imgObj.src = canvas.toDataURL('img/png')
        imgObj.onload = function () {
          if (i % 2 === 0 && i > 0) pdf.addPage()
          pdf.addImage(
            imgObj,
            'PNG',
            templateX,
            templateY,
            templateW,
            templateH
          )
          if (context.$progressBar) {
            let percentage =
              (((i + 1) / selectedDatas.length) * 100).toFixed(0) + '%'
            context.$progressBar.width(percentage)
          }
          if (i + 1 < selectedDatas.length) loop(i + 1, resolve)
          else {
            pdf.save(
              'ReturnRecord' + moment().format('YYYYMMDDHHmmss') + '.pdf'
            )
            setTimeout(function () {
              context.$modal.modal('hide')
              resolve()
            }, 500)
          }
        }
      },
    })
  }
  return new Promise((resolve) => {
    loop(0, resolve)
  })
}

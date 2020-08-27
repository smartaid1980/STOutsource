export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var _CURRENT_PRODUCT_ID = ''
      var _CURRENT_TABLE_HEADER = []
      var _CURRENT_TABLE_MATRIX = []

      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      var preDate = moment(new Date()).add('days', -15) // 前十五天
      context.$startDate
        .datepicker(datepickerConfig)
        .val(preDate.format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))

      initProduct()

      // 提交後
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var productId = context.$productSelect.val()
        var startDate = context.$startDate.val()
        var endDate = context.$endDate.val()
        var condition = context.$condition.val()
        queryProductTracking({
          productId: productId,
          startDate: startDate,
          endDate: endDate,
          condition: condition,
        })
        // queryProductTracking({"startDate":"2016/10/03", "endDate": "2016/10/10", "productId": "9109P01810C", "condition": condition});
        // queryProductTracking({"startDate":"2016/10/03", "endDate": "2016/12/10", "productId": "9109P01810C", "condition": condition});
        // queryProductTracking({"productId": "5108P01470A", "startDate": "2016/07/04", "endDate": "2016/07/20", "condition": condition});
      })

      // 按下download excel
      servkit.downloadExcel(context.$excelDownload, function () {
        var excelFileName = 'product_tracking_' + _CURRENT_PRODUCT_ID
        var excelFormat = []
        var excelHeader = _CURRENT_TABLE_HEADER
        var excelMatrix = _CURRENT_TABLE_MATRIX
        console.log('excelMatrix: ', excelMatrix)
        // 動態長header
        _.each(excelHeader, function (ele, index) {
          excelFormat.push('text')
        })
        return {
          fileName: excelFileName + moment().format('YYYYMMDDHHmmss'),
          format: excelFormat, // ['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', '0', 'text', 'text'],
          header: excelHeader,
          matrix: excelMatrix,
        }
      })

      function initProduct() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_aerowin_product',
              columns: ['product_id', 'product_name'],
            }),
          },
          {
            success: function (data) {
              console.log('***** ', data)
              var buildSelect = ''
              _.each(data, function (ele) {
                var productId = ele['product_id']
                var productName = ele['product_name']
                buildSelect =
                  buildSelect +
                  '<option value="' +
                  productId +
                  '">' +
                  productName +
                  '</option>'
              })
              context.$productSelect.html(buildSelect)
              context.$productSelect.select2()
            },
            fail: function (data) {
              console.warn('initProduct fail: ', data)
            },
          }
        )
      }

      function queryProductTracking(params) {
        console.log('params: ', params)
        servkit.ajax(
          {
            url: 'api/aerowin/wip/productTrackingReportByRange',
            type: 'GET',
            contentType: 'application/json',
            data: params,
          },
          {
            success: function (data) {
              console.log(data)
              // 因為header是動態的，所以要先刪除table
              $('#product-tracking-table').remove()
              context.$tableResponsive.html(
                '<table id="product-tracking-table" class="table table-striped table-bordered table-hover"></table>'
              )
              buildTable($('#product-tracking-table'), data)
            },
            fail: function (data) {
              console.warn('queryProductTracking fail: ', data)
            },
          }
        )
      }

      // 長table
      function buildTable($table, data) {
        //
        var datatablesConfig = {
          selector: $table, // table id selector
          headColumns: [],
          options: {
            // datatables原生設定
            /* 
              f: filter (datatable全欄位搜尋)
              t: table (datatable 本體)
              //T: toolbar (下載的bar，要設定oTableTools) ***不建議使用，因為存在某些bug
              l: length changeing (每個pagging多少資料 -> 10, 25, 50, 100)
              i: info (datatable 資訊 -> Showing 0 to 0 of 0 entries)
              p: pagin (分頁 -> Previous 1 Next)
              <"#id">: 自訂id，我們可以透過自訂id在header上長出button
              <'custom-download'>: 自製的CSV和Excel下載bar, 使用前需要設定 customDownload 參數
            */
            // 在此設定datatable和bar的樣式
            sDom:
              '' + // datatable上面的bar
              't' + // datatable
              '', // datatable下面的bar
            columns: [],
            /* "columnDefs":[{//在此對col的資料做處理，現在要在資料欄內放button
              "targets": -1,//倒數第二欄
              "data": null,
              //編輯按鈕html (綁modal)
              "defaultContent": '<button class="btn btn-xs btn-primary edit-btn" title="Edit" data-toggle="modal" data-target="' + $crudTableModal.selector + '">設定</button>'
            }], */
            autoWidth: false, // 禁止自動計算寬度
            ordering: false, // 使否允許開起排序
            paging: false, // 是否開起分頁
            lengthChange: false, // 是否開啟 length change功能(每個pagging多少資料 -> 10, 25, 50, 100)

            scrollY: '500px',
            sScrollX: '100%',
            sScrollXInner: '100%',
            bScrollCollapse: true,
            fixedColumns: {
              leftColumns: 1,
            },
          },
        }

        _CURRENT_PRODUCT_ID = ''
        _CURRENT_PRODUCT_ID = data.productId

        context.$productInfo.html(
          '產品代碼: ' + data.productId + ' / 產品名稱: ' + data.productName
        )

        _CURRENT_TABLE_HEADER = []

        var headerConfig = []
        var columnConfig = []
        _CURRENT_TABLE_HEADER.push('Date')
        headerConfig.push({
          key: 'date',
          name:
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
        })
        columnConfig.push({
          className: 'text-left',
          width: '',
        })
        _.each(data.header, function (ele, index) {
          _CURRENT_TABLE_HEADER.push(ele)
          headerConfig.push({
            key: ele,
            name: ele,
            tooltip: data.opMap[ele],
          })
          columnConfig.push({
            className: 'text-left',
            width: '',
          })
        })
        _CURRENT_TABLE_HEADER.push('Total')
        headerConfig.push({
          key: 'total',
          name: 'Total',
        })
        columnConfig.push({
          className: 'text-left',
          width: '',
        })

        var popoverHtmlStart =
          '<span data-html="true" data-rel="popover-hover" data-placement="top" '
        var popoverHtmlEnd = '</span>'
        var title = ' data-original-title="詳細資訊" '
        var contentStart = ' data-content="'
        var contentEnd = '"> '
        var tableStart =
          "<table class='table table-striped table-hover'><tr><th>工單編號</th><th>產出量</th><th>狀態</th></tr>"
        var tableEnd = '</table>'

        // 初始化table資料
        _CURRENT_TABLE_MATRIX = []
        var matrix = []
        for (var rowCount = 0; rowCount < data.rowSize; rowCount++) {
          var record = []
          var excelRecord = []
          for (var colCount = 0; colCount < data.colSize + 2; colCount++) {
            // 要+2因為有多date和total
            record.push('')
            excelRecord.push('')
          }
          matrix.push(record)
          _CURRENT_TABLE_MATRIX.push(excelRecord)
        }
        // 第一欄日期
        _.each(data.date, function (ele, index) {
          matrix[index][0] = ele
          _CURRENT_TABLE_MATRIX[index][0] = ele
        })
        // 哪欄有值就填
        _.each(data.productTrackingDatas, function (ele) {
          var rowIndex = ele['rowIndex']
          var colIndex = ele['colIndex']
          var total = ele['total']
          var sampleWips = ele['sampleWips']
          var html = popoverHtmlStart + title + contentStart + tableStart
          _.each(sampleWips, function (sampleWip) {
            var workId = sampleWip['workId']
            var quantity = sampleWip['quantity']
            var status = context._WIP_STATUS_MAP[sampleWip['status']]
            // console.log(workId, quantity, status);
            html =
              html +
              '<tr><td>' +
              workId +
              '</td><td>' +
              quantity +
              '</td><td>' +
              status +
              '</td></tr>'
          })
          html = html + tableEnd + contentEnd + total + popoverHtmlEnd
          matrix[rowIndex][colIndex] = html
          _CURRENT_TABLE_MATRIX[rowIndex][colIndex] = total.toString()
        })
        // total
        _.each(data.totalSampleWipMapByDate, function (ele) {
          var rowIndex = ele['rowIndex']
          var total = ele['total']
          var sampleWips = ele['sampleWips']
          var html = popoverHtmlStart + title + contentStart + tableStart
          _.each(sampleWips, function (sampleWip) {
            var workId = sampleWip['workId']
            var quantity = sampleWip['quantity']
            var status = context._WIP_STATUS_MAP[sampleWip['status']]
            // console.log(workId, quantity, status);
            html =
              html +
              '<tr><td>' +
              workId +
              '</td><td>' +
              quantity +
              '</td><td>' +
              status +
              '</td></tr>'
          })
          html = html + tableEnd + contentEnd + total + popoverHtmlEnd
          matrix[rowIndex][data.colSize + 1] = html
          _CURRENT_TABLE_MATRIX[rowIndex][data.colSize + 1] = total.toString()
        })

        datatablesConfig['headColumns'] = headerConfig
        datatablesConfig['options']['columns'] = columnConfig
        datatablesConfig['options']['data'] = matrix // .popover({"trigger":"hover"})
        context.commons.custDatatables(datatablesConfig)
      }
    },
    util: {
      $productSelect: $('#product-select'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $condition: $('#condition'),
      $submitBtn: $('#submit-btn'),
      $productInfo: $('#product-info'),
      $tableResponsive: $('#table-responsive'),
      $excelDownload: $('#excel-download'),
      _WIP_STATUS_MAP: {
        '1': '生產中',
        '2': '完成',
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/dataTables.fixedColumns.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/jquery-validate/jquery.validate.min.js',
        '/js/plugin/masked-input/jquery.maskedinput.min.js',
      ],
    ],
  })
}

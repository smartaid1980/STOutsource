export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (context.preCon.processInfo) {
        _.each(context.preCon.processInfo, function (info) {
          context.processSelHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            info.process_code +
            '">' +
            info.process_name +
            '</option>'
          context.processMap[info.process_code] = info.process_name
        })
      }
      if (context.preCon.productInfo) {
        _.each(context.preCon.productInfo, function (info) {
          context.productSelHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            info.product_id +
            '">' +
            info.product_name +
            '</option>'
          context.productMap[info.product_id] = info.product_name
        })
      }
      servkit.crudtable({
        tableSelector: '#product_table',
        tableModel: 'com.servtech.servcloud.app.model.enhancement.ProductOp',
        rightColumn: [3],
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            $('[name="process_code"]')[0].innerHTML = context.processSelHtml
            $('[name="product_id"]')[0].innerHTML = context.productSelHtml
            pageSetUp()
          },
        },
        read: {
          url: 'api/stdcrud',
          1: function (data, rowData) {
            return context.processMap[data]
          },
          3: function (data, rowData) {
            return context.productMap[data]
          },
        },
        update: {
          url: 'api/stdcrud',
          start: {
            1: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('select[name="product_id"]').eq(0)
              jEle.html(context.productSelHtml)
              jEle.attr('disabled', true)
              _.each(jEle.find('option'), function (ele) {
                if (ele.value === $(oldTd).text()) {
                  $(ele).prop('selected', true)
                }
              })
            },
            2: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('input[name="op"]').eq(0)
              jEle.val($(oldTd).text())
              jEle.attr('disabled', true)
            },
            3: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('select[name="process_code"]').eq(0)
              jEle.html(context.processSelHtml)
              _.each(jEle.find('option'), function (ele) {
                if (ele.value === $(oldTd).text()) {
                  $(ele).prop('selected', true)
                }
              })
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
      })
    },
    util: {
      processSelHtml: '',
      processMap: {},
      productSelHtml: '',
      productMap: {},
    },
    preCondition: {
      processInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_enhancement_process',
              columns: ['process_code', 'process_name'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      productInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_enhancement_product',
              columns: ['product_id', 'product_name'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}

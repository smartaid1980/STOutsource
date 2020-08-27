import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initCustomerTable()
      // pageSetUp();
    },
    util: {
      initCustomerTable: function () {
        function createAndUpdateSend(tdEles) {
          return {
            product_id: (function () {
              var product = $(tdEles[1]).find(':selected').val()
              return product
            })(),
          }
        }

        var createAndUpdateEnd = {
          2: function (td) {
            var product = $(td).find(':selected').val()
            return product
          },
        }

        var productData
        var productHtml
        $.ajax({
          url: servkit.rootPath + '/api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_aftersalesservice_product',
            columns: ['product_id'],
          }),
        }).done(function (data) {
          if (data.type === 0) {
            var reault = []
            _.map(data.data, function (data) {
              reault.push(data.product_id)
            })
            productData = reault
          }
        })

        servkit
          .politeCheck()
          .until(function () {
            return productData
          })
          .thenDo(function () {
            var productSelectHtml = ''
            _.each(productData, function (data) {
              productSelectHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                data +
                '">' +
                data +
                '</option>'
            })
            productHtml = productSelectHtml
          })
          .tryDuration(0)
          .start()

        servkit
          .politeCheck()
          .until(function () {
            return productHtml
          })
          .thenDo(function () {
            return productHtml
          })
          .tryDuration(0)
          .start()

        servkit.crudtable({
          tableSelector: '#stk-machine-type-table',
          create: {
            url: 'api/aftersalesservice/machinetype/create',
            start: function (tdEles) {
              $('[name=product_id]')[0].innerHTML = productHtml
              $('select[name=product_id] option:eq(0)').prop('selected', true)
              pageSetUp() // for select2
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/aftersalesservice/machinetype/read',
          },
          update: {
            url: 'api/aftersalesservice/machinetype/update',
            start: {
              2: function (oldTd, newTd) {
                var oldProduct = $(oldTd).eq(0).text()
                $('[name=product_id]')[0].innerHTML = productHtml
                $('[name=product_id] option[value="' + oldProduct + '"]').prop(
                  'selected',
                  true
                )
                pageSetUp()
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/aftersalesservice/machinetype/delete',
          },
          excel: {
            url: '/api/aftersalesservice/machinetype/excel',
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }

              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `${i18n('Stk_Pk')}`
                }
              }
            },
            2: function (td) {
              if (td.querySelector('select').value === '') {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        })
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}

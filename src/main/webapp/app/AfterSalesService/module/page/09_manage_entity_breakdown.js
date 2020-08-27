import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initEntityTable()
      // pageSetUp();
    },
    util: {
      initEntityTable: function () {
        function createAndUpdateSend(tdEles) {
          return {
            entity_id: (function () {
              var entity = $(tdEles[1]).find(':selected').val()
              return entity
            })(),
          }
        }

        var createAndUpdateEnd = {
          2: function (td) {
            var entity = $(td).find(':selected').val()
            return entity
          },
        }

        var entityData
        var entityHtml
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_aftersalesservice_entity',
              columns: ['entity_id'],
            }),
          },
          {
            success: function (data) {
              var reault = []
              _.map(data, function (data) {
                reault.push(data.entity_id)
              })
              entityData = reault
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return entityData
          })
          .thenDo(function () {
            var entitySelectHtml = ''
            _.each(entityData, function (data) {
              entitySelectHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                data +
                '" selected>' +
                data +
                '</option>'
            })
            entityHtml = entitySelectHtml
          })
          .tryDuration(0)
          .start()

        servkit
          .politeCheck()
          .until(function () {
            return entityHtml
          })
          .thenDo(function () {
            return entityHtml
          })
          .tryDuration(0)
          .start()

        servkit.crudtable({
          tableSelector: '#stk-entity-breakdown-table',
          create: {
            url: 'api/aftersalesservice/entitybreakdown/create',
            start: function (tdEles) {
              $('[name=entity_id]')[0].innerHTML = entityHtml
              $('select[name=entity_id] option:eq(0)').prop('selected', true)
              pageSetUp() // for select2
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/aftersalesservice/entitybreakdown/read',
          },
          update: {
            url: 'api/aftersalesservice/entitybreakdown/update',
            start: {
              2: function (oldTd, newTd) {
                var oldEntity = $(oldTd).eq(0).text()
                $('[name=entity_id]')[0].innerHTML = entityHtml
                $('[name=entity_id] option[value="' + oldEntity + '"]').prop(
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
            url: 'api/aftersalesservice/entitybreakdown/delete',
          },
          excel: {
            url: '/api/aftersalesservice/entitybreakdown/excel',
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

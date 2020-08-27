import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (context.preCon.machineInfo) {
        _.each(context.preCon.machineInfo, function (obj) {
          context.machineIdSelectHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            obj.device_id +
            '">' +
            obj.device_id +
            '</option>'
          var info = {}
          info['machine_id'] = obj.device_id
          info['machine_name'] = servkit.getMachineName(obj.device_id)
          info['cnc_id'] = obj.cnc_id
          context.machineInfo[obj.device_id] = info
        })
      }

      $('#machine_table').on('change', '[name="machine_id"]', function (evt) {
        $('[name="machine_name"]').val(
          context.machineInfo[$(this).val()].machine_name
        )
        $('[name="cnc_brand"]').val(context.machineInfo[$(this).val()].cnc_id)
      })

      servkit.crudtable({
        tableSelector: '#machine_table',
        tableModel: 'com.servtech.servcloud.app.model.enhancement.Machine',
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            $('[name="machine_id"]')[0].innerHTML = context.machineIdSelectHtml
            $('[name="machine_id"]').trigger('change')
            pageSetUp()
          },
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
          start: {
            1: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('select[name="machine_id"]').eq(0)
              jEle.html(context.machineIdSelectHtml)
              jEle.attr('disabled', true)
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
        validate: {
          1: function (td, table) {
            var input = td.querySelector('select')
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
        },
      })
    },
    util: {
      machineInfo: {},
      machineIdSelectHtml: '',
    },
    preCondition: {
      machineInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_cnc_brand',
              columns: ['device_id', 'cnc_id'],
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

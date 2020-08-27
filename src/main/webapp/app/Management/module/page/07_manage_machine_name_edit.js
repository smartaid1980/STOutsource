import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var deviceLightIdNameMap = {}
      var deviceLightNameIdMap = {}

      initdeviceLightMapAndCrudtable()

      function initdeviceLightMapAndCrudtable() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: ['light_id', 'light_name'],
            }),
          },
          {
            success: function (data) {
              _.each(data, function (ele) {
                deviceLightIdNameMap[ele.light_id] = ele.light_name
                deviceLightNameIdMap[ele.light_name] = ele.light_id
              })
              // console.log(deviceLightIdNameMap);
              initCrudtable()
            },
          }
        )
      }

      function initCrudtable() {
        var crudtableConfig = {
          tableSelector: '#stk-machine-name-table',
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/machine/read',
          },
          update: {
            url: 'api/machine/update',
          },
          delete: {
            unavailable: true,
          },
          validate: {
            2: function (td) {
              if (td.querySelector('input').value === '') {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        }
        if (
          servtechConfig.ST_CUSTOMER &&
          servtechConfig.ST_CUSTOMER === 'shayangye'
        ) {
          crudtableConfig['customBtns'] = [
            '<button class="btn margin-right-10 btn-success" id="shayangye-sync-btn"><span class="fa fa fa-spinner fa-lg"></span></button>',
          ]
        }
        servkit.crudtable(crudtableConfig)

        $('#wid-id-0').on('click', '#shayangye-sync-btn', function (evt) {
          var loadBtn = servkit.loadingButton(this)
          var smallParams = {
            selectColor: 'yellow',
            title: '同步中 請稍後',
            icon: 'fa fa-check',
            timeout: 2000,
          }
          context.commons.smallBox(smallParams)
          try {
            loadBtn.doing()
            servkit.ajax(
              {
                url: 'api/shayangye/machine/sync',
                type: 'GET',
              },
              {
                success: function (data) {
                  smallParams = {
                    selectColor: 'green',
                    title: '同步完成',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  }
                  context.commons.smallBox(smallParams)
                  console.log(data)
                },
                fail: function (data) {
                  smallParams = {
                    selectColor: 'green',
                    title: '同步失敗',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  }
                  context.commons.smallBox(smallParams)
                  console.warn(data)
                },
              }
            )
          } catch (e) {
            console.warn(e)
          } finally {
            loadBtn.done()
          }
        })
      }
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

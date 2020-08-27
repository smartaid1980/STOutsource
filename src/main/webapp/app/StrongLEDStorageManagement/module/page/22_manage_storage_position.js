import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      function getGridAndCellIndex($tr) {
        $tr.on('change', '[name=store_id]', function (evt) {
          var grid = {}
          var cell = {}
          _.times(
            Number(context.preCon.getStoreData[this.value].gridCount),
            (num) => {
              grid[num] = String(num + 1)
            }
          )
          _.times(
            Number(
              context.preCon.getStoreTypeData[
                context.preCon.getStoreData[this.value].type
              ]
            ),
            (num) => {
              cell[num] = String(num + 1)
            }
          )
          servkit.initSelectWithList(grid, $tr.find('[name=store_grid_index]'))
          servkit.initSelectWithList(cell, $tr.find('[name=store_cell_index]'))
        })
        $tr.find('[name=store_id]').trigger('change')
      }
      var table = servkit.crudtable({
        tableSelector: '#store-position-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.StorePosition',
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}" style="margin-right:10px"><span class="fa fa-qrcode fa-lg"></span></button>`,
        ],
        naturalSortColumn: [0],
        create: {
          unavailable: true,
          // url: 'api/storage/storeposition',
          // start: function (newTr) {
          //   getGridAndCellIndex($(newTr))
          // },
          // end: {
          //   2: function (td) {
          //     return context.preCon.getStoreData[$(td).find('select').val()].name
          //   },
          //   3: function (td) {
          //     return String($(td).find('select').val() + 1)
          //   },
          //   4: function (td) {
          //     return String($(td).find('select').val() + 1)
          //   }
          // }
        },
        read: {
          url: 'api/stdcrud',
          end: {
            2: function (data) {
              return context.preCon.getStoreData[String(data)].name
            },
            3: function (data) {
              return String(data + 1)
            },
            4: function (data) {
              return String(data + 1)
            },
          },
          finalDo: function () {
            $('#store-position-table-widget .stk-delete-btn').addClass('hide')
            servkit.downloadFile(
              '.stk-qrcode-btn',
              '/api/storage/storeposition/qrcode',
              function () {
                var storePositionData = []
                _.each(table.getSelectedRow(), function (tr) {
                  storePositionData.push(
                    $(tr).attr('stk-db-id').replace(/"/g, '')
                  )
                })
                return {
                  'position_id[]': storePositionData,
                  'org_ids': [],
                  'paths': [],
                  'size': 'S',
                  'showPath': false,
                }
              },
              'GET'
            )
          },
        },
        update: {
          url: 'api/stdcrud',
          start: {
            1: function (oldTd, newTd, oldTr, newTr) {
              getGridAndCellIndex($(newTr))
              $(newTd).find('input').val(oldTd.innerText)
            },
          },
          end: {
            2: function (td) {
              return context.preCon.getStoreData[$(td).find('select').val()]
                .name
            },
            3: function (td) {
              return String($(td).find('select').val() + 1)
            },
            4: function (td) {
              return String($(td).find('select').val() + 1)
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          1: function (td) {
            let input = td.querySelector('input')
            if (input.value.length > 255) {
              return `${i18n('Out_Of_Len')}`.replace('{size}', 255)
            }
          },
          5: function (td) {
            let textarea = td.querySelector('textarea')
            if (textarea.value.length > 1024) {
              return `${i18n('Out_Of_Len')}`.replace('{size}', 1024)
            }
          },
        },
      })
    },
    util: {},
    preCondition: {
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: [
                'store_id',
                'store_name',
                'store_grid_count',
                'store_type_id',
              ],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = {
                  name: elem.store_name,
                  gridCount: elem.store_grid_count,
                  type: elem.store_type_id,
                }
              })
              done(storeData)
            },
          }
        )
      },
      getStoreTypeData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_type',
              columns: ['store_type_id', 'store_type_cell'],
            }),
          },
          {
            success: function (data) {
              var storeTypeData = {}
              _.each(data, function (elem) {
                storeTypeData[elem.store_type_id] = elem.store_type_cell
              })
              done(storeTypeData)
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
        '/js/plugin/datatables/sorting.natural.js',
      ],
    ],
  })
}

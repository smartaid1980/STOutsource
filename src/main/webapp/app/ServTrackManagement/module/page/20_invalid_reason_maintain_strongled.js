import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      function createAndUpdateSend(tdEles) {
        return {
          invalid_type: (function () {
            var invalidType = $(tdEles[3]).find(':selected').val()
            var isChangeLine = $(tdEles[5]).find(':selected').val()
            if (invalidType == 1 && isChangeLine == 1) {
              return 2
            }
            if (invalidType == 1 && isChangeLine == 0) {
              return 1
            }
            if (invalidType == 0 && isChangeLine == 0) {
              return 0
            }
          })(),
        }
      }
      servkit.crudtable({
        tableSelector: '#crud-table',
        tableModel: 'com.servtech.servcloud.app.model.strongLED.InvalidReason',
        hideCols: [3, 5],
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            $('[name=invalid_class]').val('0')
            $('[name=process_code]').val('common_process')

            $('[name=invalid_type]').on('change', function (evt) {
              if ($('[name=invalid_type]').val() == 0) {
                $('[name=is_change_line]').val('0')
                $('[name=is_change_line]').attr('disabled', true)
              } else {
                $('[name=is_change_line]').attr('disabled', false)
              }
            })
          },
          send: createAndUpdateSend,
        },
        read: {
          url: 'api/stdcrud',
          whereClause: 'invalid_class = "0" AND invalid_id <> "99"',
          end: {
            4: function (data) {
              return data == 0 ? 'OFF' : 'ON'
            },
            6: function (data, rowData) {
              var invalidType = rowData['invalid_type']
              if (invalidType == 2) {
                return 'ON'
              } else {
                return 'OFF'
              }
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          start: {
            4: function (oldTd, newTd, oldTr, newTr, table) {
              $(newTd)
                .find('[name=invalid_type]')
                .on('change', function (evt) {
                  if ($(newTd).find('[name=invalid_type]').val() == 0) {
                    $(newTr).find('[name=is_change_line]').val('0')
                    $(newTr)
                      .find('[name=is_change_line]')
                      .attr('disabled', true)
                  } else {
                    $(newTr)
                      .find('[name=is_change_line]')
                      .attr('disabled', false)
                  }
                })
              var oldInvalidType = $(oldTd).eq(0).text() == 'ON' ? 1 : 0
              $(newTd)
                .find('[name=invalid_type]')
                .val(oldInvalidType)
                .trigger('change')
            },
          },
          send: createAndUpdateSend,
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (!input.disabled) {
              var result = _.findWhere(ctx.preCon.invalidReasons, {
                invalid_id: input.value,
              })
              if (result != undefined && result.invalid_id == '99') {
                return `${i18n('ServTrackManagement_000320')}`
              }
              if (result) {
                return `${i18n('ServTrackManagement_000318')}`
              }
            }
          },
        },
      })
    },
    util: {},
    preCondition: {
      invalidReasons: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_invalid_reason',
              columns: ['invalid_id'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
            fail: function (data) {
              console.warn(data)
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

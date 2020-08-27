export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-staff-form'), $('#submit-btn'))
      ctx.drawToolTable()

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.sqlSelectSyntax =
          ctx.$staffId.val() == ''
            ? 'staff_id IS NOT NULL'
            : "staff_id = '" + ctx.$staffId.val() + "'"
        ctx.drawToolTable()
      })

      ctx.$staffCrudTableBody.on('click', '.stk-qrcode-btn', function () {
        var qrCodeArr = []
        var table = ctx.$staffCrudTable.data('crudTable')
        for (let row = 0; row < table.data().length; row++) {
          var trEle = table.rows(row).nodes().to$()
          if (
            trEle.find(':checkbox').prop('checked') &&
            trEle.find(':checkbox').css('display') !== 'none'
          ) {
            var staffId = trEle.find('td:nth-child(2)').text()
            qrCodeArr.push(staffId)
          }
        }
        ctx.getQRCodedocx(qrCodeArr)
      })
    },
    util: {
      $staffCrudTable: $('#staff-crudTable'),
      $staffCrudTableBody: $('#staff-crudTable-body'),
      $staffId: $('#staff-id'),
      $Forms: $('#stk-file'),
      sqlSelectSyntax: '',
      bling: function (blingTimes, frequency, $elements, color) {
        var actBlingTimes = blingTimes * 2 + 1
        var blingCount = 1

        setTimeout(function change() {
          if (blingCount < actBlingTimes) {
            if (blingCount++ % 2 === 0) {
              $elements.css('background-color', '')
            } else {
              $elements.css('background-color', color)
            }
            setTimeout(change, frequency)
          }
        }, 0)
      },
      drawToolTable: function () {
        var ctx = this
        if (!ctx.crudToolTable) {
          var crudTable = ctx.$staffCrudTable[0].cloneNode(true)
          ctx.crudToolTable = crudTable
        } else {
          ctx.$staffCrudTableBody.html(ctx.crudToolTable.cloneNode(true))
        }
        servkit.crudtable({
          tableSelector: '#staff-crudTable',
          tableModel: 'com.servtech.servcloud.app.model.teco.TecoStaff',
          hideCols: [6, 7],
          checkbox: true,
          customBtns: [
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>",
          ],
          order: [[0, 'asc']],
          create: {
            url: 'api/stdcrud',
            start: function (newTr, table) {
              var currentTime = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
              $('[name=modify_time]').val(' ')
              $('[name=qrcod_staff]').val(ctx.generateUUID())
              $('[name=create_time]').val(' ')
            },
            finalDo: function (newRow) {
              setTimeout(function () {
                $('.stk-refresh-btn').trigger('click')
              }, 1000)
            },
          },
          read: {
            url: 'api/stdcrud',
            whereClause: ctx.sqlSelectSyntax,
            end: {
              4: function (data, rowData) {
                if (rowData['create_time'] == data) {
                  return '---'
                } else {
                  return data
                }
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            end: {
              4: function (td) {
                return moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
              },
            },
          },
          delete: {},
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              console.log(input)
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return '員工編號重覆'
                }
              }
            },
          },
        })
        $('.stk-delete-btn').hide()
      },
      getQRCodedocx: function (staffIds) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!staffIds.length) {
          that.commons.bling(
            5,
            100,
            $('#stk-line-table').find(
              'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
            ),
            'rgba(255, 0, 0, 0.2)'
          )
          $.smallBox({
            title: '請選取需列印的QRCode...',
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#C79121',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
        } else {
          $.smallBox({
            title: 'Please Wait...',
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#739E73',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
          var $submitForm = $('<form name="' + uuid + '""></form>'),
            iframeHtml =
              '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
          $submitForm.append(
            $('<input>').attr('name', 'staffIds').val(staffIds)
          )
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/teco/servtrack/staff/printQRCode',
            method: 'post',
            target: 'download_target',
          })
          that.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)
          document.querySelector('[name="' + uuid + '"]').submit()
        }
      },
      generateUUID: function () {
        var d = new Date().getTime()
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            var r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16)
          }
        )
        return uuid
      },
    },
    preCondition: {},
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

import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#holder-name').select2()
      servkit.initSelectWithList(ctx.preCon.getHolderName, $('#holder-name'))
      $('#holder-code').select2()
      servkit.initSelectWithList(ctx.preCon.getHolderCode, $('#holder-code'))
      ctx.init()

      $('#holder-table-widget').on(
        'click',
        '.batch-create-holder-modalBtn',
        function (evt) {
          evt.preventDefault()
          ctx.recoverDefault()
          var data = $(evt.target).data()
          $('#batch-create-holder-name').val(data.holder_name)
          $('#batch-create-holder-code').val(data.holder_code)
          $(data.target).data(
            'holder_id',
            $(evt.target).data('holder_id') || ''
          )
        }
      )

      servkit.validateForm(
        $('#batch-create-holder-form'),
        $('#batch-create-submit')
      )

      servkit.initSelectWithList(ctx.preCon.getdeptList, $('#dept-id-select'))

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.drawHolderTable(ctx.$holderCode.val(), ctx.$holderName.val())
      })

      $('#tool-holder-table-body').on(
        'click',
        '[name=holder-list-btn]',
        function (evt) {
          evt.preventDefault()
          var holderCode = $(this).attr('data-holder_code')
          var holderName = $(this).attr('data-holder_name')
          $('#holder-code-text').html(
            `<font>${i18n('Chuck_Code')} | ` + holderCode + '</font>'
          )
          $('#holder-name-text').html(
            `<font>${i18n('Chuck_Name')} | ` + holderName + '</font>'
          )
          ctx.drawHolderListTableModal(holderCode, holderName)
          $('#holder-maintain-modal').modal()
        }
      )

      $('#batch-create-submit').on('click', function (evt) {
        evt.preventDefault()

        var params = {
          holder_code: ctx.$batchCreateHolderCode.val(),
          dept_id: ctx.$deptIdSelect.val(),
          is_open: $('input[name="enable-radio"]:checked').val(),
          create_holder_number: ctx.$createHolderNumberInput.val(),
        }
        ctx.batchCreateHolder(params)
        $('#batch-create-holder-modal').find('.close').click()
      })
      $('#batch-create-cancel').on('click', function (evt) {
        evt.preventDefault()
        $('#batch-create-holder-modal').find('.close').click()
      })

      ctx.$holderListTableBody.on('click', '.stk-qrcode-btn', function () {
        var qrCodeArr = []
        var deptName2Id = ctx.preCon.getdeptName2Id
        var table = $('#holder-list-table').data('crudTable')
        for (let row = 0; row < table.data().length; row++) {
          var trEle = table.rows(row).nodes().to$()
          if (
            trEle.find(':checkbox').prop('checked') &&
            trEle.find(':checkbox').css('display') !== 'none'
          ) {
            var deptName = trEle.find('td:nth-child(3)').text()
            var holderId = trEle.find('td:nth-child(2)').text()
            qrCodeArr.push(holderId)
          }
        }

        ctx.getQRCodedocx(qrCodeArr)
      })
    },
    util: {
      $holderName: $('#holder-name'),
      $holderCode: $('#holder-code'),
      $toolHolderTable: $('#tool-holder-table'),
      $toolHolderTableBody: $('#tool-holder-table-body'),
      $holderListTable: $('#holder-list-table'),
      $holderListTableBody: $('#holder-list-table-body'),
      $batchCreateHolderName: $('#batch-create-holder-name'),
      $batchCreateHolderCode: $('#batch-create-holder-code'),
      $deptIdSelect: $('#dept-id-select'),
      $createHolderNumberInput: $('#create-holder-number-input'),
      $enableRadio: $('#enable-radio'),
      $Forms: $('#stk-file'),
      recoverDefault: function () {
        var ctx = this
        ctx.$enableRadio.prop('checked', true)
        ctx.$createHolderNumberInput.val('')
      },
      init: function () {
        var ctx = this
        ctx.$holderName.prop('selectedIndex', -1)
        ctx.$holderCode.prop('selectedIndex', -1)
        ctx.drawHolderTable(ctx.$holderCode.val(), ctx.$holderName.val())
      },
      batchCreateHolder: function (params) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/management/batch-create-holder',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              $('.stk-refresh-btn').trigger('click')
            },
          }
        )
      },
      drawHolderListTableModal: function (holderCode, holderName) {
        var ctx = this
        if (!ctx.crudHolderListTable) {
          var crudTable = ctx.$holderListTable[0].cloneNode(true)
          ctx.crudHolderListTable = crudTable
        } else {
          ctx.$holderListTableBody.html(ctx.crudHolderListTable.cloneNode(true))
        }
        servkit.crudtable({
          tableSelector: '#holder-list-table',
          tableModel:
            'com.servtech.servcloud.app.model.iiot.IiotToolHolderList',
          hideCols: [4],
          customBtns: [
            '<button class="btn btn-primary batch-create-holder-modalBtn" data-toggle="modal" data-target="#batch-create-holder-modal" data-holder_name="' +
              holderName +
              '" data-holder_code="' +
              holderCode +
              `">${i18n('Batch_Archiving')}</button>`,
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>",
          ],
          order: [[0, 'asc']],
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            whereClause: 'holder_code = "' + holderCode + '"',
          },
          update: {
            url: 'api/stdcrud',
          },
          delete: {
            // url: 'api/stdcrud'
          },
        })
        $('.stk-delete-btn').hide()
      },
      getQRCodedocx: function (deptHolderIds) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!deptHolderIds.length) {
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
            $('<input>').attr('name', 'datas').val(deptHolderIds)
          )
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/iiot/tool/management/print10mmx10mmQRCode',
            method: 'post',
            target: 'download_target',
          })
          that.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)
          document.querySelector('[name="' + uuid + '"]').submit()
        }
      },
      drawHolderTable: function (holderCode, holderName) {
        var ctx = this
        if (!ctx.crudHolderTable) {
          var crudTable = ctx.$toolHolderTable[0].cloneNode(true)
          ctx.crudHolderTable = crudTable
        } else {
          ctx.$toolHolderTableBody.html(ctx.crudHolderTable.cloneNode(true))
        }

        var whereClauseSql =
          'holder_code ' +
          (holderCode == null ? 'IS NOT NULL' : "= '" + holderCode + "'") +
          ' AND holder_name ' +
          (holderName == null ? 'IS NOT NULL' : "= '" + holderName + "'")

        servkit.crudtable({
          tableSelector: '#tool-holder-table',
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolHolder',
          order: [[0, 'asc']],
          create: {
            url: 'api/stdcrud',
            end: {
              4: function (td, formData) {
                var dataHtml = ''
                _.each(formData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                return (
                  '<button name="holder-list-btn" class="btn btn-primary" ' +
                  dataHtml +
                  `>${i18n('Setting')}</button>`
                )
              },
            },
          },
          read: {
            url: 'api/stdcrud',
            whereClause: whereClauseSql,
            end: {
              4: function (data, rowData) {
                var dataHtml = ''
                _.each(rowData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                return (
                  '<button name="holder-list-btn" class="btn btn-primary"' +
                  dataHtml +
                  `>${i18n('Setting')}</button>`
                )
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            end: {
              4: function (td, formData) {
                var dataHtml = ''
                _.each(formData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                return (
                  '<button name="holder-list-btn" class="btn btn-primary"' +
                  dataHtml +
                  `>${i18n('Setting')}</button>`
                )
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return '刀把代碼重複'
                }
              }
            },
          },
        })
      },
    },
    preCondition: {
      getHolderName: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder',
              columns: ['holder_name', 'holder_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.holder_name] = elem.holder_name
              })
              done(dataMap)
            },
          }
        )
      },
      getHolderCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder',
              columns: ['holder_code', 'holder_code'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.holder_code] = elem.holder_code
              })
              done(dataMap)
            },
          }
        )
      },
      getdeptList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_name', 'dept_id'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.dept_id] = elem.dept_name
              })
              done(dataMap)
            },
          }
        )
      },
      getdeptName2Id: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_name', 'dept_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.dept_name] = elem.dept_id
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
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

import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#tool-nc').select2()
      $('#tool-nc-create').select2()
      ctx.$toolIdCreate.select2()
      ctx.$holderId.select2()
      ctx.$deptId.select2()
      ctx.$holderCode.select2()
      $('#quickly-insert-tool-nc-create').select2()
      servkit.initSelectWithList(ctx.preCon.queryDept, ctx.$deptId)
      servkit.initSelectWithList(ctx.preCon.queryHolder, ctx.$holderCode)
      servkit.initSelectWithList(ctx.preCon.queryNcName, $('#tool-nc'))
      servkit.initSelectWithList(ctx.preCon.queryNcName, $('#tool-nc-create'))
      servkit.initSelectWithList(
        ctx.preCon.queryNcName,
        $('#quickly-insert-tool-nc-create')
      )
      ctx.renderToolPrepTable()
      ctx.toolncListTableReportTable = createReportTable({
        $tableElement: $('#tool-nc-list-table'),
        $tableWidget: $('#tool-nc-list-table-widget'),
        showNoData: false,
        hideCols: [8],
        order: [[0, 'asc']],
      })
      ctx.quicklyInsertToolncListTableReportTable = createReportTable({
        $tableElement: $('#quickly-insert-tool-nc-list-table'),
        $tableWidget: $('#quickly-insert-tool-nc-list-table-widget'),
        showNoData: false,
      })

      //使用刀具編輯
      $('#tool-nc-list-table-widget').on(
        'click',
        '.edit-use-tool-modalBtn',
        function (evt) {
          evt.preventDefault()
          ctx.$tempPrepListTr = $(this).parent().parent()
          ctx.$tempToolId = $(this)
            .parent()
            .parent()
            .find('td')
            .eq(7)
            .find('input')
          ctx.$tempHolderId = $(this)
            .parent()
            .parent()
            .find('td')
            .eq(8)
            .find('input')
          var data = $(evt.target).data()
          $('#tool-no-tr').html(data['tool_no'])
          $('#com-tr').html(data['compensation'])
          $('#tool-spec-tr').html(data['tool_spec'])
          $('#tool-type-tr').html(data['tool_type'])
          $('#tool-code-tr').html(data['tool_code'])
          $('#tool-length-tr').html(data['tool_length'])
          $('#holder-type-tr').html(data['holder_type'])
          ctx.ncName = data['nc_name']

          ctx.holderIdDynamicChange()
          ctx.cleanModalUseTool()
          ctx.toolCode = data['tool_code']
          $(data.target).data('nc_name', $(evt.target).data('nc_name') || '')

          //2019/01/25新增需求-備工單編輯可以選99測試用刀編號
          var testToolIds =
            ctx.preCon.queryToolCode2Id['99'] == undefined
              ? {}
              : ctx.preCon.queryToolCode2Id['99']
          var specToolIds = ctx.preCon.queryToolCode2Id[ctx.toolCode]
          var mergeToolIds = Object.assign({}, specToolIds, testToolIds)
          servkit.initSelectWithList(mergeToolIds, ctx.$toolIdCreate)

          ctx.$toolIdCreate
            .val($('#tool-id-create option:first').val())
            .trigger('change')
          var toolId = ctx.$toolIdCreate.val()
          ctx.appendToolOverUseAlarmMsg(toolId, ctx.$toolIdAlarmMsg)
        }
      )

      ctx.$cusToolIdCreate.attr('disabled', false)
      ctx.$toolIdCreate.attr('disabled', false)

      servkit.validateForm($('#use-tool-form'), ctx.$useToolSubmitBtn)
      //使用刀具確認
      ctx.$useToolSubmitBtn.on('click', function (evt) {
        ctx.collectPrepListParam()
        ctx.closeModalUseTool()
        ctx.appendToolInfo()
        ctx.$tempPrepListTr.find('span').html('')
      })

      //使用刀具取消
      ctx.$useToolCancel.on('click', function (evt) {
        ctx.closeModalUseTool()
      })

      //新增備刀記錄
      $('.insert-btn-modal').on('click', function (evt) {
        evt.preventDefault()
        ctx.cleanModalToolPrep()
        var data = $(evt.target).data()
        $(data.target).data('tool_id', $(evt.target).data('tool_id') || '')
      })

      //加工程式名稱change查詢
      $('#tool-nc-create').on('change', function (evt) {
        ctx.insertPrepListParamMap = {}
        var whereClause = 'nc_name = "' + ctx.$toolNcCreate.val() + '"'
        ctx.toolncListTableRenderTable(whereClause)
      })

      //根據選則的radio確認是否要新增自訂刀具
      $('input[name="type"]').on('click', function (evt) {
        if ($('input[name="type"]:checked').val() == 'tool-id-select') {
          ctx.$toolIdCreate
            .val($('#tool-id-create option:first').val())
            .trigger('change')
          ctx.$cusToolIdCreate.attr('disabled', 'disabled')
        } else {
          ctx.$toolIdCreate.select2('val', '')
          ctx.createTool()
        }
      })
      //結案
      $('#tool-prep-table-widget').on('click', '.close-edit', function (evt) {
        ctx.$tempCloseCaseBtn = $(this)
        var data = $(evt.target).data()
        var params = {
          tool_prep_id: moment(data['tool_prep_id']).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
          nc_name: data['nc_name'],
        }
        ctx.tempCloseCaseParams = params
      })

      $('#close-case-submit-btn').on('click', function (evt) {
        ctx.closeCase(ctx.tempCloseCaseParams)
      })

      $('#close-case-cancel').on('click', function (evt) {
        ctx.closeModalCloseCase()
      })

      //備刀明細
      $('#tool-prep-table-widget').on('click', '.prep-detail', function (evt) {
        var data = $(evt.target).data()
        var status = data['status']
        var ncName = data['nc_name']
        var toolPrepId = moment(data['tool_prep_id']).format(
          'YYYY-MM-DD HH:mm:ss'
        )
        $('#nc-name-text').html('<font>加工程式名稱 | ' + ncName + '</font>')
        $('#tool-prep-id-text').html(
          '<font>備刀記錄建立時間 | ' + toolPrepId + '</font>'
        )
        var whereClause =
          'tool_prep_id ="' + toolPrepId + '" AND nc_name="' + ncName + '"'
        ctx.renderToolPrepListTable(whereClause, status)
      })

      $('.holder-id-trigger').on('click', function () {
        ctx.holderIdDynamicChange()
      })
      //新增刀具確認儲存
      $('#batch-create-tool-submit-btn').on('click', function () {
        var params = {
          tool_code: ctx.$toolCodeBatch.val(),
          tool_spec: ctx.$toolSpecBatch.val(),
          tool_type: ctx.$toolTypeBatch.val(),
          use_life_hr: ctx.$useLifeHrBatch.val(),
          alarm_life_hr: ctx.$alarmLifeHrBatch.val(),
          work_sum: '00:00:00',
          tool_status: '1',
          is_open: 'Y',
          create_holder_number: '1',
        }
        ctx.insertTool(params)
      })

      //新增刀具取消
      $('#batch-create-cancel').on('click', function () {
        ctx.closeModalCreateTool()
        ctx.cleanModalUseTool()
        ctx.$toolIdCreate
          .val($('#tool-id-create option:first').val())
          .trigger('change')
        var toolId = ctx.$toolIdCreate.val()
        ctx.appendToolOverUseAlarmMsg(toolId, ctx.$toolIdAlarmMsg)
      })
      //加工程式報表查詢
      $('#submit-btn').on('click', function () {
        var whereClause
        if ($('#tool-nc').val() == null) {
          whereClause = 'nc_name IS NOT NULL'
        } else {
          whereClause = "nc_name = '" + $('#tool-nc').val() + "'"
        }

        ctx.renderToolPrepTable(whereClause)
      })

      ctx.$typeCustomer.on('click', function () {
        ctx.cleanModalCreateTool()
      })

      ctx.$toolIdCreate.on('click', function (evt) {
        ctx.cleanAlarmMsg()
        var toolId = $(this).val()
        ctx.appendToolOverUseAlarmMsg(toolId, ctx.$toolIdAlarmMsg)
      })

      //新增備刀紀錄取消
      ctx.$createToolPrepCancel.on('click', function () {
        ctx.closeModalCreateToolPrep()
      })
      //新增備刀紀錄 備刀完成確認存DB
      ctx.$createToolPrepSubmitBtn.on('click', function () {
        var inputParamEmpty = false
        $('[name="nc-list-param"]').each(function () {
          if ($(this).val() == '') {
            inputParamEmpty = true
          }
        })

        if (inputParamEmpty) {
          alert('請設定所有正確刀具編號、刀把編號')
        } else {
          var params = {
            nc_name: ctx.$toolNcCreate.val(),
            tool_prep_list: _.values(ctx.insertPrepListParamMap),
          }
          console.log(params)
          ctx.insertToolPrep(params)
        }
      })
      $('#tool-nc-list-table-widget>').on(
        'blur',
        '[name="nc-list-param"]',
        function (evt) {
          var data = $(evt.target).data()
          var insertParamKey = data['insert_param_key']
          var dataKey = data['key']
          var value = $(this).val()
          var insertParamValue = ctx.prepListParamMap[insertParamKey]
          insertParamValue[dataKey] = value

          if (dataKey == 'holder_id') {
            //判斷刀把編號訊息
            ctx.appendHolderIdAlarmMsg(value, $(this).parent().find('span'))

            //刀把編號存在才放insert param
            if (ctx.preCon.queryHolderId[value] != null) {
              var deptId = value.split(':')[0]
              insertParamValue['dept_id'] = deptId
              ctx.insertPrepListParamMap[insertParamKey] = insertParamValue
            }
          }

          if (dataKey == 'tool_id') {
            //判斷刀具編號訊息
            var $toolId = $(this).parent().find('span')
            ctx.appendToolOverUseAlarmMsg(value, $toolId)

            //刀具編號存在才放insert param
            if (ctx.preCon.queryTool[value] != null) {
              insertParamValue['memo'] = $toolId.text()
              ctx.insertPrepListParamMap[insertParamKey] = insertParamValue
            }
          }
        }
      )

      ctx.$toolPrepTableBody.on('click', '.stk-qrcode-btn', function () {
        var qrCodeArr = []
        var table = ctx.$toolPrepTable.data('crudTable')
        for (let row = 0; row < table.data().length; row++) {
          var trEle = table.rows(row).nodes().to$()
          if (
            trEle.find(':checkbox').prop('checked') &&
            trEle.find(':checkbox').css('display') !== 'none'
          ) {
            var ncName = trEle.find('td:nth-child(2)').text()
            var toolPrepId = trEle.find('td:nth-child(3)').text()
            var content = ncName + '|' + toolPrepId
            qrCodeArr.push(content)
          }
        }
        ctx.getQRCodedocx(qrCodeArr)
      })

      // 快速建立備刀單紀錄 - 查詢備刀單所需刀號
      $('#quickly-insert-tool-nc-create').on('change', function () {
        ctx.quicklyInsertInsertPrepListParamMap = {}
        var whereClause = `nc_name = "${this.value}"`
        ctx.quicklyInsertToolncListTableRenderTable(whereClause)
      })
      // 快速建立備刀單紀錄 - 呼叫API做建立與綁定的動作
      $('#quickly-insert-btn').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/iiot/tool/preparelist/oneKeyCreateToolPrep',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              nc_name: $('#quickly-insert-tool-nc-create').val(),
            }),
          },
          {
            success: function (data) {
              $('#quickly-insert-modal').modal('hide')
              $('.stk-refresh-btn').trigger('click')
              if (data)
                ctx.quicklyInsertNcName = data.toFormatedDatetime(
                  null,
                  'YYYY-MM-DD HH:mm:ss'
                )
            },
          }
        )
      })
    },
    util: {
      quicklyInsertNcName: null,
      $tempPrepListTr: null,
      $tempToolId: null,
      $tempDeptId: null,
      $tempHolderId: null,
      toolCode: null,
      ncName: null,
      toolId: null,
      queryToolPrepNum: null,
      quicklyInsertQueryToolPrepNum: null,
      $Forms: $('#stk-file'),
      $typeSelect: $('#type_select'),
      $typeCustomer: $('#type_customer'),
      $createToolPrepCancel: $('#create-tool-prep-cancel'),
      $createToolPrepSubmitBtn: $('#create-tool-prep-submit-btn'),
      $toolIdAlarmMsg: $('#tool-id-alarm-msg'),
      $useToolCancel: $('#use-tool-cancel'),
      $useToolSubmitBtn: $('#use-tool-submit-btn'),
      $toolIdCreate: $('#tool-id-create'),
      $cusToolIdCreate: $('#cus-tool-id-create'),
      $toolNcCreate: $('#tool-nc-create'),
      $alarmLifeHrBatch: $('#alarm-life-hr-batch'),
      $useLifeHrBatch: $('#use-life-hr-batch'),
      $toolSpecBatch: $('#tool-spec-batch'),
      $toolTypeBatch: $('#tool-type-batch'),
      $toolCodeBatch: $('#tool-code-batch'),
      $deptId: $('[name=dept-id]'),
      $holderCode: $('[name=holder-code]'),
      $holderId: $('[name=holder-id]'),
      $toolNoTr: $('#tool-no-tr'),
      $comTr: $('#com-tr'),
      $toolSpecTr: $('#tool-spec-tr'),
      $toolTypeTr: $('#tool-type-tr'),
      $toolCodeTr: $('#tool-code-tr'),
      $toolLengthTr: $('#tool-length-tr'),
      $holderTypeTr: $('#holder-type-tr'),
      $toolPrepTable: $('#tool-prep-table'),
      $toolPrepTableBody: $('#tool-prep-table-body'),
      $toolPrepListTable: $('#tool-prep-list-table'),
      $toolPrepListTableBody: $('#tool-prep-list-table-body'),
      toolncListTableReportTable: null,
      quicklyInsertToolncListTableReportTable: null,
      insertPrepListParamMap: {},
      prepListParamMap: {},
      quicklyInsertPrepListParamMap: {},
      $tempCloseCaseBtn: null,
      tempCloseCaseParams: {},
      toolPrepTableObj: null,
      appendHolderIdAlarmMsg: function (holderId, $msg) {
        var ctx = this
        if (ctx.preCon.queryHolderId[holderId] == null) {
          var holderIdAlarmMsg = '此刀把編號不存在'
          $msg.html(
            "<font style='color:" +
              servkit.colors.red +
              "';>" +
              holderIdAlarmMsg +
              '</font>'
          )
        } else {
          $msg.html('')
        }
      },
      appendToolOverUseAlarmMsg: function (toolId, $msg, switchMode) {
        var ctx = this
        if (ctx.preCon.queryTool[toolId] != null) {
          var useLifeHr = ctx.preCon.queryTool[toolId].use_life_hr
          var alarmLifeHr = ctx.preCon.queryTool[toolId].alarm_life_hr
          var workSum = ctx.preCon.queryTool[toolId].work_sum
          var workSumSec = ctx.time2Sec(workSum)

          var alarmLifeSec = alarmLifeHr * 60 * 60
          var useLifeSec = useLifeHr * 60 * 60
          var toolAlarmMsg = ''
          var html = ''
          if (useLifeSec - workSumSec < alarmLifeSec) {
            var persent = parseFloat((workSumSec / useLifeSec) * 100).toFixed(2)
            var workSumHr = parseFloat(workSumSec) / 60 / 60
            toolAlarmMsg =
              '提醒：此刀具累計使用壽命已達' +
              persent +
              '%(' +
              workSumHr.toFixed(1) +
              '/' +
              useLifeHr.toFixed(1) +
              ')小時'
            html =
              "<font style='color:" +
              servkit.colors.red +
              "';>" +
              toolAlarmMsg +
              '</font>'
            switchMode == null ? $msg.html(html) : $msg.append(html)
          } else {
            switchMode == null ? $msg.html('') : $msg.append('')
          }
        } else {
          toolAlarmMsg = '此刀具編號不存在'
          html =
            "<font style='color:" +
            servkit.colors.red +
            "';>" +
            toolAlarmMsg +
            '</font>'
          switchMode == null ? $msg.html(html) : $msg.append(html)
        }
      },
      renderToolPrepListTable: function (whereClause, status) {
        var trigger = false
        if (status == '1') {
          trigger = true
        }
        var ctx = this
        if (!ctx.crudToolPrepListTable) {
          var crudTable = ctx.$toolPrepListTable[0].cloneNode(true)
          ctx.crudToolPrepListTable = crudTable
        } else {
          ctx.$toolPrepListTableBody.html(
            ctx.crudToolPrepListTable.cloneNode(true)
          )
        }

        servkit.crudtable({
          tableSelector: '#tool-prep-list-table',
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolPrepList',
          hideCols: [1, 2, 11, 13], //要隱藏的欄位，從1開始。適用於不能顯示給使用者看到，但儲存需要使用的欄位
          order: [[0, 'asc']],
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            whereClause: whereClause,
            end: {
              11: function (data) {
                return ctx.preCon.queryDept[data]
              },
            },
          },
          update: {
            unavailable: trigger,
            url: 'api/stdcrud',
            start: {
              1: function (oldTd, newTd, oldTr, newTr) {
                $(newTd)
                  .find('[name=tool_prep_id]')
                  .val(moment($(oldTd).text()).format('YYYY-MM-DD HH:mm:ss'))
              },
              10: function (oldTd, newTd, oldTr, newTr) {
                var toolCode = $(oldTr).find(':eq(7)').text()
                var toolId = $(oldTd).text()

                $(newTd).find('[name=tool_id]').select2()

                //2019/01/25新增需求-備工單編輯可以選99測試用刀編號
                var testToolIds =
                  ctx.preCon.queryToolCode2Id['99'] == undefined
                    ? {}
                    : ctx.preCon.queryToolCode2Id['99']
                var specToolIds = ctx.preCon.queryToolCode2Id[toolCode]
                var mergeToolIds = Object.assign({}, specToolIds, testToolIds)
                servkit.initSelectWithList(
                  mergeToolIds,
                  $(newTd).find('[name=tool_id]')
                )

                $(newTd)
                  .find('[name=tool_id]')
                  .on('change', function () {
                    var toolId = $(newTd).find('[name=tool_id]').val()
                    $(newTd).find('font').remove()
                    ctx.appendToolOverUseAlarmMsg(
                      toolId,
                      $(newTd),
                      'useAppendForUpdate'
                    )
                  })

                $(newTd).find('[name=tool_id]').val(toolId).trigger('change')
              },
              11: function (oldTd, newTd, oldTr, newTr) {
                var deptId = $(oldTd).text()
                $(newTd).find('[name=dept_id]').select2()
                $(newTr).find('[name=holder_id]').select2()

                servkit.initSelectWithList(
                  ctx.preCon.queryDept,
                  $(newTd).find('[name=dept_id]')
                )
                $(newTd)
                  .find('[name=dept_id]')
                  .val(_.invert(ctx.preCon.queryDept)[deptId])
                  .trigger('change')

                $(newTd)
                  .find('[name=dept_id]')
                  .on('change', function () {
                    var deptId = $(newTd).find('[name=dept_id]').val()
                    servkit.initSelectWithList(
                      ctx.preCon.queryDeptId2HolderId[deptId],
                      $(newTr).find('[name=holder_id]')
                    )
                    $(newTr)
                      .find('[name=holder_id]')
                      .val($(newTr).find('[name=holder_id] option:first').val())
                      .trigger('change')
                  })
              },
              12: function (oldTd, newTd, oldTr, newTr) {
                var deptId = _.invert(ctx.preCon.queryDept)[
                  $(oldTr).find(':eq(11)').text()
                ]
                var holderId = $(oldTd).text()
                servkit.initSelectWithList(
                  ctx.preCon.queryDeptId2HolderId[deptId],
                  $(newTr).find('[name=holder_id]')
                )
                $(newTd)
                  .find('[name=holder_id]')
                  .val(holderId)
                  .trigger('change')
              },
            },
            send: function (tdEles) {
              return {
                memo: (function () {
                  return $(tdEles).parent().find('font').text()
                })(),
              }
            },
            end: {
              10: function (td) {
                return $(td).find('[name=tool_id]').val()
              },
              11: function (td) {
                return $(td).find('[name=dept_id]').val()
              },
              12: function (td) {
                return $(td).find('[name=holder_id]').val()
              },
            },
            finalDo: function (newRow) {
              var deptName =
                ctx.preCon.queryDept[$(newRow).find('td').eq(11).text()]
              $(newRow).find('td').eq(11).text(deptName)
              $('.stk-refresh-btn').trigger('click')
            },
          },
          delete: {
            unavailable: true,
          },
        })
      },
      getQRCodedocx: function (content) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!content.length) {
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
          $submitForm.append($('<input>').attr('name', 'datas').val(content))
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/iiot/tool/management/print24mmx24mmQRCode',
            method: 'post',
            target: 'download_target',
          })
          that.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)
          document.querySelector('[name="' + uuid + '"]').submit()
        }
      },
      closeCase: function (params) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/preparelist/updatePrepList',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              ctx.closeModalCloseCase()
              $('.stk-refresh-btn').trigger('click')
            },
          }
        )
      },
      renderToolPrepTable: function (whereClause) {
        var ctx = this
        if (!ctx.crudToolPrepTable) {
          var crudTable = ctx.$toolPrepTable[0].cloneNode(true)
          ctx.crudToolPrepTable = crudTable
        } else {
          ctx.$toolPrepTableBody.html(ctx.crudToolPrepTable.cloneNode(true))
        }
        ctx.toolPrepTableObj = servkit.crudtable({
          tableSelector: '#tool-prep-table',
          tableModel:
            'com.servtech.servcloud.app.model.iiot.view.IiotToolPrepModifyTime',
          customBtns: [
            '<button class="btn btn-primary insert-btn-modal" data-toggle="modal" data-target="#create-tool-prep-modal"><span class="fa fa-plus fa-lg"></span></button>',
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode'><span class='fa fa-qrcode fa-lg'></span></button>",
            '<button id="quickly-insert" class="btn btn-primary" data-toggle="modal" data-target="#quickly-insert-modal">快速建立</button>',
          ],
          order: [[1, 'desc']],
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            whereClause: whereClause,
            end: {
              4: function (data, rowData) {
                var dataHtml = ''
                _.each(rowData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                return (
                  '<button class="btn btn-primary prep-detail" data-toggle="modal" data-target="#update-tool-prep-modal"' +
                  dataHtml +
                  '>備刀明細</button>'
                )
              },
              5: function (data, rowData) {
                var dataHtml = ''
                var status
                _.each(rowData, (value, key) => {
                  if (key == 'status') {
                    status = value
                  }
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                if (status == 1) {
                  dataHtml += ' disabled'
                  return (
                    '<button class="btn btn-primary disabled"' +
                    dataHtml +
                    '>已結案</button>'
                  )
                } else {
                  return (
                    '<button class="btn btn-primary close-edit" data-toggle="modal" data-target="#close-case-check-modal"' +
                    dataHtml +
                    '>結案</button>'
                  )
                }
              },
            },
            finalDo: function () {
              if (ctx.quicklyInsertNcName)
                ctx.toolPrepTableObj.getBlingRow(1, ctx.quicklyInsertNcName)
              ctx.quicklyInsertNcName = null
            },
          },
          update: {
            unavailable: true,
          },
          delete: {
            // url: 'api/stdcrud'
          },
        })
        $('.stk-delete-btn').hide()
        $('.stk-create-btn').hide()
      },
      insertToolPrep: function (params) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/preparelist/createToolPrep',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              ctx.closeModalCreateToolPrep()
              $('.stk-refresh-btn').trigger('click')
              alert('備刀紀錄完成確認')
            },
            fail: function (data) {
              alert('請設定所有正確刀具編號、刀把編號')
            },
          }
        )
      },
      appendToolInfo: function () {
        var ctx = this
        ctx.$tempToolId.val(ctx.toolId)
        // ctx.$tempDeptId.val(ctx.$deptId.val());
        ctx.$tempHolderId.val(ctx.$holderId.val())
      },
      closeModalUseTool: function () {
        $('#use-tool-modal').find('.close').click()
      },
      closeModalCreateTool: function () {
        $('#batch-create-tool-modal').find('.close').click()
      },
      closeModalCreateToolPrep: function () {
        $('#create-tool-prep-modal').find('.close').click()
      },
      closeModalUpdateToolPrep: function () {
        $('#update-tool-prep-modal').find('.close').click()
      },
      closeModalCloseCase: function () {
        $('#close-case-check-modal').find('.close').click()
      },
      collectPrepListParam: function () {
        var ctx = this
        var prepList = {}
        if ($('input[name="type"]:checked').val() == 'tool-id-select') {
          prepList['tool_id'] = ctx.$toolIdCreate.val()
          ctx.toolId = ctx.$toolIdCreate.val()
        } else {
          prepList['tool_id'] = ctx.$cusToolIdCreate.val()
          ctx.toolId = ctx.$cusToolIdCreate.val()
        }
        prepList['nc_name'] = ctx.ncName
        prepList['tool_no'] = ctx.$toolNoTr.text()
        prepList['compensation'] = ctx.$comTr.text()
        prepList['tool_spec'] = ctx.$toolSpecTr.text()
        prepList['tool_type'] = ctx.$toolTypeTr.text()
        prepList['tool_code'] = ctx.toolCode.toString()
        prepList['tool_length'] = ctx.$toolLengthTr.text()
        prepList['holder_type'] = ctx.$holderTypeTr.text()

        prepList['holder_id'] = ctx.$holderId.val()
        prepList['dept_id'] = ctx.$deptId.val()
        prepList['memo'] = ctx.$toolIdAlarmMsg.text()
        var key = ctx.ncName + ctx.$toolNoTr.text()
        ctx.insertPrepListParamMap[key] = prepList
      },
      holderIdDynamicChange: function () {
        var ctx = this
        ctx.$holderId.select2('val', '')
        var keys = ctx.$deptId.val() + ctx.$holderCode.val()
        if (ctx.preCon.queryHolderList[keys] === undefined) {
          servkit.initSelectWithList({}, ctx.$holderId)
          ctx.$holderId
            .val($('[name=holder-id] option:first').val())
            .trigger('change')
        } else {
          servkit.initSelectWithList(
            ctx.preCon.queryHolderList[keys],
            ctx.$holderId
          )
          ctx.$holderId
            .val($('[name=holder-id] option:first').val())
            .trigger('change')
        }
      },
      cleanAlarmMsg: function () {
        var ctx = this
        ctx.$toolIdAlarmMsg.empty()
      },
      time2Sec: function (strTime) {
        var arraryStrTime = strTime.split(':')
        var hour = parseInt(arraryStrTime[0])
        var min = parseInt(arraryStrTime[1])
        var sec = parseInt(arraryStrTime[2])
        var sumSec = parseInt(hour) * 60 * 60 + min * 60 + sec
        return sumSec
      },
      cleanModalCreateTool: function () {
        var ctx = this
        ctx.$alarmLifeHrBatch.val('')
        ctx.$useLifeHrBatch.val('')
      },
      cleanModalUseTool: function () {
        var ctx = this
        // ctx.$holderId.select2('val', '');
        ctx.cleanAlarmMsg()
        ctx.$toolIdCreate.select2('val', '')
        ctx.$cusToolIdCreate.val('')
        ctx.$toolIdCreate.attr('disabled', false)
        ctx.$cusToolIdCreate.attr('disabled', false)
        ctx.$cusToolIdCreate.attr('disabled', true)
        ctx.$typeSelect.prop('checked', true)
        ctx.$typeSelect.attr('disabled', false)
        ctx.$typeCustomer.attr('disabled', false)
        ctx.$holderCode
          .val($('[name=holder-code] option:first').val())
          .trigger('change')
        ctx.$deptId
          .val($('[name=dept-id] option:first').val())
          .trigger('change')
        ctx.holderIdDynamicChange()
      },
      cleanModalToolPrep: function () {
        var ctx = this
        ctx.$toolNcCreate.select2('val', '')
        ctx.toolncListTableReportTable.clearTable()
        ctx.insertPrepListParamMap = {}
      },
      insertTool: function (params) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/management/batch-create-tool',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              ctx.$cusToolIdCreate.val(data)
              ;+ctx.$cusToolIdCreate.attr('disabled', 'disabled')
              ctx.$toolIdCreate.select2('val', '')
              ctx.$toolIdCreate.attr('disabled', 'disabled')
              ctx.$toolIdCreate.attr('disabled', 'disabled')

              ctx.$typeSelect.attr('disabled', true)
              ctx.$typeCustomer.attr('disabled', true)
              ctx.closeModalCreateTool()
            },
          }
        )
      },
      createTool: function () {
        var ctx = this
        var toolErp = ctx.preCon.getToolErp[ctx.toolCode]
        ctx.$toolCodeBatch.val(ctx.toolCode)
        ctx.$toolTypeBatch.val(toolErp['tool_type'])
        ctx.$toolSpecBatch.val(toolErp['tool_spec'])
        ctx.$useLifeHrBatch.val(toolErp['use_life_hr'])
        ctx.$alarmLifeHrBatch.val(toolErp['alarm_life_hr'])
        ctx.$toolTypeBatch.attr('disabled', 'disabled')
        ctx.$toolSpecBatch.attr('disabled', 'disabled')
        ctx.$toolCodeBatch.attr('disabled', 'disabled')
      },
      toolncListTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolNcList',
          whereClause: whereClause,
        }
        if (whereClause) {
          data.whereClause = whereClause
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            contentType: 'application/json',
            data: data,
          },
          {
            success: function (data) {
              ctx.queryToolPrepNum = data.length
              ctx.toolncListTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  var dataKey = ''

                  var paramkey = val['nc_name'] + val['tool_no']
                  ctx.prepListParamMap[paramkey] = val

                  _.each(val, (value, key) => {
                    dataKey += ' data-' + key + '= "' + value + '"'
                  })
                  return [
                    val.tool_no === null || val.tool_no === undefined
                      ? ''
                      : val.tool_no,
                    val.compensation === null || val.compensation === undefined
                      ? ''
                      : val.compensation,
                    val.tool_spec === null || val.tool_spec === undefined
                      ? ''
                      : val.tool_spec,
                    val.tool_type === null || val.tool_type === undefined
                      ? ''
                      : val.tool_type,
                    val.tool_code === null || val.tool_code === undefined
                      ? ''
                      : val.tool_code,
                    val.tool_length === null || val.tool_length === undefined
                      ? ''
                      : val.tool_length,
                    val.holder_type === null || val.holder_type === undefined
                      ? ''
                      : val.holder_type,
                    '<label class="input"><input type="text" data-key="tool_id" data-insert_param_key="' +
                      paramkey +
                      '" name="nc-list-param" class="form-control" size="36"><span id="' +
                      paramkey +
                      'tool_id' +
                      '"></span></label>',
                    '<label class="input"><input type="text" data-key="dept_id" data-insert_param_key="' +
                      paramkey +
                      '" name="nc-list-param" class="form-control"></label>',
                    '<label class="input"><input type="text" data-key="holder_id" data-insert_param_key="' +
                      paramkey +
                      '"name="nc-list-param" class="form-control"><span id="' +
                      paramkey +
                      'holder_id' +
                      '"></span></label>',
                    '<button class="btn btn-primary edit-use-tool-modalBtn" data-toggle="modal" data-target="#use-tool-modal" data-pks="{edit:' +
                      val.edit +
                      '}" ' +
                      dataKey +
                      `>${i18n('Edit')}</button>`,
                  ]
                })
              )
            },
          }
        )
      },
      quicklyInsertToolncListTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolNcList',
          whereClause: whereClause,
        }
        if (whereClause) {
          data.whereClause = whereClause
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            contentType: 'application/json',
            data: data,
          },
          {
            success: function (data) {
              ctx.quicklyInsertQueryToolPrepNum = data.length
              ctx.quicklyInsertToolncListTableReportTable.drawTable(
                _.map(data, (val) => {
                  ctx.quicklyInsertPrepListParamMap[
                    `${val['nc_name']}${val['tool_no']}`
                  ] = val
                  return [
                    val.tool_no === null || val.tool_no === undefined
                      ? ''
                      : val.tool_no,
                    val.compensation === null || val.compensation === undefined
                      ? ''
                      : val.compensation,
                    val.tool_spec === null || val.tool_spec === undefined
                      ? ''
                      : val.tool_spec,
                    val.tool_type === null || val.tool_type === undefined
                      ? ''
                      : val.tool_type,
                    val.tool_code === null || val.tool_code === undefined
                      ? ''
                      : val.tool_code,
                    val.tool_length === null || val.tool_length === undefined
                      ? ''
                      : val.tool_length,
                    val.holder_type === null || val.holder_type === undefined
                      ? ''
                      : val.holder_type,
                  ]
                })
              )
            },
          }
        )
      },
    },
    preCondition: {
      queryDept: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_id', 'dept_name'],
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
      queryHolder: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder',
              columns: ['holder_code', 'holder_name'],
              whereClause: 'is_open = "Y"',
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
      queryHolderList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder_list',
              columns: ['holder_code', 'holder_id', 'dept_id'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                var keys = elem.dept_id + elem.holder_code
                if (!dataMap[keys]) {
                  var holderMap = {}
                  holderMap[elem.holder_id] = elem.holder_id
                  dataMap[keys] = holderMap
                } else {
                  dataMap[keys][elem.holder_id] = elem.holder_id
                }
              })
              done(dataMap)
            },
          }
        )
      },
      queryHolderId: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder_list',
              columns: ['holder_id'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.holder_id] = elem.holder_id
              })
              done(dataMap)
            },
          }
        )
      },
      queryNcName: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_nc',
              columns: ['nc_name', 'nc_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.nc_name] = elem.nc_name
              })
              done(dataMap)
            },
          }
        )
      },
      getToolErp: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: [
                'tool_code',
                'tool_spec',
                'tool_type',
                'use_life_hr',
                'alarm_life_hr',
              ],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                var detailMap = {}
                detailMap['tool_code'] = elem.tool_code
                detailMap['tool_spec'] = elem.tool_spec
                detailMap['tool_type'] = elem.tool_type
                detailMap['use_life_hr'] = elem.use_life_hr
                detailMap['alarm_life_hr'] = elem.alarm_life_hr
                dataMap[elem.tool_code] = detailMap
              })
              done(dataMap)
            },
          }
        )
      },
      queryTool: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool',
              columns: [
                'tool_id',
                'tool_code',
                'use_life_hr',
                'work_sum',
                'alarm_life_hr',
              ],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_id] = elem
              })
              done(dataMap)
            },
          }
        )
      },
      queryToolCode2Id: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool',
              columns: ['tool_id', 'tool_code'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                if (!dataMap[elem.tool_code]) {
                  var toolIdMap = {}
                  toolIdMap[elem.tool_id] = elem.tool_id
                  dataMap[elem.tool_code] = toolIdMap
                } else {
                  dataMap[elem.tool_code][elem.tool_id] = elem.tool_id
                }
              })
              done(dataMap)
            },
          }
        )
      },
      queryDeptId2HolderId: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder_list',
              columns: ['dept_id', 'holder_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                if (!dataMap[elem.dept_id]) {
                  var holderIdMap = {}
                  holderIdMap[elem.holder_id] = elem.holder_id
                  dataMap[elem.dept_id] = holderIdMap
                } else {
                  dataMap[elem.dept_id][elem.holder_id] = elem.holder_id
                }
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

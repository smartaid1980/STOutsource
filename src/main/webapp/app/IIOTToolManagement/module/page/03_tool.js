import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.drawToolTable()
      servkit.validateForm($('#submit-form'), $('#submit-btn'))
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)

      ctx.$toolCode.select2()
      servkit.initSelectWithList(ctx.preCon.getToolCode, ctx.$toolCode)
      ctx.$toolType.select2()
      servkit.initSelectWithList(ctx.preCon.getToolType, ctx.$toolType)

      ctx.$toolCodeBatch.select2()
      var appendTestToolCode = ctx.preCon.getToolCode
      appendTestToolCode['99'] = '99'
      servkit.initSelectWithList(appendTestToolCode, ctx.$toolCodeBatch)

      ctx.$toolCode.prop('selectedIndex', -1)

      ctx.$toolTypeBatch.select2()
      servkit.initSelectWithList(ctx.preCon.getToolType, ctx.$toolTypeBatch)

      ctx.tempalteEngine = createTempalteEngine()
      ctx.toolresumeTableReportTable = createReportTable({
        $tableElement: $('#tool-resume-table'),
        $tableWidget: $('#tool-resume-table-widget'),
        order: [[0, 'asc']],
      })
      servkit.validateForm($('#update-tool-form'), $('#update-tool-submit-btn'))
      servkit.validateForm(
        $('#batch-create-tool-form'),
        $('#batch-create-tool-submit-btn')
      )
      servkit.initSelectWithList(
        {
          '0': '新刀',
          '2': '研發測試用刀',
        },
        $('#build-type')
      )

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.drawToolTable()
      })

      $('#build-type').on('change', function (evt) {
        var toolType = $(this).val()
        if (toolType == 0) {
          ctx.recoverDefault()
        } else {
          $('#tool-code-batch option[value=99]').attr('hidden', false)
          ctx.$toolCodeBatch.select2('val', '99')
          ctx.$toolCodeBatch.attr('disabled', 'disabled')
          ctx.$toolTypeBatch.removeAttr('disabled')
          ctx.$toolSpecBatch.removeAttr('disabled')

          ctx.$toolTypeBatch.select2('val', '')
          ctx.$toolSpecBatch.attr('value', '')
          // ctx.$useLifeHrBatch.attr('value', '999');
          // ctx.$alarmLifeHrBatch.attr('value', '0');
          ctx.$useLifeHrBatch.val('999')
          ctx.$alarmLifeHrBatch.val('0')
          ctx.$alarmLifeHrBatch.attr('value', '')
          ctx.$cteateNum.attr('value', '')
        }
      })

      ctx.$toolCodeBatch.on('change', function (evt) {
        var toolCode = $(this).val()
        var toolErp = ctx.preCon.getToolErp[toolCode]
        ctx.$useLifeHrBatch.val(toolErp['use_life_hr'])
        ctx.$alarmLifeHrBatch.val(toolErp['alarm_life_hr'])
        ctx.$toolSpecBatch.val(toolErp['tool_spec'])
        ctx.$toolTypeBatch.select2('val', toolErp['tool_type'])
        ctx.$toolSpecBatch.val(toolErp['tool_spec'])

        ctx.$toolTypeBatch.attr('disabled', 'disabled')
        ctx.$toolSpecBatch.attr('disabled', 'disabled')
      })

      $('#update-cancel').on('click', function (evt) {
        evt.preventDefault()
        $('#update-tool-modal').find('.close').click()
      })

      $('#batch-create-cancel').on('click', function (evt) {
        evt.preventDefault()
        $('#batch-create-tool-modal').find('.close').click()
      })

      $('#update-tool-submit-btn').on('click', function () {
        var params = {
          tool_id: ctx.$toolIdUpdate.val(),
          use_life_hr: ctx.$useLifeHrUpdate.val(),
          alarm_life_hr: ctx.$alarmLifeHrUpdate.val(),
          is_open: $('input[name="update-enable-radio"]:checked').val(),
        }
        ctx.updateTool(params)
      })

      $('#batch-create-tool-submit-btn').on('click', function () {
        var params = {
          tool_code: ctx.$toolCodeBatch.val(),
          tool_spec: ctx.$toolSpecBatch.val(),
          tool_type: ctx.$toolTypeBatch.val(),
          use_life_hr: ctx.$useLifeHrBatch.val(),
          alarm_life_hr: ctx.$alarmLifeHrBatch.val(),
          work_sum: '00:00:00',
          tool_status: '1',
          is_open: $('input[name="enable-radio"]:checked').val(),
          create_holder_number: ctx.$cteateNum.val(),
        }
        ctx.batchInsertTool(params)
      })

      $('#tool-table-widget').on(
        'click',
        '.batch-create-tool-modalBtn',
        function (evt) {
          evt.preventDefault()
          var data = $(evt.target).data()
          $(data.target).data('tool_id', $(evt.target).data('tool_id') || '')
          ctx.recoverDefault()
        }
      )

      $('#tool-table-widget').on('click', '.tool-used-resume-modal', function (
        evt
      ) {
        evt.preventDefault()
        var data = $(evt.target).data()
        ctx.toolresumeTableReportTable.clearTable()
        ctx.toolresumeTableRenderTable(data['tool_id'])
        var toolIdHtml = '<font>刀具編號: ' + data['tool_id'] + '</font>'
        var workSumHtml =
          '<font style="color:' +
          servkit.colors.red +
          ';">總加工時間: ' +
          data['work_sum'] +
          '</font>'
        $('#tool-id-text').html(toolIdHtml)
        $('#work-sum-text').html(workSumHtml)
      })

      $('#tool-table-widget').on('click', '.update-tool-btn', function (evt) {
        evt.preventDefault()

        var data = $(evt.target).data()
        ctx.$toolIdUpdate.val(data['tool_id'])
        ctx.$alarmLifeHrUpdate.val(data['alarm_life_hr'])
        ctx.$useLifeHrUpdate.val(data['use_life_hr'])
        ctx.$toolSpecUpdate.val(data['tool_spec'])
        ctx.$toolTypeUpdate.val(data['tool_type'])
        ctx.$toolCodeUpdate.val(data['tool_code'])

        ctx.$toolIdUpdate.attr('disabled', 'disabled')
        ctx.$buildTypeUpdate.attr('disabled', 'disabled')
        ctx.$toolCodeUpdate.attr('disabled', 'disabled')
        ctx.$toolSpecUpdate.attr('disabled', 'disabled')
        ctx.$toolTypeUpdate.attr('disabled', 'disabled')

        if (data['tool_code'] == '99') {
          ctx.$buildTypeUpdate.val('研發測試用刀')
        } else {
          ctx.$buildTypeUpdate.val('新刀')
        }

        if (data['is_open'] == 'Y') {
          $('#update-tool-modal')
            .find(":radio[value='N']")
            .prop('checked', 'true')
          $('#update-tool-modal')
            .find(":radio[value='Y']")
            .prop('checked', 'false')
        } else {
          $('#update-tool-modal')
            .find(":radio[value='Y']")
            .prop('checked', 'true')
          $('#update-tool-modal')
            .find(":radio[value='N']")
            .prop('checked', 'false')
        }
      })

      ctx.$toolTableBody.on('click', '.stk-qrcode-btn', function () {
        var qrCodeArr = []
        var table = $('#tool-table').data('crudTable')
        for (let row = 0; row < table.data().length; row++) {
          var trEle = table.rows(row).nodes().to$()
          if (
            trEle.find(':checkbox').prop('checked') &&
            trEle.find(':checkbox').css('display') !== 'none'
          ) {
            var toolId = trEle.find('td:nth-child(2)').text()
            qrCodeArr.push(toolId)
          }
        }
        ctx.getQRCodedocx(qrCodeArr)
      })
    },
    util: {
      $alarmLifeHrBatch: $('#alarm-life-hr-batch'),
      $useLifeHrBatch: $('#use-life-hr-batch'),
      $toolSpecBatch: $('#tool-spec-batch'),
      $toolTypeBatch: $('#tool-type-batch'),
      $toolCodeBatch: $('#tool-code-batch'),
      $alarmLifeHrUpdate: $('#alarm-life-hr-update'),
      $useLifeHrUpdate: $('#use-life-hr-update'),
      $toolSpecUpdate: $('#tool-spec-update'),
      $toolTypeUpdate: $('#tool-type-update'),
      $toolCodeUpdate: $('#tool-code-update'),
      $toolIdUpdate: $('#tool-id-update'),
      $buildTypeUpdate: $('#build-type-update'),
      $toolCode: $('#tool-code'),
      $toolType: $('#tool-type'),
      $toolTable: $('#tool-table'),
      $toolTableBody: $('#tool-table-body'),
      $cteateNum: $('#create-number'),
      $Forms: $('#stk-file'),
      $batchCreateToolModal: $('#batch-create-tool-modal'),
      $toolUsedResume: $('#tool-used-resume'),
      $enableRadio: $('#enable-radio'),
      $buildType: $('#build-type'),
      recoverDefault: function () {
        var ctx = this
        ctx.$buildType.val('0')
        ctx.$enableRadio.prop('checked', true)
        ctx.$alarmLifeHrBatch.val('')
        ctx.$useLifeHrBatch.val('')
        ctx.$toolSpecBatch.val('')
        ctx.$toolTypeBatch.select2('val', '')
        ctx.$toolCodeBatch.select2('val', '')
        ctx.$cteateNum.val('')

        ctx.$toolCodeBatch.prop('selectedIndex', -1)
        ctx.$toolCodeBatch.removeAttr('disabled')
        $('#tool-code-batch option[value=99]').addClass('hide')
        ctx.$toolTypeBatch.attr('disabled', 'disabled')
        ctx.$toolSpecBatch.attr('disabled', 'disabled')
      },
      timeDataNormalize: function (millisecond) {
        return parseInt(millisecond / 1000) * 1000
      },
      updateTool: function (params) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/management/updateTool',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              $('.stk-refresh-btn').trigger('click')
              $('#update-tool-modal').find('.close').click()
            },
          }
        )
      },
      batchInsertTool: function (params) {
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
              $('.stk-refresh-btn').trigger('click')
              $('#batch-create-tool-modal').find('.close').click()
            },
          }
        )
      },
      convertLongToTime: function (ms) {
        var seconds = ms / 1000
        var hours = parseInt(seconds / 3600)
        seconds = seconds % 3600
        var minutes = parseInt(seconds / 60)
        seconds = seconds % 60
        return hours + ':' + minutes + ':' + parseInt(seconds)
      },
      convertTimeToSecond: function (time) {
        var timeStr = time.split(':')
        var seconds =
          parseInt(timeStr[0]) * 60 * 60 +
          parseInt(timeStr[1]) * 60 +
          parseInt(timeStr[2])
        return seconds
      },
      getQRCodedocx: function (toolIds) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!toolIds.length) {
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
          $submitForm.append($('<input>').attr('name', 'datas').val(toolIds))
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
      drawToolTable: function () {
        var ctx = this
        if (!ctx.crudToolTable) {
          var crudTable = ctx.$toolTable[0].cloneNode(true)
          ctx.crudToolTable = crudTable
        } else {
          ctx.$toolTableBody.html(ctx.crudToolTable.cloneNode(true))
        }

        servkit.crudtable({
          tableSelector: '#tool-table',
          customBtns: [
            `<button class="btn btn-primary batch-create-tool-modalBtn" data-toggle="modal" data-target="#batch-create-tool-modal">${i18n(
              'Batch_Archiving'
            )}</button>`,
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>" +
              "<span id='msg'><font style='color:" +
              servkit.colors.red +
              "'>N/A為沒有AI model，無法產生分析結果</font></span>",
          ],
          hideCols: [11],
          rightColumn: [5, 6],
          order: [[0, 'asc']],
          create: {
            unavailable: true,
          },
          read: {
            url:
              'api/iiot/tool/management/getTool?startDate=' +
              $('#start-date').val() +
              '&endDate=' +
              $('#end-date').val() +
              '&toolCode=' +
              $('#tool-code').val() +
              '&toolType=' +
              $('#tool-type').val() +
              '&isOpen=' +
              $('input[name="query-enable-radio"]:checked').val(),
            end: {
              6: function (data, rowData) {
                return data == null ? '---' : ctx.getToolLifeRange(data)
              },
              7: function (data, rowData) {
                var toolAnalysis = rowData.tool_analysis
                return toolAnalysis == null
                  ? '---'
                  : ctx.getToolLifeLevel(toolAnalysis)
              },
              9: function (data, rowData) {
                var dataHtml = ''
                _.each(rowData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })
                return (
                  '<a class="tool-used-resume-modal" data-toggle="modal" data-target="#tool-used-resume" href=' +
                  dataHtml +
                  '>' +
                  data +
                  '</a>'
                )
              },
              11: function (data, rowData) {
                if (data == 0) {
                  return '出站'
                } else {
                  return '上機'
                }
              },
              13: function (data, rowData) {
                var dataHtml = ''
                _.each(rowData, (value, key) => {
                  dataHtml += ' data-' + key + '="' + value + '"'
                })

                return (
                  '<button class="btn btn-primary update-tool-btn" data-toggle="modal" data-target="#update-tool-modal"' +
                  dataHtml +
                  '>設定</button>'
                )
              },
            },
            finalDo: function () {
              _.each($('#tool-table').data('crudTable').row()[0], (val) => {
                var $tr = $(
                  $('#tool-table').data('crudTable').row(parseInt(val)).node()
                )
                var useLifeHr = $tr.find(':eq(6)').text() * 60 * 60
                var alarmLifeHr = $tr.find(':eq(7)').text() * 60 * 60
                var workSum = ctx.convertTimeToSecond($tr.find(':eq(8)').text())
                if (useLifeHr - workSum < alarmLifeHr) {
                  $('#tool-table')
                    .data('crudTable')
                    .row(parseInt(val))
                    .node().style.backgroundColor = '#ff99ff'
                }
              })
            },
          },
          update: {
            unavailable: true,
          },
          delete: {},
        })
        $('.stk-delete-btn').hide()
      },
      getToolLifeRange(toolAnalysis) {
        if (toolAnalysis == 'NA') {
          return 'N/A'
        } else {
          return parseFloat(100 - (toolAnalysis * 100) / 8).toFixed(2)
        }
      },
      getToolLifeLevel(toolAnalysis) {
        if (toolAnalysis == '0' || toolAnalysis == '1') {
          return '新刀'
        } else if (toolAnalysis == '8') {
          return '報廢'
        } else if (toolAnalysis == 'NA') {
          return 'N/A'
        } else {
          return '普通'
        }
      },
      tempalteEngine: null,
      toolresumeTableReportTable: null,
      toolresumeTableRenderTable: function (toolId) {
        var ctx = this

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_machine_tool_merge_record',
              columns: [
                'machine_id',
                'nc_name',
                'DATE_FORMAT(work_date,"%Y-%m-%d") AS work_date',
                'tool_no',
                'holder_id',
                'dept_id',
                'tool_id',
                'DATE_FORMAT(work_start_time,"%Y-%m-%d %H:%i:%s") AS work_start_time',
                'DATE_FORMAT(work_end_time,"%Y-%m-%d %H:%i:%s") AS work_end_time',
                'cutting_time',
                'work_barcode',
              ],
              whereClause: 'tool_id = "' + toolId + '"',
            }),
          },
          {
            success: function (data) {
              var result = _.map(data, function (obj) {
                return [
                  ctx.preCon.getMachine[obj.machine_id],
                  obj.nc_name,
                  obj.work_date,
                  obj.tool_no,
                  obj.holder_id,
                  obj.work_start_time,
                  obj.work_end_time,
                  obj.cutting_time,
                  obj.work_barcode == null ? '---' : obj.work_barcode,
                ]
              })
              ctx.toolresumeTableReportTable.drawTable(result)
            },
          }
        )
        ctx.toolresumeTableReportTable
      },
    },
    preCondition: {
      getToolType: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: ['tool_type', 'tool_type'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_type] = elem.tool_type
              })
              done(dataMap)
            },
          }
        )
      },
      getToolCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: ['tool_code', 'tool_code'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_code] = elem.tool_code
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
      getMachine: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.device_name
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

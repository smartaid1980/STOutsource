import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initReportTable()
      context.initDropZone()
      context.initSelect()
      servkit.initDatePicker($('#modify-date'), null, true)
      context.getDemandListData()
      $('#modal-form_id').val(servkit.getURLParameter('formId'))
      servkit.validateForm($('#new-processing-problem'), $('#add-question-btn'))

      // 修改交期之按下確認之後執行的
      servkit.validateForm($('#modify-modal-form'), $('#modify-modal-btn'))
      $('#modify-modal-btn').on('click', function (evt) {
        evt.preventDefault()
        var origDate = $('#st_lead_time .value').text()
        var modifyDate = $('#modify-date').val()
        if (moment(origDate).isSame(modifyDate)) {
          alert(`${i18n('Same_Date_Error_Info')}`)
        } else {
          servkit.ajax(
            {
              url: 'api/feedback/demandlist',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({
                form_id: $('#form_id .value').text(), // 需求單號
                seq_no: $('#seq_no .value').text(), // 序號
                sup_id: servkit.getURLParameter('supId'), // 負責廠商
                st_lead_time: $('#modify-date').val(), // 修改的預交日
                po_check: 'N', // 是否已確認交期
              }),
            },
            {
              success: function () {
                context.getDemandListData()
                $('#modify-modal').modal('hide')
              },
            }
          )
        }
      })

      // 按下修改交期先把日期帶入
      $('#modify-btn').on('click', function (evt) {
        evt.preventDefault()
        var origDate = $('#st_lead_time .value').text()
        $('#origin-date').attr('value', origDate)
      })

      // 按下確認交期只要秀modal就好不要submit
      $('#confirm-btn').on('click', function (evt) {
        evt.preventDefault()
        context.getleadtimelog(true)
      })

      // 確認交期
      $('#ensure-modal-btn').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              form_id: $('#form_id .value').text(), // 需求單號
              seq_no: $('#seq_no .value').text(), // 序號
              sup_id: servkit.getURLParameter('supId'), // 負責廠商
              po_check: 'Y', // 是否已確認交期
            }),
          },
          {
            success: function () {
              context.getDemandListData()
              $('#ensure-modal').modal('hide')
            },
          }
        )
      })

      // 新增加工問題
      $('#add-question-btn').on('click', function (evt) {
        evt.preventDefault()
        var data = {
          form_id: $('#modal-form_id').val(), // 需求單號
          seq_no: servkit.getURLParameter('seqNo'), // 序號
          sup_id: servkit.getURLParameter('supId'), // 負責廠商
          class: $('[name=machining-problemLevel]:checked').val(), // 問題等級
          title: $('#modal-title').val(), // 問題標題
          description: $('#modal-description').val(), // 問題說明
          assign_to: $('#group-select').val(), // [選填沒有就不給]指派給
          is_classified: 'N', // [選填沒有就不給]機密問題
        }
        if (context.preCon.getGroupData.auth.isSupplier) {
          data.assign_to = 'po_group'
        }
        if ($('#isClassified').prop('checked')) {
          data.is_classified = 'Y'
        }
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              var fileLength =
                context.generalDropzone.files.length +
                context.quotationDropzone.files.length
              var uploadLength = 0
              _.each(context.generalDropzone.files, (file) => {
                var formData = new FormData()
                formData.append('qu_id', data)
                formData.append('file', file)
                servkit.ajax(
                  {
                    url: 'api/feedback/demandlist/file/0',
                    type: 'POST',
                    contentType: false,
                    processData: false,
                    data: formData,
                  },
                  {
                    success: function () {
                      uploadLength++
                    },
                  }
                )
              })
              _.each(context.quotationDropzone.files, (file) => {
                var formData = new FormData()
                formData.append('qu_id', data)
                formData.append('file', file)
                servkit.ajax(
                  {
                    url: 'api/feedback/demandlist/file/1',
                    type: 'POST',
                    contentType: false,
                    processData: false,
                    data: formData,
                  },
                  {
                    success: function () {
                      uploadLength++
                    },
                  }
                )
              })
              servkit
                .politeCheck()
                .until(function () {
                  return fileLength === uploadLength
                })
                .thenDo(function () {
                  context.getDemandListData()
                  $('#new-processing-problem-widget').modal('hide')
                })
                .tryDuration(0)
                .start()
            },
            fail: function () {
              alert('create fail!')
            },
          }
        )
      })

      // 當新增加工問題modal要打開時把表單裡的資料重置
      $('#new-processing-problem-widget').on('show.bs.modal', function () {
        $('#new-processing-problem #modal-title').val('')
        $('#new-processing-problem #modal-description').val('')
        $('#group-select').val($('#group-select>option:first').val())
        $('[name=machining-problemLevel][value=1]').prop('checked', true)
        $('#isClassified').prop('checked', false)
        context.generalDropzone.removeAllFiles()
        context.quotationDropzone.removeAllFiles()
      })

      // 取消問題
      $('#cancel-btn').on('click', function () {
        var data = []
        _.each(
          context.attaprocessingProblemReportTable.getSelectedRow(),
          (val) => {
            data.push(val[1].split('">')[1].replace('</a>', ''))
          }
        )
        if (data.length) {
          context.cancelBtn.doing()
          servkit.ajax(
            {
              url: 'api/feedback/demandlist/questions',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({
                status: '2',
                qu_id: data, // 問題編號
              }),
            },
            {
              success: function () {
                context.getDemandListData()
                context.cancelBtn.done()
              },
              fail: function () {
                alert('create fail!')
                context.cancelBtn.done()
              },
            }
          )
        }
      })

      // 關閉問題
      $('#closed-btn').on('click', function () {
        var data = []
        _.each(
          context.attaprocessingProblemReportTable.getSelectedRow(),
          (val) => {
            data.push(val[1].split('">')[1].replace('</a>', ''))
          }
        )
        if (data.length) {
          context.closedBtn.doing()
          servkit.ajax(
            {
              url: 'api/feedback/demandlist/questions',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({
                status: '3',
                qu_id: data, // 問題編號
              }),
            },
            {
              success: function () {
                context.getDemandListData()
                context.closedBtn.done()
              },
              fail: function () {
                alert('create fail!')
                context.closedBtn.done()
              },
            }
          )
        }
      })

      // 交期修改紀錄
      $('#date-record-btn').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url:
              'api/feedback/demandlist/leadtimelog/' +
              servkit.getURLParameter('formId'),
            type: 'GET',
            data: {
              // form_id: servkit.getURLParameter('formId'), // 需求單號
              seq_no: servkit.getURLParameter('seqNo'), // 序號
              sup_id: servkit.getURLParameter('supId'), // 負責廠商
            },
          },
          {
            success: function (data) {
              context.modifyDeliveryDateRenderTable(data)
            },
            fail: function () {
              alert('create fail!')
            },
          }
        )
      })

      // 加工問題
      $('#processing-problem').on('click', '.process-detail', function (evt) {
        evt.preventDefault()
        var lang = servkit.getCookie('lang')
        window.sessionStorage.setItem(
          'demandLidtDetail',
          location.hash.split('.html')[1]
        )
        window.location =
          '#app/FeedbackDemandListManagement/function/' +
          lang +
          '/12_processing_problem.html?quId=' +
          $(this).data('qu_id')
      })

      // 檔案附件
      $('#attachment').on(
        'click',
        '.download-file, .download-history, .process-detail',
        function (evt) {
          evt.preventDefault()
          if ($(this).hasClass('download-file')) {
            context.downloadFile(
              $(this).data('file_id'),
              $(this).data('file_name'),
              $(this).data('file_path')
            )
          } else if ($(this).hasClass('download-history')) {
            context.getDownloadHistoryData($(this).data('file_id'))
          } else {
            var lang = servkit.getCookie('lang')
            window.sessionStorage.setItem(
              'demandLidtDetail',
              location.hash.split('.html')[1]
            )
            window.location =
              '#app/FeedbackDemandListManagement/function/' +
              lang +
              '/12_processing_problem.html?quId=' +
              $(this).data('qu_id')
          }
        }
      )

      // 報價附件
      $('#quote-attachment').on(
        'click',
        '.download-file, .download-history, .process-detail',
        function (evt) {
          evt.preventDefault()
          if ($(this).hasClass('download-file')) {
            context.downloadFile(
              $(this).data('file_id'),
              $(this).data('file_name'),
              $(this).data('file_path')
            )
          } else if ($(this).hasClass('download-history')) {
            context.getDownloadHistoryData($(this).data('file_id'))
          } else {
            var lang = servkit.getCookie('lang')
            window.sessionStorage.setItem(
              'demandLidtDetail',
              location.hash.split('.html')[1]
            )
            window.location =
              '#app/FeedbackDemandListManagement/function/' +
              lang +
              '/12_processing_problem.html?quId=' +
              $(this).data('qu_id')
          }
        }
      )

      // 回上一頁
      $('#leave-btn').on('click', function () {
        var lang = servkit.getCookie('lang')
        window.location =
          '#app/FeedbackDemandListManagement/function/' +
          lang +
          '/10_search_demandlist.html'
      })
    },
    util: {
      generalDropzone: null,
      quotationDropzone: null,
      cancelBtn: null,
      closedBtn: null,
      init: true,
      getDemandListData: function () {
        var ctx = this
        $('.stk-all-checkbox').prop('checked', false)
        ctx.getleadtimelog()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist',
            type: 'GET',
            data: {
              form_id: servkit.getURLParameter('formId'), // 需求單號
              seq_no: servkit.getURLParameter('seqNo'), // 序號
              sup_id: servkit.getURLParameter('supId'), // 負責廠商
            },
          },
          {
            success: function (data) {
              if (ctx.init) {
                ctx.initFunctionSetting(Object.keys(data).length)
              }
              _.each(data, (val, key) => {
                if (key === 'files') {
                  var groupData = _.groupBy(val, function (d) {
                    return d.file_type
                  })
                  ctx.attachmentRenderTable(groupData['0'])
                  ctx.quoteAttachmentRenderTable(groupData['1'])
                } else if (key === 'items') {
                  ctx.materialInformationRenderTable(val)
                } else if (key === 'suppliers') {
                  ctx.supplierInformationRenderTable(val)
                } else if (key === 'questions') {
                  ctx.attaprocessingProblemRenderTable(val)
                } else if (key === 'form_type') {
                  var formTypeList = {
                    '0': `${i18n('Purchase_Order')}`,
                    '1': `${i18n('Inquiry_Order')}`,
                  }
                  $('#' + key)
                    .find('.value')
                    .html(val ? formTypeList[val] : '---')
                } else if (key === 'is_close') {
                  if (val === 'N') {
                    $('#' + key)
                      .find('.value')
                      .html(`${i18n('Unfinished')}`)
                  } else if (val === 'Y') {
                    $('#' + key)
                      .find('.value')
                      .html(`${i18n('Closed_Case')}`)
                    $('#processing-problem_wrapper .dt-toolbar').addClass(
                      'hide'
                    )
                    $('#modify-btn').addClass('hide')
                  }
                } else if (key === 'create_by') {
                  $('#' + key)
                    .find('.value')
                    .html(
                      val
                        ? val +
                            '(' +
                            (ctx.preCon.getUserName[val] || '---') +
                            ')'
                        : '---'
                    )
                } else if (key === 'modify_by') {
                  $('#' + key)
                    .find('.value')
                    .html(
                      val
                        ? val +
                            '(' +
                            (ctx.preCon.getUserName[val] || '---') +
                            ')'
                        : '---'
                    )
                } else {
                  $('#' + key)
                    .find('.value')
                    .html(val || '---')
                  if (key === 'assign_to') {
                    $('#group-select').val(val)
                  } else if (key === 'status') {
                    $('#status-select').val(val)
                  }
                }
              })
              if (
                data.is_close === 'Y' &&
                !ctx.preCon.getGroupData.auth.isSupplier
              ) {
                $('#processing-problem tr')
                  .find('th:eq(0), td:eq(0)')
                  .addClass('hide')
              }
            },
            fail: function () {
              alert('no data!')
            },
          }
        )
      },
      getleadtimelog: function (showModal) {
        servkit.ajax(
          {
            url:
              'api/feedback/demandlist/leadtimelog/' +
              servkit.getURLParameter('formId'),
            type: 'GET',
            data: {
              // form_id: servkit.getURLParameter('formId'), // 需求單號
              seq_no: servkit.getURLParameter('seqNo'), // 序號
              sup_id: servkit.getURLParameter('supId'), // 負責廠商
            },
          },
          {
            success: function (data) {
              var thisData
              _.each(data, (val) => {
                if (
                  !thisData ||
                  moment(thisData.create_time).isBefore(
                    val.create_time,
                    'second'
                  )
                ) {
                  thisData = val
                }
              })
              $('#ensure-original-date').val(
                thisData && thisData.orig_lead_time
                  ? moment(thisData.orig_lead_time, 'MMMM Do YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : '---'
              )
              $('#ensure-date').val(
                thisData && thisData.chg_lead_time
                  ? moment(thisData.chg_lead_time, 'MMMM Do YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : '---'
              )
              if (thisData && thisData.chg_lead_time && !thisData.check_time) {
                $('#confirm-btn').attr('disabled', false)
                if (showModal) {
                  $('#ensure-modal').modal('show')
                }
              }
            },
          }
        )
      },
      materialInformationReportTable: null,
      materialInformationRenderTable: function (data) {
        // 料件資訊
        var ctx = this
        ctx.materialInformationReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.item_id || '---',
              val.item_name || '---',
              val.item_spec || '---',
              val.po_qty || '---',
              val.unit || '---',
            ]
          })
        )
      },
      attaprocessingProblemReportTable: null,
      attaprocessingProblemRenderTable: function (data) {
        // 加工問題
        var ctx = this
        var statusList = {
          '0': `${i18n('New_Problem')}`,
          '1': `${i18n('Processing')}`,
          '2': `${i18n('Cancelled')}`,
          '3': `${i18n('Closed')}`,
        }
        // var classMap = {
        //   '0': '一般',
        //   '1': '緊急'
        // }
        ctx.attaprocessingProblemReportTable.drawTable(
          _.map(data, (val) => {
            var statusString = '---'
            // var classString = '---'
            if (val.status) {
              statusString = statusList[val.status]
            }
            // if (val.class) {
            //   classString = val.class === '1' ? '<span style="color:red;">' + classMap[val.class] + '</span>' : classMap[val.class]
            // }
            return [
              val.class || '---', // 問題等級
              val.qu_id
                ? '<a href="javascript:void(0);" class="process-detail" data-qu_id="' +
                  val.qu_id +
                  '">' +
                  val.qu_id +
                  '</a>'
                : '---', // 問題編號
              val.title || '---', // 問題標題
              statusString, // 問題狀態
              val.create_time
                ? moment(val.create_time).format('YYYY/MM/DD HH:mm:ss')
                : '---', // 問題發起時間
              val.create_by
                ? val.create_by +
                  '(' +
                  (ctx.preCon.getUserName[val.create_by] || '---') +
                  ')'
                : '---', // 問題發起人
            ]
          })
        )
      },
      attachmentReportTable: null,
      attachmentRenderTable: function (data) {
        // 檔案附件
        var ctx = this
        ctx.attachmentReportTable.drawTable(
          _.map(data, (val) => {
            return [
              '<a href="javascript:void(0);" class="download-file" data-file_id="' +
                val.file_id +
                '" data-file_name="' +
                val.file_name +
                '" data-file_path="' +
                val.file_path +
                '">' +
                val.file_name +
                '</a>',
              val.file_path || '---',
              val.qu_id
                ? '<a href="javascript:void(0);" class="process-detail" data-qu_id="' +
                  val.qu_id +
                  '">' +
                  val.qu_id +
                  '</a>'
                : '---',
              val.upload_time
                ? moment(val.upload_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.upload_by
                ? val.upload_by +
                  '(' +
                  (ctx.preCon.getUserName[val.upload_by] || '---') +
                  ')'
                : '---',
              '<a href="javascript:void(0);" class="download-history" data-file_id="' +
                val.file_id +
                `">${i18n('Download_Record')}</a>`,
            ]
          })
        )
      },
      quoteAttachmentReportTable: null,
      quoteAttachmentRenderTable: function (data) {
        // 報價附件
        var ctx = this
        ctx.quoteAttachmentReportTable.drawTable(
          _.map(data, (val) => {
            return [
              '<a href="javascript:void(0);" class="download-file" data-file_id="' +
                val.file_id +
                '" data-file_name="' +
                val.file_name +
                '" data-file_path="' +
                val.file_path +
                '">' +
                val.file_name +
                '</a>',
              val.file_path || '---',
              val.qu_id
                ? '<a href="javascript:void(0);" class="process-detail" data-qu_id="' +
                  val.qu_id +
                  '">' +
                  val.qu_id +
                  '</a>'
                : '---',
              val.upload_time
                ? moment(val.upload_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.upload_by
                ? val.upload_by +
                  '(' +
                  (ctx.preCon.getUserName[val.upload_by] || '---') +
                  ')'
                : '---',
              '<a href="javascript:void(0);" class="download-history" data-file_id="' +
                val.file_id +
                `">${i18n('Download_Record')}</a>`,
            ]
          })
        )
      },
      downloadFileReportTable: null,
      downloadFileRenderTable: function (data) {
        // 下載紀錄
        var ctx = this
        ctx.downloadFileReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.file_name || '---',
              val.download_time
                ? moment(val.download_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.download_by
                ? val.download_by +
                  '(' +
                  (ctx.preCon.getUserName[val.download_by] || '---') +
                  ')'
                : '---',
            ]
          })
        )
      },
      modifyDeliveryDateReportTable: null,
      modifyDeliveryDateRenderTable: function (data) {
        // 交期修改紀錄
        var ctx = this
        ctx.modifyDeliveryDateReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.form_id || '---', // 需求單號
              val.seq_no || '---', // 序號
              val.create_time
                ? moment(val.create_time).format('YYYY/MM/DD HH:mm:ss')
                : '---', // 異動時間
              val.orig_lead_time
                ? moment(val.orig_lead_time, 'MMMM Do YYYY').format(
                    'YYYY/MM/DD'
                  )
                : '---', // 異動前預交日
              val.chg_lead_time
                ? moment(val.chg_lead_time, 'MMMM Do YYYY').format('YYYY/MM/DD')
                : '---', // 異動後預交日
              val.create_by
                ? val.create_by +
                  '(' +
                  (ctx.preCon.getUserName[val.create_by] || '---') +
                  ')'
                : '---', // 異動人
              val.check_time
                ? moment(val.check_time).format('YYYY/MM/DD HH:mm:ss')
                : '---', // 確認交期時間
              val.check_by
                ? val.check_by +
                  '(' +
                  (ctx.preCon.getUserName[val.check_by] || '---') +
                  ')'
                : '---', // 確認交期人
            ]
          })
        )
      },
      supplierInformationReportTable: null,
      supplierInformationRenderTable: function (data) {
        // 供應商資訊
        var ctx = this
        ctx.supplierInformationReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.sup_name || '---', // 公司名稱
              val.manager || '---', // 負責人
              val.contact || '---', // 聯絡人
              val.tel1 || '---', // TEL(一)
              val.tel2 || '---', // TEL(二)
              val.fax_no || '---', // FAX NO.
              val.email || '---', // EMAIL
              val.address || '---', // 聯絡地址
            ]
          })
        )
      },
      getDownloadHistoryData: function (fileId) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions/filelog',
            type: 'GET',
            data: {
              file_id: fileId, // 附檔ID
            },
          },
          {
            success: function (data) {
              ctx.downloadFileRenderTable(data)
              $('#download-history-modal').modal('show')
            },
            fail: function () {
              ctx.downloadFileRenderTable([])
              $('#download-history-modal').modal('show')
            },
          }
        )
      },
      downloadFile: function (fileId, fileName, filePath) {
        servkit.downloadFile(
          '#print',
          '/api/feedback/demandlist/file/' + fileId,
          function () {
            return {
              file_name: fileName, // 檔案名稱
              file_path: filePath, // 檔案路徑
            }
          },
          'get'
        )
        $('#print').trigger('click')
      },
      initReportTable: function () {
        var ctx = this
        // 料件資訊
        ctx.materialInformationReportTable = createReportTable({
          $tableElement: $('#material-information'),
          $tableWidget: $('#material-information-widget'),
          showNoData: false,
        })

        // 加工問題
        var attaprocessingProblemConfig = {
          $tableElement: $('#processing-problem'),
          $tableWidget: $('#processing-problem-widget'),
          customBtns: [
            `<button id="add-new-problem" class="btn margin-right-10 btn-primary" data-toggle="modal" data-target="#new-processing-problem-widget">${i18n(
              'Create_Problem'
            )}</button>`,
          ],
          showNoData: false,
          order: [[0, 'desc']],
          onRow: function (row, data) {
            var column = 1
            if (ctx.preCon.getGroupData.auth.isSupplier) {
              column = 0
            }
            if (data[0] === '0') {
              $(row)
                .find('td:eq(' + column + ')')
                .html(`${i18n('General')}`)
            } else if (data[0] === '1') {
              $(row)
                .find('td:eq(' + column + ')')
                .css('color', 'red')
              $(row)
                .find('td:eq(' + column + ')')
                .html(`${i18n('Urgent')}`)
            }
          },
        }
        if (!ctx.preCon.getGroupData.auth.isSupplier) {
          attaprocessingProblemConfig.checkbox = true
          attaprocessingProblemConfig.customBtns.push(
            `<button id="cancel-btn" class="btn margin-right-10 btn-warning">${i18n(
              'Cancel_Problem'
            )}</button>`
          )
          attaprocessingProblemConfig.customBtns.push(
            `<button id="closed-btn" class="btn margin-right-10 btn-success">${i18n(
              'Close_Problem'
            )}</button>`
          )
        }
        ctx.attaprocessingProblemReportTable = createReportTable(
          attaprocessingProblemConfig
        )
        $('#processing-problem-widget .dt-toolbar').addClass('hide')
        if (!ctx.preCon.getGroupData.auth.isSupplier) {
          $('#processing-problem tr').find('th:eq(0)').addClass('hide')
          ctx.cancelBtn = servkit.loadingButton(
            document.querySelector('#cancel-btn')
          )
          ctx.closedBtn = servkit.loadingButton(
            document.querySelector('#closed-btn')
          )
        }

        // 檔案附件
        ctx.attachmentReportTable = createReportTable({
          $tableElement: $('#attachment'),
          $tableWidget: $('#attachment-widget'),
          showNoData: false,
        })

        // 報價附件
        ctx.quoteAttachmentReportTable = createReportTable({
          $tableElement: $('#quote-attachment'),
          $tableWidget: $('#quote-attachment-widget'),
          showNoData: false,
        })

        // 供應商資訊
        ctx.supplierInformationReportTable = createReportTable({
          $tableElement: $('#supplier-information'),
          $tableWidget: $('#supplier-information-widget'),
          showNoData: false,
        })

        // 交期修改紀錄
        ctx.modifyDeliveryDateReportTable = createReportTable({
          $tableElement: $('#modify-delivery-date'),
          $tableWidget: $('#modify-delivery-date-widget'),
          showNoData: false,
        })

        // 下載紀錄
        ctx.downloadFileReportTable = createReportTable({
          $tableElement: $('#download-history'),
          $tableWidget: $('#download-history-widget'),
          showNoData: false,
        })
      },
      initDropZone: function () {
        var ctx = this
        $('div#upload-general-file')
          .addClass('dropzone dropzone-v15')
          .dropzone({
            url: '/',
            addRemoveLinks: true, // 增加刪除紐
            uploadMultiple: true, // 多文件上傳
            autoProcessQueue: false, // 自動上傳
            parallelUploads: 100, // means that they shouldn't be split up in chunks as well
            maxFiles: 100, // to make sure that the user doesn't drop more files than allowed in one request.
            init: function () {
              ctx.generalDropzone = this
            },
          })
        $('div#upload-quotation-file')
          .addClass('dropzone dropzone-v15')
          .dropzone({
            url: '/',
            addRemoveLinks: true, // 增加刪除紐
            uploadMultiple: true, // 多文件上傳
            autoProcessQueue: false, // 自動上傳
            parallelUploads: 100, // means that they shouldn't be split up in chunks as well
            maxFiles: 100, // to make sure that the user doesn't drop more files than allowed in one request.
            init: function () {
              ctx.quotationDropzone = this
            },
          })
      },
      initSelect: function () {
        var groupData = JSON.parse(
          JSON.stringify(this.preCon.getGroupData.group)
        )
        var sup_id = servkit.getURLParameter('supId')
        groupData[sup_id] = this.preCon.getManufacturerData[sup_id]
        servkit.initSelectWithList(groupData, $('#group-select'))
      },
      initFunctionSetting: function (dataLength) {
        if (dataLength) {
          $('#demand-list-information-widget footer').removeClass('hide')
          $('#processing-problem-widget .dt-toolbar').removeClass('hide')
          if (!this.preCon.getGroupData.auth.isSupplier) {
            $('#processing-problem tr').find('th:eq(0)').removeClass('hide')
          }
        }

        if (
          this.preCon.getGroupData.auth.isSupplier ||
          this.preCon.getGroupData.auth.isHighest
        ) {
          // 如果是供應商
          $('#modify-btn').removeClass('hide') // 顯示修改交期
          $('#group-select').closest('tr').addClass('hide') // 隱藏新增加工問題modal的指派選項
          this.attachmentReportTable.table.column(1).visible(false) // 隱藏檔案附件table路徑欄位
          this.quoteAttachmentReportTable.table.column(1).visible(false) // 隱藏報價附件table路徑欄位
        }
        if (
          this.preCon.getGroupData.auth.isPurchase ||
          this.preCon.getGroupData.auth.isHighest
        ) {
          // 如果是採購
          $('#confirm-btn').removeClass('hide') // 顯示確認交期
        }
        if (
          this.preCon.getGroupData.auth.isPurchase ||
          this.preCon.getGroupData.auth.isSupplier ||
          this.preCon.getGroupData.auth.isHighest
        ) {
          // 報價附件表格, 下載紀錄
          $('#quote-attachment').closest('article').removeClass('hide')
        }
        if (
          this.preCon.getGroupData.auth.isConfidential ||
          this.preCon.getGroupData.auth.isHighest
        ) {
          // 機密問題checkbox
          $('#isClassified').closest('.pull-right').removeClass('hide')
        }

        if (servtechConfig.ST_CUSTOMER === 'Huangliang') {
          // 如果是皇亮
          $('#orig_lead_time').addClass('hide') // 隱藏原預交日
          $('#orig_lead_time').prev().addClass('hide') // 隱藏原預交日label
          $('#cfm_lead_time').addClass('hide') // 隱藏交期確認日
          $('#cfm_lead_time').prev().addClass('hide') // 隱藏交期確認日label
          $('#confirm-btn').addClass('hide') // 隱藏確認交期
          $('#material-information-widget').closest('article').addClass('hide') // 隱藏料件資訊表格
          this.attachmentReportTable.table.column(1).visible(false) // 隱藏檔案附件表格的檔案路徑
          this.quoteAttachmentReportTable.table.column(1).visible(false) // 隱藏報價附件表格的檔案路徑
          $('#supplier-information-widget').closest('article').addClass('hide') // 隱藏料件資訊表格
          this.modifyDeliveryDateReportTable.table.column(6).visible(false) // 隱藏交期修改紀錄表格的確認交期時間
          this.modifyDeliveryDateReportTable.table.column(7).visible(false) // 隱藏交期修改紀錄表格的確認交期人
        }
        this.init = false
      },
    },
    preCondition: {
      getUserName: function (done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.module.model.SysUser',
            },
          },
          {
            success: function (data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
            },
          }
        )
      },
      getManufacturerData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_feedback_supplier',
              columns: ['sup_id', 'sup_shortname'],
            }),
          },
          {
            success: function (data) {
              var manufacturerData = {}
              _.each(data, function (elem) {
                manufacturerData[elem.sup_id] = elem.sup_shortname
              })
              done(manufacturerData)
            },
          }
        )
      },
      getGroupData: function (done) {
        this.commons.getGroupData(done)
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
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}

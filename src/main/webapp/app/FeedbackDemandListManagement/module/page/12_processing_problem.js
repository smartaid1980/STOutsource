import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initReportTable()

      context.initSelect()
      context.initDropZone()
      context.getQuestionsDetail()
      servkit.validateForm($('#problem-response'), $('#problem-response-btn'))

      // 指派給
      $('#assigned-to').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              qu_id: [servkit.getURLParameter('quId')], // 問題編號
              assign_to: $('#group-select').val(), // 目前被指派群組
            }),
          },
          {
            success: function () {
              context.getQuestionsDetail('assignedToBtn')
            },
          }
        )
      })
      // 變更狀態
      $('#change-status').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              status: $('#status-select').val(), // 問題狀態(0:新問題, 1:進行中, 2:取消, 3:關閉)
              qu_id: [servkit.getURLParameter('quId')], // 問題編號
            }),
          },
          {
            success: function () {
              context.getQuestionsDetail('changeStatusBtn')
            },
          }
        )
      })
      // 標註為機密文件
      $('#mark-as-confidential').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              qu_id: [servkit.getURLParameter('quId')], // 問題編號
              is_classified: 'Y', // 機密文件
            }),
          },
          {
            success: function () {
              context.getQuestionsDetail('markAsConfidentialBtn')
            },
          }
        )
      })

      // 回覆問題
      $('#problem-response-btn').on('click', function (evt) {
        evt.preventDefault()
        var fileLength =
          context.generalDropzone.files.length +
          context.quotationDropzone.files.length
        var replyContent = $('#reply-content').val()
        replyContent = replyContent.replace(/^[\u3000|\u0020]*$/g, '') // 過濾全型和半型空白
        if (fileLength || replyContent) {
          context.problemResponseBtn.doing()
          if (context.preCon.getGroupData.auth.isSupplier) {
            var assignTo = 'po_group'
            if (
              context.assign_to ===
                JSON.parse(window.sessionStorage.getItem('loginInfo'))
                  .user_group[0] &&
              context.prev_assign_to
            ) {
              assignTo = context.prev_assign_to
            }
            if (context.isClassified) {
              assignTo = 'classified_group'
            }
            servkit.ajax(
              {
                url: 'api/feedback/demandlist/questions',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                  qu_id: [servkit.getURLParameter('quId')], // 問題編號
                  assign_to: assignTo, // 目前被指派群組
                }),
              },
              {
                success: function () {
                  context.insertReplyOrFile(fileLength, replyContent)
                },
              }
            )
          } else {
            context.insertReplyOrFile(fileLength, replyContent)
          }
        }
      })

      // 下載檔案, 下載紀錄
      $('#attachment').on(
        'click',
        '.download-file, .download-history',
        function (evt) {
          evt.preventDefault()
          if ($(this).hasClass('download-file')) {
            context.downloadFile(
              $(this).data('file_id'),
              $(this).data('file_name'),
              $(this).data('file_path')
            )
          } else {
            context.getDownloadHistoryData($(this).data('file_id'))
          }
        }
      )
      $('#quote-attachment').on(
        'click',
        '.download-file, .download-history',
        function (evt) {
          evt.preventDefault()
          if ($(this).hasClass('download-file')) {
            context.downloadFile(
              $(this).data('file_id'),
              $(this).data('file_name'),
              $(this).data('file_path')
            )
          } else {
            context.getDownloadHistoryData($(this).data('file_id'))
          }
        }
      )

      // 回上一頁
      $('#leave-btn').on('click', function () {
        var lang = servkit.getCookie('lang')
        var detail = ''
        if (context.formId && context.seqNo && context.supId) {
          detail =
            '?formId=' +
            context.formId +
            '&seqNo=' +
            context.seqNo +
            '&supId=' +
            context.supId
        } else if (window.sessionStorage.getItem('demandLidtDetail')) {
          detail = window.sessionStorage.getItem('demandLidtDetail')
        }
        window.location =
          '#app/FeedbackDemandListManagement/function/' +
          lang +
          '/11_demandlist_detail.html' +
          detail
      })
    },
    util: {
      generalDropzone: null,
      quotationDropzone: null,
      hasInitSelect: false,
      assign_to: null,
      prev_assign_to: null,
      fileNameMap: {},
      replyContentMap: {},
      init: true,
      isClassified: false,
      formId: null,
      seqNo: null,
      supId: null,
      assignedToBtn: servkit.loadingButton(
        document.querySelector('#assigned-to')
      ),
      changeStatusBtn: servkit.loadingButton(
        document.querySelector('#change-status')
      ),
      markAsConfidentialBtn: servkit.loadingButton(
        document.querySelector('#mark-as-confidential')
      ),
      problemResponseBtn: servkit.loadingButton(
        document.querySelector('#problem-response-btn')
      ),
      insertReplyOrFile: function (fileLength, replyContent) {
        var ctx = this
        var quId = $('#qu_id .value').text()
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions/reply',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              qu_id: quId, // 問題編號
              content: replyContent, // 回覆內容
            }),
          },
          {
            success: function () {
              var uploadLength = 0
              if (fileLength) {
                _.each(ctx.generalDropzone.files, (file) => {
                  var formData = new FormData()
                  formData.append('qu_id', quId)
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
                _.each(ctx.quotationDropzone.files, (file) => {
                  var formData = new FormData()
                  formData.append('qu_id', quId)
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
              }
              servkit
                .politeCheck()
                .until(function () {
                  return fileLength === uploadLength
                })
                .thenDo(function () {
                  $('#reply-content').val('') // 清空回覆內容
                  ctx.generalDropzone.removeAllFiles()
                  ctx.quotationDropzone.removeAllFiles()
                  ctx.getQuestionsDetail('problemResponseBtn')
                })
                .tryDuration(0)
                .start()
            },
            fail: function () {
              alert('create fail!')
            },
          }
        )
      },
      getQuestionsDetail: function (btnStr) {
        var ctx = this
        if (btnStr) {
          ctx[btnStr].doing()
        }
        servkit.ajax(
          {
            url: 'api/feedback/demandlist/questions',
            type: 'GET',
            data: {
              qu_id: servkit.getURLParameter('quId'), // 加工問題編號
            },
          },
          {
            success: function (data) {
              if (ctx.init) {
                ctx.initFunctionSetting(Object.keys(data).length, data.form_id)
              }
              ctx.formId = data.form_id
              ctx.seqNo = data.seq_no
              ctx.supId = data.sup_id
              _.each(data, (val, key) => {
                if (key === 'replys') {
                  ctx.problemResponseRecordRenderTable(val)
                } else if (key === 'files') {
                  var groupData = _.groupBy(val, function (d) {
                    return d.file_type
                  })
                  ctx.attachmentRenderTable(groupData['0'])
                  ctx.quoteAttachmentRenderTable(groupData['1'])
                } else if (key === 'logs') {
                  ctx.problemProcessingRecordRenderTable(val)
                } else {
                  if (key === 'class') {
                    var classMap = {
                      '0': `${i18n('General')}`,
                      '1': `${i18n('Urgent')}`,
                    }
                    $('#' + key)
                      .find('.value')
                      .html(val ? classMap[val] : '---')
                  } else if (key === 'status') {
                    var statusMap = {
                      '0': `${i18n('New_Problem')}`,
                      '1': `${i18n('Processing')}`,
                      '2': `${i18n('Cancelled')}`,
                      '3': `${i18n('Closed')}`,
                    }
                    $('#' + key)
                      .find('.value')
                      .html(val ? statusMap[val] : '---')
                  } else if (key === 'assign_to' || key === 'prev_assign_to') {
                    var assign = '---'
                    if (val) {
                      if (ctx.preCon.getGroupData.supplireGroup[val]) {
                        assign =
                          ctx.preCon.getGroupData.supplireGroup[val] || '---'
                      } else {
                        assign = ctx.preCon.getGroupData.group[val] || '---'
                      }
                    }
                    $('#' + key)
                      .find('.value')
                      .html(assign)
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
                  } else if (key === 'is_classified') {
                    if (val === 'Y') {
                      ctx.isClassified = true
                      if (btnStr === 'markAsConfidentialBtn') {
                        servkit
                          .politeCheck()
                          .until(function () {
                            return !$('#mark-as-confidential').attr('disabled')
                          })
                          .thenDo(function () {
                            $('#mark-as-confidential').attr(
                              'disabled',
                              'disabled'
                            )
                          })
                          .tryDuration(0)
                          .start()
                      } else {
                        $('#mark-as-confidential').attr('disabled', 'disabled')
                      }
                    }
                  } else {
                    $('#' + key)
                      .find('.value')
                      .html(val || '---')
                  }
                }
              })

              // 繪製指派群組下拉式選單
              var groupMap = JSON.parse(
                JSON.stringify(ctx.preCon.getGroupData.group)
              )
              if (data.sup_id) {
                groupMap[data.sup_id] =
                  ctx.preCon.getManufacturerData[data.sup_id]
              }
              servkit.initSelectWithList(groupMap, $('#group-select'))
              // 改變指派給為目前被指派的群組
              $('#group-select').val(data.assign_to)
              // 改變變更狀態為目前狀態
              $('#status-select').val(data.status)

              ctx.assign_to = data.assign_to
              ctx.prev_assign_to = data.prev_assign_to

              if (btnStr) {
                ctx[btnStr].done()
              }
            },
            fail: function () {
              alert('no data!')
              if (btnStr) {
                ctx[btnStr].done()
              }
            },
          }
        )
      },
      problemResponseRecordReportTable: null,
      problemResponseRecordRenderTable: function (data) {
        // 問題回覆紀錄
        var ctx = this
        ctx.problemResponseRecordReportTable.drawTable(
          _.map(data, (val) => {
            ctx.replyContentMap[val.reply_id] = val.content
            return [
              val.reply_time
                ? moment(val.reply_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.reply_by
                ? val.reply_by +
                  '(' +
                  (ctx.preCon.getUserName[val.reply_by] || '---') +
                  ')'
                : '---',
              val.content || '---',
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
            ctx.fileNameMap[val.file_id] = val.file_name
            return [
              val.file_name
                ? '<a href="javascript:void(0);" class="download-file" data-file_id="' +
                  val.file_id +
                  '" data-file_name="' +
                  val.file_name +
                  '" data-file_path="' +
                  val.file_path +
                  '">' +
                  val.file_name +
                  '</a>'
                : '---',
              val.file_path || '---',
              val.qu_id || '---',
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
            ctx.fileNameMap[val.file_id] = val.file_name
            return [
              val.file_name
                ? '<a href="javascript:void(0);" class="download-file" data-file_id="' +
                  val.file_id +
                  '" data-file_name="' +
                  val.file_name +
                  '" data-file_path="' +
                  val.file_path +
                  '">' +
                  val.file_name +
                  '</a>'
                : '---',
              val.file_path || '---',
              val.qu_id || '---',
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
      problemProcessingRecordReportTable: null,
      problemProcessingRecordRenderTable: function (data) {
        // 問題處理紀錄
        var ctx = this
        var statusMap = {
          '0': `${i18n('Create_Problem')}`,
          '1': `${i18n('Change_Status')}`,
          '2': `${i18n('Portion_To')}`,
          '3': `${i18n('Add_File')}`,
          '4': `${i18n('Create_Reply')}`,
          '5': `${i18n('Confidential')}`,
        }
        var changeStatusMap = {
          '0': `${i18n('New_Problem')}`,
          '1': `${i18n('Processing')}`,
          '2': `${i18n('Cancelled')}`,
          '3': `${i18n('Closed')}`,
        }
        ctx.problemProcessingRecordReportTable.drawTable(
          _.map(data, (val) => {
            var statusString = '---'
            if (val.process_status) {
              statusString = statusMap[val.process_status]
            }
            if (val.assignment) {
              switch (val.process_status) {
                case '1':
                  statusString += '：' + changeStatusMap[val.assignment]
                  break
                case '2':
                  var assign = '---'
                  if (val.assignment) {
                    if (ctx.preCon.getGroupData.supplireGroup[val.assignment]) {
                      assign =
                        ctx.preCon.getGroupData.supplireGroup[val.assignment] ||
                        '---'
                    } else {
                      assign =
                        ctx.preCon.getGroupData.group[val.assignment] || '---'
                    }
                  }
                  statusString += '：' + assign
                  break
                case '3':
                  statusString +=
                    '：' + (ctx.fileNameMap[val.assignment] || val.assignment)
                  break
                case '4':
                  statusString +=
                    '：' +
                    (ctx.replyContentMap[val.assignment] || val.assignment)
                  break
                default:
                  break
              }
            }
            return [
              val.process_time
                ? moment(val.process_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.process_by
                ? val.process_by +
                  '(' +
                  (ctx.preCon.getUserName[val.process_by] || '---') +
                  ')'
                : '---',
              statusString || '---',
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
        // 問題回覆紀錄
        this.problemResponseRecordReportTable = createReportTable({
          $tableElement: $('#problem-response-record'),
          $tableWidget: $('#problem-response-record-widget'),
          showNoData: false,
        })

        // 檔案附件
        this.attachmentReportTable = createReportTable({
          $tableElement: $('#attachment'),
          $tableWidget: $('#attachment-widget'),
          showNoData: false,
        })

        // 報價附件
        this.quoteAttachmentReportTable = createReportTable({
          $tableElement: $('#quote-attachment'),
          $tableWidget: $('#quote-attachment-widget'),
          showNoData: false,
        })

        // 問題處理紀錄
        this.problemProcessingRecordReportTable = createReportTable({
          $tableElement: $('#problem-processing-record'),
          $tableWidget: $('#problem-processing-record-widget'),
          showNoData: false,
        })

        // 下載紀錄
        this.downloadFileReportTable = createReportTable({
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
        var html = []
        var data = {
          '0': `${i18n('New_Problem')}`,
          '1': `${i18n('Processing')}`,
          '2': `${i18n('Cancelled')}`,
          '3': `${i18n('Closed')}`,
        }
        _.each(data, (elem, key) => {
          html.push(
            '<option style="padding:3px 0 3px 3px;" value="' +
              key +
              '">' +
              elem +
              '</option>'
          )
        })
        $('#status-select').html(html.join(''))
      },
      initFunctionSetting: function (dataLength, formId) {
        var ctx = this
        if (dataLength) {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_feedback_demand_list',
                columns: ['is_close'],
                whereClause: `form_id='${formId}'`,
              }),
            },
            {
              success: function (data) {
                if (data[0].is_close === 'Y') {
                  if (
                    ctx.preCon.getGroupData.auth.isConfidential ||
                    ctx.preCon.getGroupData.auth.isHighest
                  ) {
                    // 機密問題按鈕
                    $('#change-assign-status').addClass('hide')
                  } else {
                    $('#questions-form footer').addClass('hide')
                  }
                  $('#problem-response').closest('article').addClass('hide')
                }
              },
            }
          )
          if (!ctx.preCon.getGroupData.auth.isSupplier) {
            $('#questions-form footer').removeClass('hide')
          }
          $('#leave-btn').removeClass('hide')
        } else {
          $('#problem-response').closest('article').addClass('hide')
        }

        if (ctx.preCon.getGroupData.auth.isSupplier) {
          // 指派給按鈕, 變更狀態按鈕, 檔案路徑
          $('#change-assign-status').addClass('hide')
          ctx.attachmentReportTable.table.column(1).visible(false)
          ctx.quoteAttachmentReportTable.table.column(1).visible(false)
        }

        if (
          ctx.preCon.getGroupData.auth.isConfidential ||
          ctx.preCon.getGroupData.auth.isHighest
        ) {
          // 機密問題按鈕
          $('#mark-as-confidential').removeClass('hide')
        }

        if (
          ctx.preCon.getGroupData.auth.isPurchase ||
          ctx.preCon.getGroupData.auth.isSupplier ||
          ctx.preCon.getGroupData.auth.isHighest
        ) {
          // 報價附件表格, 下載紀錄
          $('#quote-attachment').closest('article').removeClass('hide')
        }

        if (servtechConfig.ST_CUSTOMER === 'Huangliang') {
          // 如果是皇亮
          ctx.attachmentReportTable.table.column(1).visible(false) // 隱藏檔案附件表格的檔案路徑
          ctx.quoteAttachmentReportTable.table.column(1).visible(false) // 隱藏報價附件表格的檔案路徑
        }

        ctx.init = false
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

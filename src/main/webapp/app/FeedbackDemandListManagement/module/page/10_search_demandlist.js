import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      context.initDropZone()

      servkit.initSelectWithList(
        {
          '0': `${i18n('Purchase_Order')}`,
          '1': `${i18n('Inquiry_Order')}`,
        },
        $('#document-type')
      )
      $('#document-type').prepend(
        `<option style="padding:3px 0 3px 3px;" value="">${i18n(
          'None'
        )}</option>`
      )
      $('#document-type').val('')
      if (context.preCon.getGroupData.auth.isSupplier) {
        // 如果是供應商，負責廠商只會有自己
        $('#responsible-manufacturer').prepend(
          '<option style="padding:3px 0 3px 3px;" value="' +
            context.thisGroup[0] +
            '">' +
            context.preCon.getManufacturerData[context.thisGroup[0]] +
            '</option>'
        )
      } else {
        servkit.initSelectWithList(
          context.preCon.getManufacturerData,
          $('#responsible-manufacturer')
        )
      }
      $('#responsible-manufacturer').prepend(
        `<option style="padding:3px 0 3px 3px;" value="">${i18n(
          'None'
        )}</option>`
      )
      $('#responsible-manufacturer').val('')
      servkit.initSelectWithList(
        context.preCon.getManufacturerData,
        $('#sup_id')
      )
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      context.setAutoComplete()

      var configData = {
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        order: [0, 'asc'],
        onRow: function (row, data) {
          // 如果預交日小於現在且未結案要加上highlight
          if (
            moment(data[5]).isBefore(moment(), 'day') &&
            $(data[7]).data('close') === 'N'
          ) {
            $(row).css('background-color', 'yellow')
          }
        },
      }
      if (
        context.preCon.getGroupData.auth.isPurchase ||
        context.preCon.getGroupData.auth.isHighest
      ) {
        configData.customBtns = [
          '<button class="btn btn-primary" id="add-demandList" data-toggle="modal" data-target="#add-demand-modal-widget"><span class="fa fa-plus fa-lg"></span></button>',
        ]
      }
      context.detailReportTable = createReportTable(configData)
      if (
        !(
          context.preCon.getGroupData.auth.isPurchase ||
          context.preCon.getGroupData.auth.isHighest
        )
      ) {
        $('#query-result-widget .dt-toolbar').addClass('hide')
      }

      if (servtechConfig.ST_CUSTOMER === 'Huangliang') {
        // 如果是皇亮
        $('[name=form_type][value=0]').closest('label').removeClass('hide') // 顯示新增需求單單據類型的採購單選項
        context.detailReportTable.table.column(2).visible(false) // 隱藏品號欄位
        context.detailReportTable.table.column(6).visible(false) // 原預交日欄位
      }

      if (
        context.preCon.getGroupData.auth.isConfidential ||
        context.preCon.getGroupData.auth.isHighest
      ) {
        // 機密問題checkbox
        $('#isClassified').closest('.pull-right').removeClass('hide')
      }

      servkit.validateForm($('#main-form1'), $('#submit-btn'))
      $('#submit-btn')
        .on('click', function (evt) {
          evt.preventDefault()
          context.submitBtn.doing() // 查詢按鈕開始loading
          var type = $('.tab-pane.active').attr('value') // 取不同搜尋狀態的value來用後端欄位的type操控
          var data = {}
          if (type === '0') {
            data.select_mode = $('[name=categoryQuery]:checked').val()
          } else if (type === '1') {
            var is_close = []
            $('[name=data-status]').each(function () {
              if ($(this).prop('checked')) {
                is_close.push(this.value)
              }
            })
            data.start_date = $('#startDate').val()
            data.end_date = $('#endDate').val()
            if ($('#document-type').val()) {
              data.form_type = $('#document-type').val()
            }
            if ($('#responsible-manufacturer').val()) {
              data.sup_id = $('#responsible-manufacturer').val()
            }
            if (is_close.length) {
              data.is_close = is_close
            }
          } else if (type === '2') {
            data.form_id = $('#demand-order-number').val() // *****自動串字功能(1)
          }

          servkit.ajax(
            {
              url: 'api/feedback/demandlist/type/' + type,
              type: 'GET',
              data: data,
            },
            {
              success: function (data) {
                context.detailRenderTable(data)
                context.submitBtn.done() // 查詢按鈕結束loading
              },
            }
          )
        })
        .trigger('click')

      // 「新增需求單」的新增加工問題checkedbox
      $('#unfinishedCase').change(function () {
        if (this.checked != true) {
          $('.table-hide').hide()
        } else {
          $('.table-hide').show()
        }
      })

      // 當modal要打開時把表單裡的資料重置
      $('#add-demand-modal-widget').on('show.bs.modal', function () {
        $('#add-demand-list-modal #form_id').val('')
        $('#add-demand-list-modal #title').val('')
        $('#add-demand-list-modal #description').val('')
        $('#sup_id').val($('#sup_id>option:first').val())
        $('[name=problemLevel][value=1]').prop('checked', true)
        $('#unfinishedCase').prop('checked', true)
        $('#isClassified').prop('checked', false)
        $('#unfinishedCase').trigger('change')
        context.generalDropzone.removeAllFiles()
        context.quotationDropzone.removeAllFiles()
      })

      // 新增需求單
      servkit.validateForm($('#add-demand-list-modal'), $('#add-demand-btn'))
      $('#add-demand-btn').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_feedback_demand_list',
              columns: ['form_id'],
            }),
          },
          {
            success: function (data) {
              var hasFormId = _.find(data, (val) => {
                return val.form_id === $('#form_id').val()
              })
              if (hasFormId) {
                $('#form_id').after(
                  `<label id="form_id-repeat-error" class="error" for="form_id">${i18n(
                    'This_Demand_Number_Already_Exists'
                  )}</label>`
                )
              } else {
                $('#form_id-repeat-error').remove()
                context.createDemandList()
              }
            },
          }
        )
      })

      $('#query-result')
        .on('click', '.detail-page', function (evt) {
          evt.preventDefault()
          var lang = servkit.getCookie('lang')
          var detail =
            '?formId=' +
            $(this).data('form_id') +
            '&seqNo=' +
            $(this).data('seq_no') +
            '&supId=' +
            $(this).data('sup_id')
          window.sessionStorage.setItem('demandLidtDetail', detail)
          window.location =
            '#app/FeedbackDemandListManagement/function/' +
            lang +
            '/11_demandlist_detail.html' +
            detail
        })
        .on('click', '.finished', function () {
          servkit.ajax(
            {
              url: 'api/feedback/demandlist',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({
                form_id: String($(this).data('form_id')), // 需求單號
                seq_no: String($(this).data('seq_no')), // 序號
                sup_id: String($(this).data('sup_id')), // 負責廠商
                is_close: 'Y', // 是否結案
              }),
            },
            {
              success: function () {
                $('#submit-btn').trigger('click')
              },
            }
          )
        })
    },
    util: {
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      generalDropzone: null,
      quotationDropzone: null,
      detailReportTable: null,
      thisGroup: JSON.parse(window.sessionStorage.getItem('loginInfo'))
        .user_group,
      detailRenderTable: function (data) {
        var ctx = this
        var tableData = []
        _.each(data, (val) => {
          var type
          var hasData = _.find(tableData, (d) => {
            return d[0].split('">')[1].replace('</a>', '') === val.form_id
          })
          if (servtechConfig.ST_CUSTOMER === 'Huangliang') {
            type = true
          } else {
            type = val.form_type === '1'
          }
          if (hasData) {
            if (val.is_close === 'N' && type) {
              // 只有未結案且單據類型為詢價單才可結案
              if (val.status === '0' || val.status === '1') {
                // 若有一個加工問題還沒取消或關閉就不能結案
                hasData[9] = `<button class="btn btn-primary" disabled>${i18n(
                  'Close_Case'
                )}</button>`
              }
            }
          } else {
            var form_type = '---'
            if (val.form_type === '0') {
              form_type = `${i18n('Purchase_Order')}`
            } else if (val.form_type === '1') {
              form_type = `${i18n('Inquiry_Order')}`
            }

            var is_close = '---' // 單據狀態加上值(為了判斷是否要繪製highlight)
            if (val.is_close === 'N') {
              is_close = `<span data-close="N">${i18n('Unfinished')}</span>`
            } else if (val.is_close === 'Y') {
              is_close = `<span data-close="Y">${i18n('Closed_Case')}</span>`
            }

            var is_close_btn = '---'
            if (val.is_close === 'N' && type) {
              // 只有未結案且單據類型為詢價單才可結案
              is_close_btn = `<button class="btn btn-primary" disabled>${i18n(
                'Close_Case'
              )}</button>`
              if (
                ctx.preCon.getGroupData.auth.isPurchase &&
                (!val.status || val.status === '2' || val.status === '3')
              ) {
                // 只有採購群組才可按下結案
                is_close_btn =
                  '<button class="btn btn-primary finished" data-form_id="' +
                  val.form_id +
                  '" data-seq_no="' +
                  val.seq_no +
                  '" data-sup_id="' +
                  val.sup_id +
                  `">${i18n('Close_Case')}</button>`
              }
            }

            tableData.push([
              '<a href="javascript:void(0);" class="detail-page" data-form_id="' +
                val.form_id +
                '" data-seq_no="' +
                val.seq_no +
                '" data-sup_id="' +
                val.sup_id +
                '">' +
                val.form_id +
                '</a>',
              val.seq_no || '---', // 序號
              val.item_id || '---', // 品號
              form_type, // 單據類型
              val.sup_id ? ctx.preCon.getManufacturerData[val.sup_id] : '---', // 負責廠商
              val.st_lead_time
                ? moment(val.st_lead_time, 'MMMM Do YYYY').format('YYYY/MM/DD')
                : '---', // 預交日
              val.orig_lead_time
                ? moment(val.st_orig_lead_time).format('YYYY/MM/DD')
                : '---', // 原預交日
              is_close, // 單據狀態
              val.close_time
                ? moment(val.close_time).format('YYYY/MM/DD HH:mm:ss')
                : '---', // 結案時間
              is_close_btn,
            ])
          }
        })
        ctx.detailReportTable.drawTable(tableData)
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
      setAutoComplete: function () {
        var data = {
          table: 'a_feedback_demand_list',
          columns: ['form_id'],
        }
        if (this.preCon.getGroupData.auth.isSupplier) {
          // 如果使用者為供應商只拿此負責廠商ID為群組代碼的單據代碼
          data.whereClause = `sup_id='${this.thisGroup[0]}'`
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              var value = []
              _.each(data, (val) => {
                value.push(val.form_id)
              })
              $('#demand-order-number').autocomplete({
                source: _.uniq(value),
              })
            },
          }
        )
      },
      createDemandList: function () {
        var ctx = this
        var apiData = {
          form_id: $('#form_id').val(), // 需求單號
          sup_id: $('#sup_id').val(), // 負責廠商
          form_type: $('[name=form_type]:checked').attr('value'), // 單據類型
        }
        servkit.ajax(
          {
            url: 'api/feedback/demandlist',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(apiData),
          },
          {
            success: function (data) {
              if ($('#unfinishedCase').prop('checked')) {
                delete apiData.form_type
                apiData.seq_no = data // 序號
                apiData.class = $('[name=problemLevel]:checked').attr('value') // 問題等級
                apiData.title = $('#title').val() // 問題標題
                apiData.description = $('#description').val() // 問題說明
                apiData.assign_to = $('#sup_id').val() // 指派給
                apiData.is_classified = 'N' // 機密問題
                if ($('#isClassified').prop('checked')) {
                  apiData.is_classified = 'Y'
                }
                servkit.ajax(
                  {
                    url: 'api/feedback/demandlist/questions',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(apiData),
                  },
                  {
                    success: function (data) {
                      var fileLength =
                        ctx.generalDropzone.files.length +
                        ctx.quotationDropzone.files.length
                      var uploadLength = 0
                      _.each(ctx.generalDropzone.files, (file) => {
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
                      _.each(ctx.quotationDropzone.files, (file) => {
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
                          $('#submit-btn').trigger('click')
                          $('#add-demand-modal-widget').modal('hide')
                          ctx.setAutoComplete()
                        })
                        .tryDuration(0)
                        .start()
                    },
                    fail: function () {
                      alert('create fail!')
                    },
                  }
                )
              } else {
                // 只有新增需求單也要隱藏modal
                $('#submit-btn').trigger('click')
                $('#add-demand-modal-widget').modal('hide')
                ctx.setAutoComplete()
              }
            },
          }
        )
      },
    },
    preCondition: {
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

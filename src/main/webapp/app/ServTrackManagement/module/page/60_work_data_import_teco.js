export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.workTableReportTable = createReportTable({
        $tableElement: $('#work-list-table'),
        $tableWidget: $('#work-list-table-widget'),
        customBtns: [
          '<button class="btn btn-primary cancel-work-btn">取消</button>',
          '<button class="btn btn-primary close-work-btn">結案</button>',
        ],
        checkbox: true, // 在最左邊多一欄checkbox(記得把排序或對齊的column數+1)\
        rightColumn: [6],
        order: [[3, 'asc']],
      })

      ctx.workOpTableReportTable = createReportTable({
        $tableElement: $('#work-op-list-table'),
        $tableWidget: $('#work-op-list-table-widget'),
        rightColumn: [1],
        order: [[1, 'asc']],
      })

      ctx.initDropzone()
      ctx.workListTableRenderTable()

      //按“取消”，更新勾選工單狀態為9
      ctx.$workListTableWidget.on('click', '.cancel-work-btn', function () {
        ctx.initcheckedWorkIdsAndStatus()
        var workCanceledStatusCode = '9'
        var params = {
          works: ctx.checkedWorkIds,
          status_id: workCanceledStatusCode,
        }

        var stopRunResult = _.where(ctx.checkedWorkStatus, {
          workStatus: '生產中',
        })

        if (stopRunResult.length > 0) {
          alert('該派工單已有報工生產紀錄，不可取消')
        } else {
          ctx.updateWorkStatus(params)
        }
      })

      //按“結案”，更新勾選工單狀態為2
      ctx.$workListTableWidget.on('click', '.close-work-btn', function () {
        ctx.initcheckedWorkIdsAndStatus()
        var workClosedStatusCode = '2'
        var params = {
          works: ctx.checkedWorkIds,
          status_id: workClosedStatusCode,
        }

        var stopRunResult = _.where(ctx.checkedWorkStatus, {
          workStatus: '開立',
        })

        if (stopRunResult.length > 0) {
          alert('該派工單尚未有報工生產紀錄，不可結案')
        } else {
          ctx.updateWorkStatus(params)
        }
      })

      $('#work-list-table-widget').on('click', '.work-op-modalBtn', function (
        evt
      ) {
        evt.preventDefault()
        var data = $(evt.target).data()
        $('#wo-id-modal-text').html('<font>工號 | ' + data.wo_id + '</font>')
        $('#work-id-modal-text').html(
          '<font>派工單號 | ' + data.work_id + '</font>'
        )
        $('#part-no-modal-text').html(
          '<font>料號 | ' + data.part_no + '</font>'
        )
        $('#product-id-modal-text').html(
          '<font>機種 | ' + data.product_id + '</font>'
        )
        $('#e-quantity-modal-text').html(
          '<font>需求量 | ' + data.e_quantity + '</font>'
        )

        var whereClause = "work_id = '" + data.work_id + "'"
        ctx.workOpListTableRenderTable(whereClause)
      })

      ctx.addDisableCheckboxEvent()
    },
    util: {
      $fileUploadZone: $('#fileupload-zone'),
      $workListTableWidget: $('#work-list-table-widget'),
      workTableReportTable: null,
      workOpTableReportTable: null,
      checkedWorkIds: [],
      checkedWorkStatus: [],
      firstSuccess: true,
      dispatchType: 'Other',
      $errorDialog: $('<div id="error-dialog"></div>'),
      addDisableCheckboxEvent: function () {
        var ctx = this
        $('#work-list-table_paginate').on('click', function (evt) {
          ctx.disableCheckbox()
        })
      },
      updateWorkStatus: function (params) {
        var ctx = this
        var workCloseStatusCode = '2'
        var works = params.works

        _.each(works, function (workId) {
          var param = {
            work_id: workId,
            status_id: params.status_id,
          }

          var productId, eQuantity, input

          servkit.ajax(
            {
              url: 'api/servtrack/work/update',
              contentType: 'application/json',
              type: 'PUT',
              data: JSON.stringify(param),
            },
            {
              success: function (data) {
                var obj = data[0]
                productId = obj.product_id
                eQuantity = obj.e_quantity
                input = obj.input
                if (params.status_id == workCloseStatusCode) {
                  var closeParam = {
                    work_id: workId,
                    product_id: productId,
                    e_quantity: eQuantity,
                    input: input,
                    status_id: workCloseStatusCode,
                  }
                  servkit.ajax(
                    {
                      url: 'api/servtrack/work/calculate',
                      type: 'PUT',
                      contentType: 'application/json',
                      data: JSON.stringify(closeParam),
                    },
                    {
                      success: function (data) {
                        console.warn(data)
                      },
                      fail: function (data) {
                        console.warn(data)
                      },
                    }
                  )
                }
              },
            }
          )
        })
        setTimeout(function () {
          ctx.workListTableRenderTable()
        }, 500)
      },
      initcheckedWorkIdsAndStatus: function () {
        var ctx = this
        ctx.checkedWorkIds = []
        ctx.checkedWorkStatus = []

        var checkedDatas = ctx.workTableReportTable.getSelectedRow()
        for (let row = 0; row < checkedDatas.length; row++) {
          var workObj = {}
          var workId = checkedDatas[row][2]
          var workStatus = checkedDatas[row][7]

          ctx.checkedWorkIds.push(workId)

          workObj.workId = workId
          workObj.workStatus = workStatus
          ctx.checkedWorkStatus.push(workObj)
        }
      },
      init: function () {},
      errorDialog: function (data) {
        var ctx = this
        ctx.$errorDialog.html('')
        ctx.$errorDialog.dialog({
          autoOpen: false,
          maxHeight: 600,
          width: 800,
          overflow: true,
          resizable: false,
          modal: true,
          title: 'Error',
          buttons: [
            {
              html: 'Close',
              class: 'btn btn-primary',
              click: function () {
                $(this).dialog('close')
                $(this).html('')
                ctx.firstSuccess = true
              },
            },
          ],
        })
        ctx.$errorDialog.html(data)
        ctx.$errorDialog.dialog('open')
      },
      initDropzone: function () {
        var ctx = this

        servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
          var fileName
          var acceptType = '.xls'
          var parseType = {
            parseType: ctx.dispatchType,
          }
          Dropzone.autoDiscover = false
          $('#fileupload-zone').dropzone({
            url: 'api/teco-servtrack/work/upload',
            addRemoveLinks: true,
            maxFilesize: 20, // MB
            acceptedFiles: acceptType,
            headers: parseType,
            accept: function (file, done) {
              fileName = file.name
              if (fileName.match(/.\.xls?/i) == null) {
                var $fileResult = $(file.previewElement)
                $fileResult.removeClass('dz-success').addClass('dz-error')
                ctx.errorDialog('<br>檔案格式錯誤:請上傳.xls格式檔案</br>')
              } else {
                done()
              }
            },
            dictResponseError: 'Error uploading file!',
            init: function () {
              this.on('sending', function (file, xhr, data) {
                data.append('type', ctx.type)
                data.append('lang', servkit.getCookie('lang'))
              })
              this.on('success', function (file, res) {
                var $fileResult
                switch (res.type) {
                  case 0: //finish
                    $fileResult = $(file.previewElement)
                    var databtn = $(
                      '<center><button style="" class="btn btn-success upload-data">上傳成功</button></center>'
                    )
                    var data = $(
                      '<span style="display:none;">' + res.data.data + '</span>'
                    )
                    data.attr('name', res.data.type)
                    $fileResult.find('.dz-details').after(databtn)
                    $fileResult.find('.dz-details').after(data)
                    ctx.workListTableRenderTable()
                    break
                  case 1: //Fail
                    $fileResult = $(file.previewElement)
                    $fileResult.removeClass('dz-success').addClass('dz-error')
                    var errbtn = $(
                      '<center><button class="btn btn-danger upload-error" value="' +
                        fileName +
                        ' : ' +
                        res.data.data[0] +
                        '">上傳失敗<br>顯示錯誤</button></center>'
                    )
                    var msg = $(
                      '<span style="display:none;">' +
                        res.data.data[0] +
                        '</span>'
                    )
                    $fileResult.attr('value', res.data.data[0])
                    $fileResult.find('.dz-details').after(errbtn)
                    $fileResult.find('.dz-details').after(msg)
                    $('.upload-error').on('click', function (e) {
                      e.preventDefault()
                      ctx.errorDialog($(this).attr('value'))
                    })
                    break
                  case 999:
                  default:
                    $fileResult = $(file.previewElement)
                    $fileResult.removeClass('dz-success').addClass('dz-error')
                    $fileResult
                      .find('.dz-error-message span')
                      .text(res.data)
                      .css('color', '#fff')
                      .parent()
                      .css('background-color', 'rgba(0, 0, 0, 0.8)')
                    break
                }
              })
            },
          })
        })
      },
      disableCheckbox: function () {
        $('#work-list-table')
          .find('thead tr th:first-child')
          .eq(1)
          .children()
          .css('display', 'none')
        $('#work-list-table')
          .find('tbody > tr')
          .each(function () {
            var status = $(this).children().eq(8).text()
            if (status == '取消') {
              $(this).children().eq(0).children().attr('disabled', true)
            } else if (status == '結案') {
              $(this).children().eq(0).children().attr('disabled', true)
            }
          })
      },
      workListTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          table: 'a_teco_servtrack_view_work_op GROUP By work_id',
          columns: [
            'wo_id',
            'product_id',
            'work_id',
            'e_quantity',
            'DATE_FORMAT(work_start_time,"%Y/%m/%d") AS work_start_time',
            'DATE_FORMAT(work_end_time,"%Y/%m/%d") AS work_end_time',
            'status_id',
            'part_no',
          ],
        }
        if (whereClause) {
          data.whereClause = whereClause
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
              // ctx.workTableReportTable.clearTable();
              ctx.workTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  var dataKey = ''
                  _.each(val, (value, key) => {
                    dataKey += ' data-' + key + '= "' + value + '"'
                  })

                  var statusId = ctx.getStatusText(val.status_id)

                  return [
                    val.wo_id === null || val.wo_id === undefined
                      ? ''
                      : val.wo_id,
                    val.product_id === null || val.product_id === undefined
                      ? ''
                      : val.product_id,
                    val.work_id === null || val.work_id === undefined
                      ? ''
                      : val.work_id,
                    val.work_start_time === null ||
                    val.work_start_time === undefined
                      ? ''
                      : val.work_start_time,
                    val.work_end_time === null ||
                    val.work_end_time === undefined
                      ? ''
                      : val.work_end_time,
                    val.e_quantity === null || val.e_quantity === undefined
                      ? ''
                      : val.e_quantity,
                    '<button class="btn btn-primary work-op-modalBtn" data-toggle="modal" data-target="#work-op-modal" data-pks="{work_id:' +
                      val.work_id +
                      '}" ' +
                      dataKey +
                      '>工序製程</button>',
                    statusId,
                  ]
                })
              )
              ctx.disableCheckbox()
            },
          }
        )
      },
      toolncListTableReportTable: null,
      getStatusText: function (statusId) {
        if (statusId == 0) {
          return '開立'
        } else if (statusId == 1) {
          return '生產中'
        } else if (statusId == 2) {
          return '結案'
        } else if (statusId == 9) {
          return '取消'
        }
      },
      workOpListTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          table: 'a_teco_servtrack_view_work_op',
          columns: [
            'wo_id',
            'product_id',
            'work_id',
            'e_quantity',
            'part_no',
            'process_name',
            'work_sum',
          ],
        }
        if (whereClause) {
          data.whereClause = whereClause
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
              ctx.workOpTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  var dataKey = ''
                  _.each(val, (value, key) => {
                    dataKey += ' data-' + key + '= "' + value + '"'
                  })
                  return [
                    val.process_name === null || val.process_name === undefined
                      ? ''
                      : val.process_name,
                    val.work_sum === null || val.work_sum === undefined
                      ? ''
                      : val.work_sum,
                  ]
                })
              )
            },
          }
        )
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

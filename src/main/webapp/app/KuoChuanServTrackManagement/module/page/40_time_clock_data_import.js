export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (ctx.preCon.dateClass) {
        ctx['dateFunc'] = ctx.preCon.dateClass
      }
      ctx.initDropzone()

      ctx.$tab.on('click', function (evt) {
        evt.preventDefault()
        var arr = this.id.split('-')
        ctx.type = arr[arr.length - 1]
      })

      ctx.$dataUpload.on('click', '.upload-error', function (evt) {
        evt.preventDefault()
        var msg = $(this).parent().prev('span').html()
        ctx.errorDialog(msg)
      })

      ctx.$dataUpload.on('click', '.upload-data', function (evt) {
        evt.preventDefault()
        var data = $(this).parent().prev('span').text()
        ctx.drawTable(JSON.parse(data))
      })
    },
    util: {
      $dataUpload: $('#data-upload'),
      $dataTable: $('#data-table'),
      $dataTableWidget: $('#data-table-widget'),
      $tab: $('.change-tab-event'),
      type: 'A',
      $errorDialog: $('<div id="error-dialog"></div>'),
      firstSuccess: true,
      initDropzone: function () {
        var ctx = this
        servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
          var acceptType = '.xls,.xlsx'
          // var type = {"importType" : ctx.importType};
          Dropzone.autoDiscover = false

          ctx.$dataUpload.dropzone({
            url: 'api/kuochuan/servtrack/dataimport/upload',
            addRemoveLinks: true,
            uploadMultiple: false,
            maxFilesize: 20, // MB
            acceptedFiles: acceptType,
            accept: function (file, done) {
              var checkResult = ctx.checkUploadFile(file.name)
              if (checkResult.length) {
                done(checkResult)
              } else {
                done()
              }
            },
            dictResponseError: 'Error uploading file!',
            init: function () {
              this.on('sending', function (file, xhr, data) {
                data.append('type', ctx.type)
              })
              this.on('success', function (file, res) {
                let $fileResult
                switch (res.type) {
                  case 0:
                    $fileResult = $(file.previewElement)
                    var databtn = $(
                      '<center><button style="" class="btn btn-success upload-data">show data</button></center>'
                    )
                    var data = $(
                      '<span style="display:none;">' + res.data + '</span>'
                    )

                    $fileResult.find('.dz-details').after(databtn)
                    $fileResult.find('.dz-details').after(data)
                    ctx.drawTable(JSON.parse(res.data))
                    break
                  case 1:
                    $fileResult = $(file.previewElement)
                    $fileResult.removeClass('dz-success').addClass('dz-error')
                    var errbtn = $(
                      '<center><button style="" class="btn btn-danger upload-error">show error</button></center>'
                    )
                    var msg = $(
                      '<span style="display:none;">' + res.data + '</span>'
                    )

                    $fileResult.find('.dz-details').after(errbtn)
                    $fileResult.find('.dz-details').after(msg)
                    if (ctx.firstSuccess) {
                      ctx.errorDialog(res.data)
                      ctx.firstSuccess = false
                    }
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
      drawTable: function (data) {
        var ctx = this
        var table = createReportTable({
          $tableElement: ctx.$dataTable,
          $tableWidget: ctx.$dataTableWidget,
          onRow: function (row, data) {},
          onDraw: function (tableData, pageData) {},
          // centerColumn : [ 11, 12, 13, 14],
          showNoData: true,
        })

        table.clearTable()
        table.drawTable(data)
        table.showWidget()
      },
      errorDialog: function (data) {
        var ctx = this
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
              html: '確定',
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
      checkUploadFile: function (fileName) {
        var that = this
        if (
          fileName.match(/\d{8}-A?B?台\.xls?x?/i) == null ||
          fileName.charAt(9) !== that.type
        ) {
          return '上傳檔名應為 yyyyMMdd-' + that.type + '台.xls 或 xlsx '
        } else {
          return that.dateFunc.check(fileName.substring(0, 8))
        }
      },
    },
    preCondition: {
      dateClass: function (done) {
        var today = new Date()
        function Obj(date) {
          this.date = date
          this.year = String(this.date.getFullYear())
          this.month = String(this.date.getMonth() + 1)
          this.day = String(this.date.getDate())
          if (this.month.length < 2) {
            this.month = '0' + this.month
          }
          if (this.day.length < 2) {
            this.day = '0' + this.day
          }
          this.today = this.toString()
          this.minDate()
        }

        Obj.prototype.toString = function (splitStr) {
          var sep = ''
          if (splitStr) {
            sep = splitStr
          }
          if (this.month.length)
            return this.year + sep + this.month + sep + this.day
        }
        Obj.prototype.minDate = function () {
          var beforeMaxYear = Number(this.year),
            beforeMaxMonth
          if (Number(this.day) >= 6) {
            if (Number(this.month) - 1 == 0) {
              beforeMaxYear -= 1
              beforeMaxMonth = 12
            } else {
              beforeMaxMonth = Number(this.month) - 1
            }
          } else {
            if (Number(this.month) - 2 == 0) {
              beforeMaxYear -= 1
              beforeMaxMonth = 12
            } else if (Number(this.month) - 2 < 0) {
              beforeMaxYear -= 1
              beforeMaxMonth = 11
            } else {
              beforeMaxMonth = Number(this.month) - 2
            }
          }
          if (String(beforeMaxMonth).length < 2) {
            beforeMaxYear = String(beforeMaxYear)
            beforeMaxMonth = '0' + String(beforeMaxMonth)
          } else {
            beforeMaxYear = String(beforeMaxYear)
            beforeMaxMonth = String(beforeMaxMonth)
          }

          this.minDate = beforeMaxYear + beforeMaxMonth
        }

        Obj.prototype.check = function (date8bits) {
          if (Number(date8bits) > Number(this.today)) {
            return '不可能的資料'
          }
          if (Number(date8bits.substring(0, 6)) >= Number(this.minDate)) {
            return ''
          } else {
            return '過期資料不可上傳'
          }
        }

        done(new Obj(today))
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

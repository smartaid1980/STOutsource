import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      // if (ctx.preCon.dateClass) {
      //   ctx['dateFunc'] = ctx.preCon.dateClass;
      // }
      ctx.initDropzone()

      //Table 們
      ctx.tables[5] = createReportTable({
        $tableElement: ctx.$dataTable1,
        $tableWidget: ctx.$dataTableWidget1,
        showNoData: true,
      })
      ctx.tables[6] = createReportTable({
        $tableElement: ctx.$dataTable2,
        $tableWidget: ctx.$dataTableWidget2,
        showNoData: true,
      })
      ctx.$tab.on('click', function (evt) {
        evt.preventDefault()
        var arr = this.id.split('-')
        ctx.type = arr[arr.length - 1]
      })

      ctx.$downloadExample.on('click', function (evt) {
        evt.preventDefault()
        var type = ctx.type
        ctx.downloadExample(type)
      })

      ctx.$dataUpload.on('click', '.upload-error', function (evt) {
        evt.preventDefault()
        var msg = $(this).parent().prev('span').html()
        ctx.errorDialog(msg)
      })

      ctx.$dataUpload.on('click', '.upload-data', function (evt) {
        evt.preventDefault()
        var data = $(this).parent().prev('span').text()
        var type = $(this).parent().prev('span').attr('name')
        ctx.drawTable(JSON.parse(data), type)
      })
      ctx.$clear.on('click', function (evt) {
        evt.preventDefault()
        ctx.clearDB()
      })
      ctx.$calculate.on('click', function (evt) {
        evt.preventDefault()
        ctx.calculate()
      })
    },
    util: {
      $dataUpload: $('#data-upload'),
      $dataTableWidget1: $('#data-table-widget-1'),
      $dataTableWidget2: $('#data-table-widget-2'),
      $dataTable1: $('#data-table-1'),
      $dataTable2: $('#data-table-2'),
      $tab: $('.change-tab-event'),
      $clear: $('#clearDB'),
      $calculate: $('#calcuate'),
      type: '5',
      tables: {},
      $downloadExample: $('#download-example'),
      $Forms: $('#stk-file'),
      $errorDialog: $('<div id="error-dialog"></div>'),
      firstSuccess: true,
      clearDB: function () {
        servkit.ajax(
          {
            url: 'api/servtracksimulator/clearTrackingData',
            type: 'DELETE',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              console.log(data)
              alert(data)
            },
            fail: function (data) {
              console.log(data)
              alert(data)
            },
          }
        )
      },
      calculate: function () {
        servkit.ajax(
          {
            url: 'api/servtracksimulator/calculate',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              console.log(data)
              alert(data)
            },
            fail: function (data) {
              console.log(data)
              alert(data)
            },
          }
        )
      },
      initDropzone: function () {
        var ctx = this
        var acceptType = '.csv'
        Dropzone.autoDiscover = false
        ctx.$dataUpload.addClass('dropzone').dropzone({
          url: 'api/servtrack/dataimport/upload',
          addRemoveLinks: true,
          uploadMultiple: false,
          maxFilesize: 20, // MB
          dictDefaultMessage:
            '<span class="text-center">' +
            '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
            '<span class="font-lg">' +
            `<i class="fa fa-caret-right text-danger"></i> ${i18n(
              'ServTrackManagement_000182'
            )} ` +
            `<span class="font-xs">${i18n(
              'ServTrackManagement_000180'
            )}</span>` +
            '</span>' +
            '</span>' +
            '</span>',
          acceptedFiles: acceptType,
          // headers: {type: ctx.type},
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
              data.append('lang', servkit.getCookie('lang'))
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
                    '<span style="display:none;">' + res.data.data + '</span>'
                  )
                  data.attr('name', res.data.type)
                  $fileResult.find('.dz-details').after(databtn)
                  $fileResult.find('.dz-details').after(data)
                  ctx.drawTable(JSON.parse(res.data.data), res.data.type)
                  break
                case 1:
                  $fileResult = $(file.previewElement)
                  $fileResult.removeClass('dz-success').addClass('dz-error')
                  var errbtn = $(
                    '<center><button style="" class="btn btn-danger upload-error">show error</button></center>'
                  )
                  var msg = $(
                    '<span style="display:none;">' + res.data.data + '</span>'
                  )

                  $fileResult.find('.dz-details').after(errbtn)
                  $fileResult.find('.dz-details').after(msg)
                  if (ctx.firstSuccess) {
                    ctx.errorDialog(res.data.data)
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
      },
      drawTable: function (data, type) {
        var ctx = this
        _.each(_.keys(ctx.tables), function (key) {
          if (type != key) {
            ctx.tables[key].clearTable()
            ctx.tables[key].hideWidget()
          } else {
            ctx.tables[key].drawTable(data)
            ctx.tables[key].showWidget()
          }
        })

        // table.clearTable();
        // table.drawTable(data);
        // table.showWidget();
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
              html: `${i18n('ServTrackManagement_000042')}`,
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
        if (fileName.match(/.\.csv?/i) == null) {
          return `${i18n('ServTrackManagement_000189')}`
        } else {
          return ''
        }
      },
      downloadExample: function (type) {
        var ctx = this

        var uuid = ctx.commons.uuidGenerator(32)
        var $submitForm = $('<form name="' + uuid + '""></form>'),
          iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
        $submitForm.append($('<input>').attr('name', 'type').val(type))
        $submitForm.attr({
          action: 'api/servtrack/dataimport/download/example',
          method: 'GET',
          target: 'download_target',
        })
        var dateTag = moment()
        ctx.$Forms.append($submitForm.hide())
        $submitForm.append(iframeHtml)
        document.querySelector('[name="' + uuid + '"]').submit()
      },
    },
    // preCondition: {

    //   dateClass: function (done) {
    //     var today = new Date();
    //     function Obj(date) {
    //       this.date = date;
    //       this.year = String(this.date.getFullYear());
    //       this.month = String(this.date.getMonth() + 1);
    //       this.day = String(this.date.getDate());
    //       if (this.month.length < 2) {
    //         this.month = "0" + this.month;
    //       }
    //       if (this.day.length < 2) {
    //         this.day = "0" + this.day;
    //       }
    //       this.today = this.toString();
    //       this.minDate();
    //     }

    //     Obj.prototype.toString = function (splitStr) {
    //       var sep = "";
    //       if (splitStr) {
    //         sep = splitStr;
    //       }
    //       if (this.month.length)
    //       return this.year + sep + this.month + sep + this.day;
    //     }
    //     Obj.prototype.minDate = function () {
    //       var beforeMaxYear = Number(this.year),
    //           beforeMaxMonth;
    //       if (Number(this.day) >= 6) {
    //         if (Number(this.month) -1 == 0 ) {
    //           beforeMaxYear -= 1;
    //           beforeMaxMonth = 12;
    //         } else {
    //           beforeMaxMonth = Number(this.month) -1;
    //         }
    //       } else {
    //         if (Number(this.month) -2 == 0 ) {
    //           beforeMaxYear -= 1;
    //           beforeMaxMonth = 12;
    //         } else if (Number(this.month) -2 < 0) {
    //           beforeMaxYear -= 1;
    //           beforeMaxMonth = 11;
    //         } else {
    //           beforeMaxMonth = Number(this.month) -2;
    //         }
    //       }
    //       if (String(beforeMaxMonth).length < 2) {
    //         beforeMaxYear = String(beforeMaxYear);
    //         beforeMaxMonth = "0" + String(beforeMaxMonth);
    //       } else {
    //         beforeMaxYear = String(beforeMaxYear);
    //         beforeMaxMonth = String(beforeMaxMonth);
    //       }

    //       this.minDate = beforeMaxYear + beforeMaxMonth;
    //     }

    //     Obj.prototype.check = function (date8bits) {
    //       if (Number(date8bits) > Number(this.today)) {
    //         return "不可能的資料";
    //       }
    //       if (Number(date8bits.substring(0, 6)) >= Number(this.minDate)) {
    //         return "";
    //       } else {
    //         return "過期資料不可上傳";
    //       }
    //     }

    //     done(new Obj(today));

    //   }
    // },
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

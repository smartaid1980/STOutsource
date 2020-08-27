import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initDropzone()
      //Table 們
      ctx.tables[0] = createReportTable({
        $tableElement: ctx.$dataTable0,
        $tableWidget: ctx.$dataTableWidget0,
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
    },
    util: {
      $dataUpload: $('#data-upload'),
      $dataTableWidget0: $('#data-table-widget-0'),
      $dataTable0: $('#data-table-0'),
      $tab: $('.change-tab-event'),
      type: '0',
      tables: {},
      $downloadExample: $('#download-example'),
      $Forms: $('#stk-file'),
      $errorDialog: $('<div id="error-dialog"></div>'),
      firstSuccess: true,
      initDropzone: function () {
        var ctx = this
        var acceptType = '.csv'
        Dropzone.autoDiscover = false
        ctx.$dataUpload.addClass('dropzone dropzone-v15').dropzone({
          url: 'api/servtrack/dataimport/upload',
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
              data.append('lang', servkit.getCookie('lang'))
            })
            this.on('success', function (file, res) {
              var $fileResult
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
        ctx.$Forms.append($submitForm.hide())
        $submitForm.append(iframeHtml)
        document.querySelector('[name="' + uuid + '"]').submit()
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

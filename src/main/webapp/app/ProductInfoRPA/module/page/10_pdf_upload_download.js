export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.uploadResultTable = createReportTable({
        $tableElement: $('#upload-result-table'),
        $tableWidget: $('#upload-result-table-widget'),
        order: [[1, 'desc']],
        showNoData: false,
      })

      ctx.initDropzone()
      ctx.resultTableRenderTable()
      setInterval(ctx.resultTableRenderTable.bind(ctx), 2000)

      $('#upload-result-table').on('click', '[name=btn-download]', function (
        evt
      ) {
        evt.preventDefault()
        var data = $(evt.target).data()
        ctx.downloadPdf(data.filename, data.lang)
      })
    },
    util: {
      $fileUploadZone: $('#fileupload-zone'),
      uploadResultTable: null,
      firstSuccess: true,
      $Forms: $('#stk-file'),
      dispatchType: 'Other',
      $errorDialog: $('<div id="error-dialog"></div>'),
      downloadPdf: function (fileName, lang) {
        var ctx = this
        var type = '0'
        var uuid = ctx.commons.uuidGenerator(32)
        var $submitForm = $('<form name="' + uuid + '""></form>'),
          iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
        $submitForm.append($('<input>').attr('name', 'fileName').val(fileName))
        $submitForm.append($('<input>').attr('name', 'language').val(lang))
        $submitForm.attr({
          action: 'api/shengtai/pdf/download',
          method: 'GET',
          target: 'download_target',
        })
        ctx.$Forms.append($submitForm.hide())
        $submitForm.append(iframeHtml)
        document.querySelector('[name="' + uuid + '"]').submit()
      },
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
          var acceptType = '.pdf'
          var parseType = {
            parseType: ctx.dispatchType,
          }
          Dropzone.autoDiscover = false
          $('#fileupload-zone').dropzone({
            url: 'api/shengtai/pdf/upload',
            addRemoveLinks: true,
            maxFilesize: 20, // MB
            acceptedFiles: acceptType,
            headers: parseType,
            accept: function (file, done) {
              fileName = file.name
              if (file.name.match(/.\.pdf?/i) == null) {
                var $fileResult = $(file.previewElement)
                $fileResult.removeClass('dz-success').addClass('dz-error')
                ctx.errorDialog('<br>檔案格式錯誤:請上傳.pdf格式檔案</br>')
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
                    ctx.resultTableRenderTable()
                    break
                  case 1: //Fail
                    $fileResult = $(file.previewElement)
                    $fileResult.removeClass('dz-success').addClass('dz-error')
                    var errbtn = $(
                      '<center><button class="btn btn-danger upload-error" value="' +
                        file.name +
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
                    $('.upload-error').on('click', function () {
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
      resultTableRenderTable: function () {
        console.log('check status...')
        var ctx = this
        servkit.ajax(
          {
            url: 'api/shengtai/pdf/check_status',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var talbeData = []

              _.each(data.complete, (item) => {
                var itemArr = item.split('@@')
                var fileName = itemArr[0]
                var uploadTime = moment(itemArr[1], 'YYYYMMDDHHmmss').format(
                  'YYYY-MM-DD HH:mm:ss'
                )
                talbeData.push([
                  fileName + '.pdf',
                  uploadTime,
                  '已完成',
                  '<button class="btn btn-primary" name="btn-download" data-lang="zh_tw" data-filename="' +
                    fileName +
                    '">下載</button>',
                  '<button class="btn btn-primary" name="btn-download" data-lang="en" data-filename="' +
                    fileName +
                    '">下載</button>',
                ])
              })

              _.each(data.withoutEnd, (item) => {
                var itemArr = item.split('@@')
                var fileName = itemArr[0]
                var uploadTime = moment(itemArr[1], 'YYYYMMDDHHmmss').format(
                  'YYYY-MM-DD HH:mm:ss'
                )
                talbeData.push([
                  fileName + '.pdf',
                  uploadTime,
                  '處理中',
                  '<button class="btn btn-primary" data-lang="zh_tw" disabled="disabled">下載</button>',
                  '<button class="btn btn-primary" data-lang="en" disabled="disabled">下載</button>',
                ])
              })
              ctx.uploadResultTable.clearTable()
              ctx.uploadResultTable.drawTable(talbeData)
            },
            fail: function (data) {
              console.log(data)
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

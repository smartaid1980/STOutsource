import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  ;(function () {
    $('#start-date-picker')
      .datepicker({
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      })
      .val('2015/11/01')

    $('#end-date-picker')
      .datepicker({
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      })
      .val('2015/11/30')
  })()

  servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
    Dropzone.autoDiscover = false

    function UploadResult(timestamp, fileName, message) {
      this.timestamp = timestamp
      this.fileName = fileName
      this.message = message
    }
    UploadResult.prototype.getDateTime = function () {
      return (
        this.timestamp.substring(0, 4) +
        '/' +
        this.timestamp.substring(4, 6) +
        '/' +
        this.timestamp.substring(6, 8) +
        ' ' +
        this.timestamp.substring(8, 10) +
        ':' +
        this.timestamp.substring(10, 12) +
        ':' +
        this.timestamp.substring(12, 14)
      )
    }

    var uploadResults = []

    // 下載全部的按鈕
    servkit.downloadFile(
      document.querySelector('#download-all'),
      '/api/juihua/txtOrder/downloadAll',
      function () {
        return {
          tspSplittedByComma: _.map(uploadResults, function (e) {
            return e.timestamp
          }).join(','),
        }
      }
    )

    $('#app-file-zone').dropzone({
      url: 'api/juihua/txtOrder/upload',
      addRemoveLinks: true,
      maxFilesize: 20, // MB
      dictDefaultMessage:
        '<span class="text-center">' +
        '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
        '<span class="font-lg">' +
        `<i class="fa fa-caret-right text-danger"></i> ${i18n('Drop_File')} ` +
        `<span class="font-xs">${i18n('To_Upload')}</span>` +
        '</span>' +
        '</span>' +
        '</span>',
      dictResponseError: 'Error uploading file!',
      dictInvalidFileType: `${i18n('File_Must_Be_Txt')}`,
      init: function () {
        this.on('sending', function (file, xhr, data) {
          data.append('startDate', $('#start-date-picker').val())
          data.append('endDate', $('#end-date-picker').val())
        })

        this.on('success', function (file, res) {
          switch (res.type) {
            case 0:
              var uploadResult = new UploadResult(
                res.data.timestamp,
                res.data.fileName,
                res.data.message
              )
              var duplicateFileNameIndex = _.findIndex(uploadResults, function (
                each
              ) {
                return each.fileName === uploadResult.fileName
              })
              if (duplicateFileNameIndex !== -1) {
                uploadResults[duplicateFileNameIndex] = uploadResult
              } else {
                uploadResults.push(uploadResult)
              }

              $('#upload-counts').html(
                '成功上傳 <code>' + uploadResult.message + '</code> 筆！'
              )

              var downloadTBody = _.map(uploadResults, function (each) {
                var tsp = each.timestamp
                var bgColor =
                  tsp === uploadResult.timestamp
                    ? 'rgba(229, 255, 229, 0.3)'
                    : 'none'
                return (
                  '<tr style="background-color:' +
                  bgColor +
                  '">' +
                  '<td>' +
                  each.getDateTime() +
                  '</td>' +
                  '<td><code>' +
                  each.fileName +
                  '</code></td>' +
                  '<td><span id="ERPPO-' +
                  tsp +
                  '" class="btn btn-default">下載</span></td>' +
                  '<td><span id="planning-of-month-' +
                  tsp +
                  '" class="btn btn-default">下載</span></td>' +
                  '</tr>'
                )
              }).join('')

              $('#download-table tbody').html(downloadTBody)

              _.each(uploadResults, function (each) {
                var tsp = each.timestamp
                servkit.downloadFile(
                  document.querySelector('#ERPPO-' + tsp),
                  '/api/juihua/txtOrder/download',
                  function () {
                    return {
                      timestamp: tsp,
                      fileType: 'csv',
                    }
                  }
                )

                servkit.downloadFile(
                  document.querySelector('#planning-of-month-' + tsp),
                  '/api/juihua/txtOrder/download',
                  function () {
                    return {
                      timestamp: tsp,
                      fileType: 'excel',
                    }
                  }
                )
              })

              break
            case 1:
            case 999:
            default:
              var $fileResult = $(file.previewElement)
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
}

import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  ;(function () {
    var $tripTimeTableBody = $('#trip-time-table tbody')

    function renderTripTimeTable(tripTimeData) {
      var htmlContent = _.map(tripTimeData, function (tripTime, supplier) {
        return (
          '<tr>' +
          '<td>' +
          supplier +
          '</td>' +
          // '<td>' + tripTime.name + '</td>' +
          '<td>' +
          tripTime.tripTime +
          '</td>' +
          '</tr>'
        )
      }).join('')

      $tripTimeTableBody.html(htmlContent)
    }

    servkit.ajax(
      {
        url: 'api/juihua/config/tripTimeConfig',
        type: 'GET',
      },
      {
        success: function (data) {
          renderTripTimeTable(data)
        },
      }
    )

    servkit.downloadFile(
      document.querySelector('#download-trip-time'),
      '/api/juihua/config/downloadTripTimeConfig',
      function () {
        return {}
      }
    )

    servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
      Dropzone.autoDiscover = false

      $('#trip-time-file-zone').dropzone({
        url: 'api/juihua/config/uploadTripTime',
        addRemoveLinks: true,
        maxFilesize: 20, // MB
        dictDefaultMessage:
          '<span class="text-center">' +
          '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
          '<span class="font-lg">' +
          '<i class="fa fa-caret-right text-danger"></i> 交貨趟次參數擋 ' +
          `<span class="font-xs">${i18n('To_Upload')}</span>` +
          '</span>' +
          '</span>' +
          '</span>',
        dictResponseError: 'Error uploading file!',
        dictInvalidFileType: 'N/A',
        init: function () {
          this.on('success', function (file, res) {
            switch (res.type) {
              case 0:
                renderTripTimeTable(res.data)

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
  })()
}

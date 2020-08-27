import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  ;(function () {
    var $deliverDayTableBody = $('#deliver-day-table tbody')

    function renderDeliverDayTable(deliverDayData) {
      var htmlContent = _.map(deliverDayData, function (deliverDay, supplier) {
        return (
          '<tr>' +
          '<td>' +
          supplier +
          '</td>' +
          '<td>' +
          _.map(deliverDay.week, function (e) {
            return (
              '<span class="label label-primary" style="margin-left:10px;">' +
              e +
              '</span>'
            )
          }).join('') +
          '</td>' +
          '<td>' +
          _.map(deliverDay.date, function (e) {
            return (
              '<span class="label label-primary" style="margin-left:10px;">' +
              e +
              '</span>'
            )
          }).join('') +
          '</td>' +
          '</tr>'
        )
      }).join('')

      $deliverDayTableBody.html(htmlContent)
    }

    servkit.ajax(
      {
        url: 'api/juihua/config/deliverDayConfig',
        type: 'GET',
      },
      {
        success: function (data) {
          renderDeliverDayTable(data)
        },
      }
    )

    servkit.downloadFile(
      document.querySelector('#download-deliver-day'),
      '/api/juihua/config/downloadDeliverDayConfig',
      function () {
        return {}
      }
    )

    servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
      Dropzone.autoDiscover = false

      $('#deliver-day-file-zone').dropzone({
        url: 'api/juihua/config/uploadDeliverDay',
        addRemoveLinks: true,
        maxFilesize: 20, // MB
        dictDefaultMessage:
          '<span class="text-center">' +
          '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
          '<span class="font-lg">' +
          '<i class="fa fa-caret-right text-danger"></i> 交貨時間參數擋 ' +
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
                renderDeliverDayTable(res.data)

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

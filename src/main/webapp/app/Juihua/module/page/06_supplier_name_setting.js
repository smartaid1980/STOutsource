import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  ;(function () {
    var $supplierNameTableBody = $('#supplier-name-table tbody')

    function renderSupplierNameTable(supplierNameData) {
      var htmlContent = _.map(supplierNameData, function (
        supplierName,
        supplierId
      ) {
        return (
          '<tr>' +
          '<td>' +
          supplierId +
          '</td>' +
          '<td>' +
          supplierName +
          '</td>' +
          '</tr>'
        )
      }).join('')

      $supplierNameTableBody.html(htmlContent)
    }

    servkit.ajax(
      {
        url: 'api/juihua/config/supplierNameConfig',
        type: 'GET',
      },
      {
        success: function (data) {
          renderSupplierNameTable(data)
        },
      }
    )

    servkit.downloadFile(
      document.querySelector('#download-supplier-name'),
      '/api/juihua/config/downloadSupplierNameConfig',
      function () {
        return {}
      }
    )

    servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
      Dropzone.autoDiscover = false

      $('#trip-time-file-zone').dropzone({
        url: 'api/juihua/config/uploadSupplierName',
        addRemoveLinks: true,
        maxFilesize: 20, // MB
        dictDefaultMessage:
          '<span class="text-center">' +
          '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
          '<span class="font-lg">' +
          '<i class="fa fa-caret-right text-danger"></i> 供應商名稱參數擋 ' +
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
                renderSupplierNameTable(res.data)

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

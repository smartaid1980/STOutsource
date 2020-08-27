import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      Dropzone.autoDiscover = false

      $('#license-file-zone').dropzone({
        url: 'api/license/updateIndicated',
        addRemoveLinks: true,
        maxFilesize: 0.5, // MB
        dictDefaultMessage:
          '<span class="text-center">' +
          '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
          '<span class="font-lg">' +
          `<i class="fa fa-caret-right text-danger"></i> ${i18n(
            'File_Select'
          )} ` +
          '</span>' +
          '</span>' +
          '</span>',
        dictResponseError: 'Error uploading file!',
        init: function () {
          this.on('success', function (file, res) {
            if (typeof res.type === 'number') {
              switch (res.type) {
                case 0:
                  $('#license-date').trigger('click')
                  break
                case 2:
                  window.location.href = servkit.rootPath
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
            }
          })
        },
      })
    },

    dependencies: ['/js/plugin/dropzone/dropzone.min.js'],
  })
}

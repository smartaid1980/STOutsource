import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      Dropzone.autoDiscover = false

      $('#app-file-zone').dropzone({
        url: 'api/app/upload',
        addRemoveLinks: true,
        maxFilesize: 2, // MB
        acceptedFiles: '.zip',
        dictDefaultMessage:
          '<span class="text-center">' +
          '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
          '<span class="font-lg">' +
          `<i class="fa fa-caret-right text-danger"></i> ${i18n(
            'Drop_APP_File'
          )} ` +
          `<span class="font-xs">${i18n('To_Upload')}</span>` +
          '</span>' +
          '</span>' +
          '</span>',
        dictResponseError: 'Error uploading file!',
        dictInvalidFileType: `${i18n('File_Must_Be_Zip')}`,
        init: function () {
          this.on('success', function (file, res) {
            if (res.type) {
              switch (res.type) {
                case 0:
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

      if (
        window.sessionStorage &&
        JSON.parse(window.sessionStorage.getItem('loginInfo')).user_id ===
          'admin'
      ) {
        $('#app-upload-zone').attr(
          'class',
          'col-xs-6 col-sm-6 col-md-6 col-lg-6'
        )
        $('#app-config-upload-zone').removeClass('hide')

        // dropzone在載入時就會去找含有class="dropzone"的DOM並建立dropzone實體，若重新整理會造成重複建立實體，所以要用的時候再加class
        $('#app-config-file-zone')
          .addClass('dropzone')
          .dropzone({
            url: 'api/app/updateFunction',
            addRemoveLinks: true,
            maxFilesize: 0.5, // MB
            accept: function (file, done) {
              if (file.name !== 'config.json') {
                done('此區塊僅限上傳 config.json')
              } else {
                done()
              }
            },
            dictDefaultMessage:
              '<span class="text-center">' +
              '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
              '<span class="font-lg">' +
              '<i class="fa fa-caret-right text-danger"></i> 將 config.json 拖曳至此 ' +
              '</span>' +
              '</span>' +
              '</span>',
            dictResponseError: 'Error uploading file!',
            init: function () {
              this.on('success', function (file, res) {
                if (res.type) {
                  switch (res.type) {
                    case 0:
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
      }

      servkit.crudtable({
        tableSelector: '#stk-app-table',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/app/read',
          end: {
            5: function (data) {
              return _.map(data, function (d) {
                return d.func_id + ' / ' + d.func_name
              })
            },
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          unavailable: true,
        },
      })
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

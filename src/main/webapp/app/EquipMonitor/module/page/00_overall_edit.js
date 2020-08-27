import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var monitor

      // Todo 尚未上傳圖片時的初始圖片

      // 初始dropzone
      Dropzone.autoDiscover = false
      $('#mydropzone').dropzone({
        url: 'api/equipmonitor/uploadPlantBackground',
        addRemoveLinks: true,
        maxFilesize: 6, // MB
        acceptedFiles: '.png',
        dictDefaultMessage: `<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> ${i18n(
          'Monitor_Drop_File'
        )} <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (${i18n(
          'Monitor_Or_Click'
        )})</h4></span>`,
        dictResponseError: `${i18n('Monitor_Upload_Fail')}!`,
        dictInvalidFileType: `${i18n('Monitor_File_Must_Be_PNG')}`,
        init: function () {
          this.on('success', function (file, res) {
            switch (res.type) {
              case 0:
                monitor.reloadEditEnv()
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

      // 初始彈出表單
      $('#formDialog').dialog({
        autoOpen: false,
        width: '50%',
        modal: true,
        resizable: false,
        title: `${i18n('Monitor_UploadBgImage')}`,
        buttons: [
          {
            id: 'form-btn-close',
            html: `${i18n('Close')}`,
            class: 'btn btn-default',
            click: function () {
              $(this).dialog('close')
            },
          },
        ],
      })

      // 表單開啟事件，並清除上次上傳資料
      $('#monitor-panel .option').on('click', '.act-uploadBgImg', function () {
        $('#formDialog')
          .find('.dropzone')
          .removeClass('dz-started')
          .end()
          .find('.dropzone .dz-preview')
          .remove()
          .end()
          .dialog('open')
      })

      // 開始初始監控編輯
      monitor = context.commons.monitor(
        {
          currentAppId: context.appId,
          currentPage: context.funcId,
          titles: {
            pieLeftName: `${i18n('Speed')}`,
            pieRightName: `${i18n('Feed')}`,
            txtFirstName: `${i18n('Program')}`,
            txtLastName: `${i18n('Quantity')}`,
          },
        },
        'edit'
      )
    },
    util: {},
    delayCondition: ['machineList'],
    dependencies: ['/js/plugin/dropzone/dropzone.min.js'],
  })
}

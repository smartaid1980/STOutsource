import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.toolncTableReportTable = createReportTable({
        $tableElement: $('#tool-nc-table'),
        $tableWidget: $('#tool-nc-table-widget'),
        order: [[0, 'asc']],
      })

      ctx.toolncListTableReportTable = createReportTable({
        $tableElement: $('#tool-nc-list-table'),
        $tableWidget: $('#tool-nc-list-table-widget'),
        order: [[0, 'asc']],
      })
      $('#tool-nc-table-widget').on('click', '.use-tool-modalBtn', function (
        evt
      ) {
        evt.preventDefault()
        var data = $(evt.target).data()
        $('#nc-name-modal-text').html(
          '<font>加工程式名稱 | ' + data.nc_name + '</font>'
        )
        $('#upload-time-modal-text').html(
          '<font>上傳時間 | ' + data.upload_time + '</font>'
        )
        var whereClause = "nc_name = '" + data.nc_name + "'"
        ctx.toolncListTableRenderTable(whereClause)
      })
      ctx.initDropzone()
      ctx.toolncTableRenderTable()
    },
    util: {
      $fileUploadZone: $('#fileupload-zone'),
      toolncTableReportTable: null,
      firstSuccess: true,
      dispatchType: 'Other',
      $errorDialog: $('<div id="error-dialog"></div>'),
      init: function () {},
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
          var acceptType = '.xlsx'
          var parseType = {
            parseType: ctx.dispatchType,
          }
          Dropzone.autoDiscover = false
          $('#fileupload-zone').dropzone({
            url: 'api/iiot/fileupload/upload',
            addRemoveLinks: true,
            maxFilesize: 20, // MB
            acceptedFiles: acceptType,
            headers: parseType,
            accept: function (file, done) {
              fileName = file.name
              if (file.name.match(/.\.xlsx?/i) == null) {
                var $fileResult = $(file.previewElement)
                $fileResult.removeClass('dz-success').addClass('dz-error')
                ctx.errorDialog('<br>檔案格式錯誤:請上傳.xlsx格式檔案</br>')
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
                    ctx.toolncTableRenderTable()
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
      toolncTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          table: 'a_iiot_tool_nc',
          columns: [
            'nc_name',
            'DATE_FORMAT(file_create_time,"%Y-%m-%d %H:%i:%s") AS file_create_time',
            'DATE_FORMAT(upload_time,"%Y-%m-%d %H:%i:%s") AS upload_time',
          ],
        }
        if (whereClause) {
          data.whereClause = whereClause
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              ctx.toolncTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  var dataKey = ''
                  _.each(val, (value, key) => {
                    dataKey += ' data-' + key + '= "' + value + '"'
                  })
                  return [
                    val.nc_name === null || val.nc_name === undefined
                      ? ''
                      : val.nc_name,
                    val.upload_time === null || val.upload_time === undefined
                      ? ''
                      : val.upload_time,
                    val.file_create_time === null ||
                    val.file_create_time === undefined
                      ? ''
                      : val.file_create_time,
                    '<button class="btn btn-primary use-tool-modalBtn" data-toggle="modal" data-target="#use-tool-modal" data-pks="{use_tool:' +
                      val.use_tool +
                      '}" ' +
                      dataKey +
                      `>${i18n('Tool_Usage')}</button>`,
                  ]
                })
              )
            },
          }
        )
      },
      toolncListTableReportTable: null,
      toolncListTableRenderTable: function (whereClause) {
        var ctx = this
        var data = {
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolNcList',
        }
        if (whereClause) {
          data.whereClause = whereClause
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            contentType: 'application/json',
            data: data,
          },
          {
            success: function (data) {
              ctx.toolncListTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  return [
                    val.tool_no === null || val.tool_no === undefined
                      ? ''
                      : val.tool_no,
                    val.compensation === null || val.compensation === undefined
                      ? ''
                      : val.compensation,
                    val.tool_spec === null || val.tool_spec === undefined
                      ? ''
                      : val.tool_spec,
                    val.tool_type === null || val.tool_type === undefined
                      ? ''
                      : val.tool_type,
                    val.tool_code === null || val.tool_code === undefined
                      ? ''
                      : val.tool_code,
                    val.tool_length === null || val.tool_length === undefined
                      ? ''
                      : val.tool_length,
                    val.holder_type === null || val.holder_type === undefined
                      ? ''
                      : val.holder_type,
                  ]
                })
              )
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

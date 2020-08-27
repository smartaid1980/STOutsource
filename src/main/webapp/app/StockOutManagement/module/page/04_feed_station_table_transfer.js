export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      context.reportTable = createReportTable({
        $tableElement: $('#Smt-table'),
        $tableWidget: $('#csv-widget'),
        autoWidth: false,
      })
      context.reportTableList = createReportTable({
        $tableElement: $('#SmtList-table'),
        $tableWidget: $('#csv-widget'),
        autoWidth: false,
        customBtns: [
          `<button id='table_submit' class='btn btn-primary btn-lg'>確定轉入</button>`,
        ],
      })
      Dropzone.autoDiscover = false
      $('#form_dropzone').addClass('dropzone')
      //因為DropZone.autoDiscover  會先抓html的form 初始化 但form class若先加DropZone 下面你在呼叫DropZone一次 就會報錯
      $('#form_dropzone').dropzone(
        context.dropzoneConfig('api/ennoconn/filesyn/parse-smt-file')
      )

      $('#table_submit').click(function () {
        if (context.upload_check) {
          servkit.ajax(
            {
              url: 'api/ennoconn/filesyn/smt-station',
              type: 'GET',
              data: `fileName=${context.fileName}`,
            },
            {
              success: function (data) {
                $('#table_submit').hide()
                context.upload_check = false
                $.smallBox({
                  title: `成功轉入
                  <hr/>
                   ${
                     data.mainInsertRow.length === 0
                       ? ''
                       : '主表成功列編號 :' +
                         data.mainInsertRow.join(',') +
                         '<br/><hr/>'
                   } 
                   ${
                     data.mainUpdateRow.length === 0
                       ? ''
                       : '主表覆蓋列編號 :' +
                         data.mainUpdateRow.join(',') +
                         '<br/><hr/>'
                   } 
                  ${
                    data.detailInsertRow.length === 0
                      ? ''
                      : '明細成功列編號 :' +
                        data.detailInsertRow.join(',') +
                        '<br/><hr/>'
                  }
                  ${
                    data.detailUpdateRow.length === 0
                      ? ''
                      : '明細覆蓋列編號 :' +
                        data.detailUpdateRow.join(',') +
                        '<br/><hr/>'
                  }
                   ${
                     data.errorRow.length === 0
                       ? ''
                       : '失敗列編號 :' + data.errorRow.join(',')
                   }`,
                  color: '#2FA12F',
                  iconSmall: 'fa fa-check',
                  timeout: 4000,
                })
              },
            }
          )
        } else {
          $.smallBox({
            title: `請先上傳檔案`,
            color: '#D62728',
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      })
    },
    util: {
      fileName: '',
      upload_check: false,
      reportTable: undefined,
      reportTableList: undefined,
      dropzoneConfig: function dropzoneConfig(api) {
        const context = this
        return {
          url: api,
          paramName: 'file',
          addRemoveLinks: true,
          maxFilesize: 20, // MB
          acceptedFiles: '.csv',
          maxFiles: 1,
          dictResponseError: '上傳失敗',
          init: function init() {
            this.on('success', function (file, res) {
              context.upload_check = true
              $('#table_submit').show()
              let resData = res.data.fileInfo.fileContent.filter(
                (i, index) => index > 0
              )
              const fileType = res.data.fileInfo.fileType
              resData = resData.map((i) => (i = i == '' ? '---' : i))
              if (fileType === 'SMTStation') {
                context.fileName = file.name
                const arr = resData.filter((i, index) => index < 1)
                context.reportTableList.drawTable(arr)
                context.reportTable.drawTable(resData)
              } else {
                $('#table_submit').hide()
                $.smallBox({
                  title: `檔案內容與料站表格式不符 <br/> 
                  請移除後重新上傳`,
                  color: '#D62728',
                  iconSmall: 'fa',
                  timeout: 4000,
                })
              }
            })
            this.on('maxfilesexceeded', function () {
              $.smallBox({
                title: `檔案上傳數量上限為1`,
                content: '請先點擊 「Remove file」清除檔案',
                color: '#D62728',
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
            })
          },
        }
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

export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      context.reportTable = createReportTable({
        $tableElement: $('#DataList-table'),
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
        context.dropzoneConfig('api/ennoconn/filesyn/parseFile')
      )
      $('#table_submit').click(function () {
        if (context.upload_check) {
          servkit.ajax(
            {
              url: 'api/ennoconn/filesyn/billstockin',
              type: 'GET',
              data: `fileName=${context.fileName}`,
            },
            {
              success: function (data) {
                context.upload_check = false
                $('#table_submit').hide()
                $.smallBox({
                  title: `成功轉入
                  <hr/>
                   ${
                     data.insertRow.length === 0
                       ? ''
                       : '成功列編號 :' +
                         data.insertRow.join(',') +
                         '<br/><hr/>'
                   } 
                  ${
                    data.updateRow.length === 0
                      ? ''
                      : '覆蓋列編號 :' + data.updateRow.join(',') + '<br/><hr/>'
                  }
                   ${
                     data.errorRow.length === 0
                       ? ''
                       : '失敗列編號 :' + data.errorRow.join(',')
                   }<br/>
                   請至「入庫單品項綁定與PKGID條碼列印」功能中列印條碼`,
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
      TableArray: [],
      fileName: '',
      Btn: '',
      upload_check: false,
      reportTable: undefined,
      dropzoneConfig: function dropzoneConfig(api) {
        const context = this
        return {
          url: api,
          paramName: 'file',
          addRemoveLinks: true,
          maxFilesize: 20, // MB
          acceptedFiles: '.csv',
          maxFiles: 1,
          init: function init() {
            this.on('success', function (file, res) {
              context.upload_check = true
              $('#table_submit').show()
              const resData = res.data.fileInfo
              if (resData.fileType === 'StockIn') {
                context.fileName = file.name
                context.TableArray = []
                _.each(resData.fileContent, (val, key) => {
                  if (key >= 1) {
                    context.TableArray.push(val)
                  }
                })
                context.reportTable.drawTable(context.TableArray)
              } else {
                $('#table_submit').hide()
                $.smallBox({
                  title: `檔案內容與入庫單格式不符`,
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

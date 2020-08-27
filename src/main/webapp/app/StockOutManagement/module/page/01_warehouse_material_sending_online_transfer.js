export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      context.reportTable = createReportTable({
        $tableElement: $('#Warehousing-table'),
        $tableWidget: $('#csv-widget'),
        autoWidth: false,
        customBtns: [
          `<button id='table_submit' class='btn btn-primary btn-lg'>確定轉入</button>`,
        ],
      })
      context.reportTableList = createReportTable({
        $tableElement: $('#WarehousingList-table'),
        $tableWidget: $('#csv-widget'),
        autoWidth: false,
        customBtns: [
          `<button id='table_submit_list' class='btn btn-primary btn-lg'>確定轉入</button>`,
        ],
      })
      $('#WarehousingList-table_wrapper').hide()
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
              url: 'api/ennoconn/filesyn/billstockout-main',
              type: 'GET',
              data: `fileName=${context.file.fileName}`,
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
                       : '主檔成功列編號 :' +
                         data.insertRow.join(',') +
                         '<br/><hr/>'
                   } 
                  ${
                    data.updateRow.length === 0
                      ? ''
                      : '主檔覆蓋列編號 :' +
                        data.updateRow.join(',') +
                        '<br/><hr/>'
                  }
                   ${
                     data.errorRow.length === 0
                       ? ''
                       : '主檔失敗列編號 :' + data.errorRow.join(',')
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
      $('#table_submit_list').click(function () {
        if (context.upload_check) {
          servkit.ajax(
            {
              url: 'api/ennoconn/filesyn/billstockout-detail',
              type: 'GET',
              data: `fileName=${context.file.fileName}`,
            },
            {
              success: function (data) {
                context.upload_check = false
                $('#table_submit_list').hide()
                $.smallBox({
                  title: `成功轉入
                  <hr/>
                   ${
                     data.insertRow.length === 0
                       ? ''
                       : '明細成功列編號 :' +
                         data.insertRow.join(',') +
                         '<br/><hr/>'
                   } 
                  ${
                    data.updateRow.length === 0
                      ? ''
                      : '明細覆蓋列編號 :' +
                        data.updateRow.join(',') +
                        '<br/><hr/>'
                  }
                   ${
                     data.errorRow.length === 0
                       ? ''
                       : '明細失敗列編號 :' + data.errorRow.join(',')
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
      TableArray: [],
      file: '',
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
              const resData = res.data.fileInfo
              if (resData.fileType == 'StockOutMain') {
                context.TableArray = []
                $('#table_submit').show()
                _.each(resData.fileContent, (val, key) => {
                  if (key >= 1) {
                    context.TableArray.push(val)
                  }
                })
                context.file = {
                  fileName: file.name,
                  type: resData.fileType,
                }
                $('#WarehousingList-table_wrapper').hide()
                $('#Warehousing-table_wrapper').show()
                context.reportTable.drawTable(context.TableArray)
              } else if (resData.fileType == 'StockOutDetail') {
                context.TableArray = []
                $('#table_submit_list').show()
                _.each(resData.fileContent, (val, key) => {
                  if (key >= 1) {
                    context.TableArray.push(val)
                  }
                })
                context.file = {
                  fileName: file.name,
                  type: resData.fileType,
                }
                $('#WarehousingList-table_wrapper').show()
                $('#Warehousing-table_wrapper').hide()
                context.reportTableList.drawTable(context.TableArray)
              } else {
                $('#table_submit').hide()
                $.smallBox({
                  title: `檔案內容與出庫單格式不符 <br/> 
                  請移除後重新上傳`,
                  color: '#D62728',
                  iconSmall: 'fa fa-times',
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

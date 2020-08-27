import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var startTime
      // $(this).off('contextmenu');
      if (context.isGraced) {
        var params = context.graceParam
        context.machineId = params.machineId
        context.user = params.user
        context.password = params.password
        context.getFileList(context.machineId)
        context.$goBackPage.on('click', function (evt) {
          context.gogoAnother({
            appId: context.fromAppId,
            funId: context.fromFunId,
            currentTab: true,
          })
        })
      } else {
        context.gogoAnother({
          appId: 'ProgTransmit',
          funId: '03_fanuc_cnc_upload',
          currentTab: true,
        })
      }

      // ****************************** File Tree ******************************
      //這裡是對一些資料夾做的特效、優化 (就是開頭那個 ++ 還有資料夾的開合吧)
      $('.tree > ul').on('click', 'span', function (evt) {
        var $node = $(this).find('i').eq(0)
        if ($node.hasClass('fa-plus-circle')) {
          $node.removeClass()
          $node.addClass('fa fa-xs fa-minus-circle')
          $node.next('i').removeClass()
          $node.next('i').addClass('fa fa-xs fa-folder-open')
          var path = $node.parent('span').attr('name')
          context.currPath = path
          context.getFileList(context.machineId, context.currPath)
        } else if ($node.hasClass('fa-minus-circle')) {
          _.each(context.$fileContent.children('li.smv'), function (ele) {
            var path = $(ele).attr('name')
            if (context.downloadMap[path]) {
              delete context.downloadMap[path]
            }
          })
          context.$fileContent.html('')
          $node.removeClass()
          $node.addClass('fa fa-xs fa-plus-circle')
          $node.next('i').removeClass()
          $node.next('i').addClass('fa fa-xs fa-folder')
          $node.parent().siblings('ul').hide('fase').remove()
        }
      })
      //********************************************************************************

      //****************************** 中間檢視 的部份 ******************************
      context.$fileContent.on('click', '.open-folder', function (evt) {
        var $li = $(this).closest('li.smv')
        var path = $li.attr('name')
        var dom = document.getElementsByName(path)
        $(dom)
          .closest('span[name="' + path + '"]')
          .trigger('click')
      })

      context.$fileContent.on(
        'click',
        'input[name="checkbox-inline"]',
        function (evt) {
          var $li = $(this).closest('li.smv')
          var path = $li.attr('name')
          if ($(this).prop('checked')) {
            if (!context.downloadMap[path]) {
              context.downloadMap[path] = path
            }
          } else {
            if (context.downloadMap[path]) {
              delete context.downloadMap[path]
            }
          }
        }
      )
      //******************************************************************************************

      // ******************************上傳檔案的部份 ******************************
      context.$uploadBtn.on('click', function (evt) {
        context.$uploadList.toggle('fast')
      })

      context.$addFileBtn.on('click', function (evt) {
        context.$fileSelect.trigger('click')
      })

      context.$allUploadBtn.on('click', function (evt) {
        var $parent = $(this).parent()
        var $list = $parent.next()
        _.each($list.find('button[name="upload-file"]'), function (ele) {
          if ($(ele).prop('disabled') == false) {
            $(ele).trigger('click')
          }
        })
      })
      context.$allClearBtn.on('click', function (evt) {
        _.each(context.$uploadDetail.find('div.well'), function (ele) {
          delete context.uploadMap[ele.id]
        })
        context.$uploadDetail.html('')
      })

      context.$uploadDetail.on('click', 'button[name="clear-file"]', function (
        evt
      ) {
        var $div = $(this).closest('div.well')
        var formId = $div.attr('id')
        $(this).closest('div.well').remove()
        delete context.uploadMap[formId]
      })

      context.$uploadDetail.on('click', 'button[name="upload-file"]', function (
        evt
      ) {
        var uploadBtn = $(this)
        var clearBtn = $(this).next('button[name="clear-file"]')
        var $path = $(this).closest('div.well').find('span.file-root').eq(0)
        var $name = $(this).closest('div.well').find('span.file-name').eq(0)
        var $status = $(this).closest('div.well').find('span.file-status').eq(0)
        // var deleteBtn = $(this).next('button[name="delete-file"]');
        uploadBtn.prop('disabled', true)
        var $div = $(this).closest('div.well')
        var formId = $div.attr('id')
        var progress = $(this).closest('div.well').find('.progress-bar')[0]
        var file = context.uploadMap[formId]
        var xhr = new XMLHttpRequest()
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var intComplete = ((e.loaded / e.total) * 100) | 0
            progress.innerHTML = intComplete + '%' // 控制進度條
            progress.style.width = intComplete + '%' // 控制進度條的長度
            progress.setAttribute('aria-valuenow', intComplete)
          }
        }
        xhr.onload = function (e) {
          var startTimeFormat = moment(startTime).format(
            'YYYY-MM-DD HH:mm:ss.SSS'
          )
          var endTime = new Date()
          var endTimeFormat = moment(endTime).format('YYYY-MM-DD HH:mm:ss.SSS')
          var dotPosition = file.name.lastIndexOf('.')
          var programName = file.name.substring(0, dotPosition)

          var type = JSON.parse(xhr.response).type
          var statusText
          if (type === 0) {
            context.recordProgramCommand(
              context.machineId,
              'Upload',
              startTimeFormat,
              endTimeFormat,
              'Success',
              programName
            )
            statusText = setInterval(function () {
              $status.fadeIn(1500)
              $status.fadeOut(1500)
              servkit.ajax(
                {
                  url: 'api/filemanagement/getFileStatus',
                  type: 'GET',
                  data: { key: formId },
                },
                {
                  success: function (data) {
                    if (data !== 'wait') {
                      clearInterval(statusText)
                      $status.fadeIn(0)
                      $status.css({ 'font-style': 'normal', 'color': 'blue' })
                      $status.text(`${i18n('CNC_Data_Server_0014')}`)
                    }
                  },
                  fail: function (data) {
                    console.log(data)
                    clearInterval(statusText)
                    $status.fadeIn(0)
                    $status.css({ 'font-style': 'normal', 'color': 'red' })
                    $status.text(`${i18n('CNC_Data_Server_0015')}`)
                  },
                }
              )
            }, 3000)
          } else {
            context.recordProgramCommand(
              context.machineId,
              'Upload',
              startTimeFormat,
              endTimeFormat,
              'Fail',
              programName
            )
          }
        }

        xhr.onreadystatechange
        var url = window.location.toString()
        var rootUrl = url.split('//')[1]
        var ipAddress = rootUrl.substring(0, rootUrl.indexOf('/'))
        var apiURL =
          'http://' + ipAddress + '/ServCloud/api/filemanagement/upload'
        xhr.open('POST', apiURL)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('path', $path.text())
        formData.append('machine_id', context.machineId)
        formData.append('key', formId)
        formData.append('user', context.user)
        formData.append('password', context.password)
        startTime = new Date()
        xhr.send(formData)
        delete context.uploadMap[formId]
      })

      // ***************************************************************************

      //****************************** 中間那一排按鈕 ******************************
      context.$downloadBtn.on('click', function (evt) {
        evt.preventDefault()
        var downLen = Object.keys(context.downloadMap).length
        if (downLen > 0) {
          context.smallBox({
            title: `${i18n('CNC_Data_Server_0016')}...`,
            color: 'green',
            content: downLen + ` ${i18n('CNC_Data_Server_0017')}`,
            icon: 'fa fa-arrow-circle-o-down',
            timeout: 2000,
          })
          _.each(_.keys(context.downloadMap), function (key) {
            context.download(context.machineId, key)
          })
        } else {
          context.smallBox({
            title: `${i18n('CNC_Data_Server_0018')}...`,
            color: 'yellow',
            content: `${i18n('CNC_Data_Server_0019')}...`,
            icon: 'fa fa-frown-o',
            timeout: 2000,
          })
        }
      })

      context.$createFolderBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$modalCurrPath.val(context.currPath)
        context.$modalCreateName.val('')
        context.$createFolderModal.modal()
      })

      context.$refreshBtn.on('click', function (evt) {
        evt.preventDefault()
        context.downloadMap = {}
        context.getFileList(context.machineId, context.currPath)
      })

      context.$fileSelect.on('change', function (evt) {
        _.each(this.files, function (file) {
          // console.log(file);
          context.addFile(file)
        })
        context.$fileSelect.val('')
      })

      context.$deleteBtn.on('click', function (evt) {
        evt.preventDefault()
        var delFileArr = []
        _.each(
          context.$fileList.find('input[name="checkbox-inline"]'),
          function (ele) {
            if ($(ele).prop('checked') === true) {
              var path = $(ele).closest('li.smv').attr('name')
              delFileArr.push(path)
            }
          }
        )
        if (delFileArr.length > 0) {
          context.showDialog(delFileArr)
        }
      })

      //******************************************************************************************
      //****************************** modal ***********************************
      context.$modalSubmitBtn.on('click', function (evt) {
        evt.preventDefault()
        var path = context.$modalCurrPath.val()
        var folderName = context.$modalCreateName.val()
        context.createFolder(path, folderName)
      })

      //************************************************************************

      //****************************** 這邊是拖拉的 ******************************
      // context.$fileList.on('dragover', function (evt) {
      //   evt.preventDefault();
      // });
      $(window).on('dragover', function (evt) {
        evt.preventDefault()
      })
      $(window).on('drop', function (evt) {
        evt.preventDefault()
        _.each(evt.originalEvent.dataTransfer.files, function (file) {
          context.addFile(file)
        })
      })
      // context.$fileList.on('drop', function (evt) {
      //   evt.preventDefault();
      //   _.each(evt.originalEvent.dataTransfer.files, function (file) {
      //     context.addFile(file);
      //   });
      // });
      //******************************************************************************************
    },
    util: {
      recordProgramCommand: function recordProgramCommand(
        machineId,
        action,
        command_start_time,
        command_end_time,
        result,
        program
      ) {
        $.ajax({
          url: 'api/v3/servcore/record/cnc/programCommand',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            machine: machineId,
            action: action,
            command_start_time: command_start_time,
            command_end_time: command_end_time,
            result: result,
            program: program,
          }),
        })
      },
      maxFileSize: 1073741824,
      machineId: '', //機台
      currPath: '', //當前路徑
      user: '',
      password: '',
      $goBackPage: $('#go-back-page'),
      $home: $('#home'), //根節點
      downloadMap: {}, //有勾選要下載的話 會紀錄相關資訊
      uploadMap: {}, //上傳的的 map
      $createFolderModal: $('#create-folder-modal'),
      // selectDownload:0,
      $forms: $('#forms'), //下載的 隱藏form
      $uploadList: $('#upload_list'), //上傳檔案 最外層的 div
      $uploadDetail: $('#upload_detail'), //上傳檔案的詳細資訊的 div
      $uploadBtn: $('#upload_btn'), // 最上面那一排的 上傳按鈕
      $createFolderBtn: $('#create_folder_btn'), //新增資料夾按鈕
      $downloadBtn: $('#download_btn'), // 最上面那一排的 下載按鈕
      $refreshBtn: $('#refresh_btn'), // 最上面 重整的按鈕
      $deleteBtn: $('#delete_btn'),
      $downloadCount: $('#download_count'),
      $fileList: $('#file-list'), // 檔案檢視 最外層的 div
      $fileContent: $('#file-content'), // 檔案檢視的 div
      $fileSelect: $('#file_select'), //input File 隱藏
      $addFileBtn: $('#add_file_btn'), //新增檔案的按鈕
      $allUploadBtn: $('#all_upload_btn'), //全部上傳的 按鈕
      $allClearBtn: $('#all_clear_btn'), //清除全部的 按鈕
      $modalCurrPath: $('#modal_currPath'),
      $modalCreateName: $('#modal_create_name'),
      $modalSubmitBtn: $('#create_modal_submit'),
      $deleteCheckDialog: $('<div id="deleteCheckDialog"></div>'),
      // rootPathName: '/',
      getFileList: function (machineId, path) {
        var that = this
        var param = {}
        if (path) {
          param['machine_id'] = machineId
          param['path'] = path
          param['user'] = that.user
          param['password'] = that.password
        } else {
          param['machine_id'] = machineId
          param['user'] = that.user
          param['path'] = '/'
          param['password'] = that.password
        }
        servkit.ajax(
          {
            url: 'api/filemanagement/getFileList',
            type: 'GET',
            data: param,
          },
          {
            success: function (data) {
              console.log(data)
              that.drawTree(data)
              that.drawView(data)
            },
            fail: function (data) {
              var actionResult = that.parseMsg(data[0].errorMsg)
              console.log(actionResult.msg)
              that.smallBox({
                title: `${i18n('CNC_Data_Server_0020')}`,
                color: 'yellow',
                content: actionResult.result,
                icon: 'fa fa-frown-o',
                timeout: 2000,
              })
            },
          }
        )
      },
      download: function (machineId, key) {
        var that = this
        var hiddenFormId, targetName
        hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')
        targetName = 'download_target' + hiddenFormId
        var $submitForm = $('<form name="' + hiddenFormId + '"></form>')
        var iframeHtml =
          '<iframe name="' +
          targetName +
          '" style="width:0;height:0;border:0px solid #fff;""></iframe>'
        $submitForm.append(
          $('<input>').attr('name', 'machine_id').val(machineId)
        )
        $submitForm.append($('<input>').attr('name', 'path').val(key))
        $submitForm.append($('<input>').attr('name', 'user').val(that.user))
        $submitForm.append(
          $('<input>').attr('name', 'password').val(that.password)
        )
        $submitForm.attr({
          action: 'api/filemanagement/download',
          method: 'post',
          target: targetName,
        })
        that.$forms.append($submitForm.hide())
        $submitForm.append(iframeHtml)
        document.querySelector('[name="' + hiddenFormId + '"]').submit()
      },

      /**
       * 這是一個長樹的方法
       * 首先丟進來的會是一個 List<Object>
       * Object = {
       *            parentPath:"/1/2/3/4", 父目錄
       *            name:"Test.zip", 檔名,
       *            isDirectory: true, 是不是Folder
       *            lastModifyTime: 2018/02/09, 之類的如果有的話
       *            size: 檔案大小(如果有拿到的話)
       *          }
       **/
      drawTree: function (data) {
        var that = this
        var doc = document
        _.each(data, function (fileInfo) {
          var parentPath = fileInfo.parentPath
          var fileName = fileInfo.name
          if (!parentPath.endsWith('/')) {
            parentPath += '/'
          }
          if (that.currPath === '') {
            that.currPath = parentPath
          }
          if (doc.getElementsByName(parentPath).length == 0) {
            var span = $(
              '<span name="' +
                parentPath +
                '"><i class="fa fa-xs fa-minus-circle"></i></span>'
            )
            var i = $(
              '<i class="fa fa-xs fa-folder-open">' + parentPath + '</i>'
            )
            span.append(i)
            that.$home.append(span)
            that.appendChildNode(parentPath, fileName, fileInfo.isDirectory)
          } else {
            that.appendChildNode(parentPath, fileName, fileInfo.isDirectory)
          }
        })
      },
      appendChildNode: function (parentPath, fileName, isDirectory) {
        var that = this
        var doc = document
        if (!parentPath.endsWith('/')) {
          parentPath += '/'
        }
        var parentNode = doc.getElementsByName(parentPath)

        var ul = $('<ul role="tree"></ul>')
        var span = $('<span></span')
        var li = $('<li class="parent_li" role="treeitem"></li>')
        var i = $('<i></i>')
        if ($(parentNode).parent().find(' > ul').length) {
          var $ul = $(parentNode).parent().find(' > ul')
          if (isDirectory) {
            span.attr('name', parentPath + fileName + '/')
            $(i).addClass('fa fa-xs fa-folder')
            span.append('<i class="fa fa-xs fa-plus-circle"></i>')
          } else {
            span.append('<i class="fa fa-xs fa-file-archive-o"></i>')
            span.attr('name', parentPath + fileName)
          }
          if (
            doc.getElementsByName(parentPath + fileName + '/').length == 0 &&
            doc.getElementsByName(parentPath + fileName).length == 0
          ) {
            i.append(fileName)
            span.append(i)
            li.append(span)
            $ul.append(li)
          }
        } else {
          if (isDirectory) {
            $(i).addClass('fa fa-xs fa-folder')
            span.attr('name', parentPath + fileName + '/')
            span.append('<i class="fa fa-xs fa-plus-circle"></i>')
          } else {
            span.append('<i class="fa fa-xs fa-file-archive-o"></i>')
            span.attr('name', parentPath + fileName)
          }
          i.append(fileName)
          span.append(i)
          li.append(span)
          ul.append(li)
          $(parentNode).after(ul)
        }
      },
      drawView: function (data) {
        var that = this
        that.$fileContent.html('')
        _.each(data, function (fileInfo) {
          var parentPath = fileInfo.parentPath
          var fileName = fileInfo.name
          if (!parentPath.endsWith('/')) {
            parentPath += '/'
          }
          var $li = $('<li class="smv"></li>')
          var $div = $('<div class="well well-sm"></div>')
          var $ul = $('<ul class="list-unstyled"></ul>')
          var $labelBox = $(
            '<li align="right"><input type="checkbox" name="checkbox-inline"></li>'
          )
          var $imgLi = $('<li align="center" style="line-height:30px;"></li>')
          var $i = $('<i style="font-size:50px;"></i>')
          var $nameLi = $('<li align="center" style="line-height:30px;"></li>')
          var $nameSpan = $('<span style="display: block;"></span')
          if (fileInfo.isDirectory) {
            $li.attr('name', parentPath + fileName + '/')
            $i.addClass('fa fa-lg fa-folder-o')
            $imgLi.append($i)
            $nameSpan.text(fileName)
            $nameLi.append($nameSpan)
            $ul.append(
              $(
                '<li align="right"><button class="btn btn-xs btn-default open-folder"><span class="fa fa-plus"></span></button></li>'
              )
            )
            $ul.append($imgLi)
            $ul.append($nameLi)
            $div.append($ul)
            $li.append($div)
            that.$fileContent.append($li)
          } else {
            $li.attr('name', parentPath + fileName)
            $i.addClass('fa fa-lg fa-file-archive-o')
            $imgLi.append($i)
            $nameSpan.text(fileName)
            $nameLi.append($nameSpan)
            $ul.append($labelBox)
            $ul.append($imgLi)
            $ul.append($nameLi)
            $div.append($ul)
            $li.append($div)
            that.$fileContent.append($li)
          }
        })
      },
      addFile: function (file) {
        var that = this
        var hiddenFormId
        if (file.size > that.maxFileSize) {
          that.smallBox({
            title: file.name + ` ${i18n('CNC_Data_Server_0021')}...`,
            color: 'yellow',
            content: `${i18n('CNC_Data_Server_0022')}`,
            icon: 'fa fa-frown-o',
            timeout: 2000,
          })
          return
        }
        hiddenFormId =
          'hiddenFormId_upload' + moment().format('YYYYMMDDHHmmssSSSS')
        var $divRow = $(
          '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 well well-sm" style="margin-top: 5px;"></div>'
        )
        var $divRoot = $(
          `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">${i18n(
            'CNC_Data_Server_0023'
          )}: <span class="file-root"></span></div>`
        )
        var $divFileName = $(
          `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">${i18n(
            'CNC_Data_Server_0024'
          )}: <span class="file-name"></span></div>`
        )
        var $divFileSize = $(
          '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>'
        )
        var $divFileSizeStr = $(
          `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">${i18n(
            'CNC_Data_Server_0025'
          )}: <span class="file-size-text"></span></div>`
        )
        var $divFileProg = $('<div></div>')
        var $divStatus = $(
          `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="margin-bottom: 5px;"><span class="file-status" style="font-style: italic;display: none;">${i18n(
            'CNC_Data_Server_0026'
          )}...</span></div>`
        )
        var $divFileBar = $(
          '<div class="progress-bar progress-bar-success" style="width:0%"></div>'
        )
        var $divActions = $(
          '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>'
        )
        var $startBtn = $(
          `<button name="upload-file" class="btn btn-xs btn-success pull-left" style="margin:2px;"><i class="glyphicon glyphicon-upload"></i><span>${i18n(
            'CNC_Data_Server_0027'
          )}</span></button`
        )
        var $clearBtn = $(
          `<button name="clear-file" class="btn btn-xs btn-warning pull-left" style="margin:2px;"><i class="glyphicon glyphicon-ban-circle"></i><span>${i18n(
            'CNC_Data_Server_0028'
          )}</span></button`
        )
        // var $delBtn = $('<button name="delete-file" class="btn btn-xs btn-danger pull-left" style="display:none;margin:2px;"><i class="glyphicon glyphicon-trash"></i><span>刪除</span></button');
        $divActions.append($startBtn)
        $divActions.append($clearBtn)
        // $divActions.append($delBtn);
        $divFileProg.append($divFileBar)
        $divFileProg.addClass('progress')
        $divFileProg.attr('role', 'progressbar')

        //標示上傳位置的folder
        $divRoot.children('.file-root').text(that.currPath)
        $divFileName.children('.file-name').text(file.name)
        $divFileSizeStr
          .children('.file-size-text')
          .text(that.parseSize(file.size))
        $divFileSize.append($divFileProg)
        $divRow.attr('id', hiddenFormId)
        that.uploadMap[hiddenFormId] = file
        $divRow.append($divRoot)
        $divRow.append($divFileName)
        $divRow.append($divFileSizeStr)
        $divRow.append($divFileSize)
        $divRow.append($divStatus)
        $divRow.append($divActions)
        that.$uploadDetail.append($divRow)
        if (that.$uploadList.is(':hidden') == true) {
          that.$uploadList.toggle('fast')
        }
      },
      createFolder: function (path, folderName) {
        var that = this
        servkit.ajax(
          {
            url: 'api/filemanagement/createFolder',
            type: 'GET',
            data: {
              path: path + folderName,
              machine_id: that.machineId,
              user: that.user,
              password: that.password,
            },
          },
          {
            success: function (data) {
              var actionResult = that.parseMsg(data)
              that.smallBox({
                title: `${i18n('CNC_Data_Server_0029')}...`,
                color: 'green',
                content: actionResult.result,
                icon: 'fa fa-arrow-circle-o-down',
                timeout: 2000,
              })
              that.$createFolderModal.modal('toggle')
              that.$refreshBtn.trigger('click')
            },
            fail: function (data) {
              var actionResult = that.parseMsg(data)
              console.log(actionResult.msg)
              that.smallBox({
                title: `${i18n('CNC_Data_Server_0030')}`,
                color: 'yellow',
                content: actionResult.result,
                icon: 'fa fa-frown-o',
                timeout: 2000,
              })
            },
          }
        )
      },
      parseSize: function (fileSize) {
        var text = 'B'
        var tb = 1099511627776,
          gb = 1073741824,
          mb = 1048576,
          kb = 1024
        if (fileSize >= tb) {
          text = ' TB'
          var size = fileSize / tb
          size = size.toFixed(2)
          return (size += text)
        } else if (fileSize >= gb) {
          text = ' GB'
          var size2 = fileSize / gb
          size2 = size2.toFixed(2)
          return (size2 += text)
        } else if (fileSize >= mb) {
          text = ' MB'
          var size3 = fileSize / mb
          size3 = size3.toFixed(2)
          return (size3 += text)
        } else if (fileSize >= kb) {
          text = ' KB'
          var size4 = fileSize / kb
          size4 = size4.toFixed(2)
          return (size4 += text)
        } else {
          var size5 = fileSize.toFixed(2)
          return (size5 += text)
        }
      },
      smallBox: function (params) {
        var smallBoxColor = {
          green: '#739E73',
          red: '#C46A69',
          yellow: '#C79121',
        }
        var content = params.content
        if (!content) {
          content = ''
        }
        var timeText = params.timeout / 1000
        $.smallBox({
          title: params.title,
          content:
            "<i class='fa fa-clock-o'></i>" +
            content +
            '<i>' +
            timeText +
            ' seconds ago...</i>',
          color: smallBoxColor[params.color],
          iconSmall: params.icon,
          timeout: params.timeout,
        })
      },
      showDialog: function (delFileArr) {
        var startTime = new Date()
        var that = this
        var filesLength = delFileArr.length
        var $div = $('<div></div>')
        _.each(delFileArr, function (filePath) {
          var $p = $('<p></p>')
          $p.text(filePath)
          $div.append($p)
        })
        that.$deleteCheckDialog.dialog({
          autoOpen: false,
          width: 600,
          resizable: false,
          modal: true,
          title: `<div class='widget-header'><h4><i class='fa fa-warning'></i> ${i18n(
            'CNC_Data_Server_0031'
          )} </h4></div>`,
          buttons: [
            {
              html: '<i class="fa fa-trash-o"></i>&nbsp; ',
              class: 'btn btn-danger',
              click: function () {
                var closeDialog = $(this)
                var count = 0

                for (var i = 0; i < filesLength; i++) {
                  var path = delFileArr[i]
                  servkit.ajax(
                    {
                      url: 'api/filemanagement/delete',
                      type: 'GET',
                      data: {
                        path: path,
                        machine_id: that.machineId,
                        user: that.user,
                        password: that.password,
                      },
                    },
                    {
                      success: function (data) {
                        var startTimeFormat = moment(startTime).format(
                          'YYYY-MM-DD HH:mm:ss.SSS'
                        )
                        var endTime = new Date()
                        var endTimeFormat = moment(endTime).format(
                          'YYYY-MM-DD HH:mm:ss.SSS'
                        )
                        var slashPosistion = path.lastIndexOf('/')
                        var dotPosition = path.indexOf('.')
                        var programName = path.substring(
                          slashPosistion,
                          dotPosition
                        )
                        that.machineId.recordProgramCommand(
                          that.machineId,
                          'Delete',
                          startTimeFormat,
                          endTimeFormat,
                          'Success',
                          programName
                        )
                        // var actionResult = that.parseMsg(data);
                        count += 1
                        that.smallBox({
                          title: `${i18n('CNC_Data_Server_0032')}`,
                          color: 'green',
                          content: 'success',
                          icon: 'fa fa-arrow-circle-o-down',
                          timeout: 2000,
                        })
                        if (count == filesLength) {
                          closeDialog.dialog('close')
                          that.$refreshBtn.trigger('click')
                        }
                        //  closeDialog.dialog('close');
                      },
                      fail: function (data) {
                        var startTimeFormat = moment(startTime).format(
                          'YYYY-MM-DD HH:mm:ss.SSS'
                        )
                        var endTime = new Date()
                        var endTimeFormat = moment(endTime).format(
                          'YYYY-MM-DD HH:mm:ss.SSS'
                        )
                        var slashPosistion = path.lastIndexOf('/')
                        var dotPosition = path.indexOf('.')
                        var programName = path.substring(
                          slashPosistion,
                          dotPosition
                        )
                        that.recordProgramCommand(
                          that.machineId,
                          'Delete',
                          startTimeFormat,
                          endTimeFormat,
                          'Fail',
                          programName
                        )

                        var actionResult = that.parseMsg(data)
                        console.log(actionResult.msg)
                        count += 1
                        that.smallBox({
                          title: path + ` ${i18n('CNC_Data_Server_0033')}...`,
                          color: 'yellow',
                          content: actionResult.result,
                          icon: 'fa fa-frown-o',
                          timeout: 2000,
                        })
                        if (count == filesLength) {
                          closeDialog.dialog('close')
                          that.$refreshBtn.trigger('click')
                        }
                      },
                    }
                  )
                }
              },
            },
            {
              html: '<i class="fa fa-times"></i>&nbsp;',
              class: 'btn btn-default',
              click: function () {
                $(this).dialog('close')
              },
            },
          ],
        })

        that.$deleteCheckDialog.html($div.html())
        that.$deleteCheckDialog.dialog('open')
      },
      parseMsg: function (errStr) {
        var that = this
        var resultStart = errStr.indexOf('[')
        var resultEnd = errStr.lastIndexOf(']')
        var result = errStr.substring(resultStart + 1, resultEnd)
        var msg = errStr.substring(resultEnd + 1)
        return {
          result: result,
          msg: msg,
        }
      },
    },
    // contextMenu: {
    //   targetSelector: document,
    //   filterSelector: 'triggered element',
    //   anotherList: [
    //     {
    //       appId: 'ProgTransmit',
    //       funId: '04_file_management',
    //       currentTab: false, // optional(default fasle)
    //       graceTag: 'tagName',
    //       graceParamBuilder: function (targetEle) {
    //        console.log(targetEle);
    //       }
    //     }
    //   ]
    // }
  })
}

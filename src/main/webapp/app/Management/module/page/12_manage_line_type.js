export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('test')
      context.initDialogs(context)
      context.initLineTypeCRUDTable(context)
      context.initLineCRUDTable(context)
      //    context.initDropzone();
      //    context.tab2Event();
    },
    util: {
      tempOpNum: 0,
      machineNumArray: [],
      machineSelectHtml: _.map(servkit.getMachineList(), function (id) {
        return (
          '<option value="' +
          id +
          '">' +
          servkit.getMachineName(id) +
          '</option>'
        )
      }).join(''),
      //    initDropzone: function () {
      //      $('#mydropzone').dropzone({
      //        autoProcessQueue: false,
      //        url: "api/lineMachine/upload",
      //        acceptedFiles: ".csv",
      //        dictInvalidFileType: "檔案格式須為csv",
      //        addRemoveLinks: true,
      //        accept: function (file, done) {
      //          //if(file.previewElement.class != "dz-preview dz-file-preview dz-error" && this.options.url=="api/lineMachine/upload"){
      //          //done();
      //          //this.options.url = "api/lineMachine/upload";
      //          //this.processFile(file);
      //          //console.log("here");
      //          //$(".progress-bar progress-bar-success").get(0).style = "width:100%";
      //          //console.log(file);
      //          //}
      //          //console.log(file.value);
      //        },
      //        init: function () {
      //          this
      //              .on("addedfile", function (file, formData) {
      //                this.options.url = "api/lineMachine/checkFile";
      //
      //                /*if (file.type != "application/vnd.ms-excel") {
      //                 console.log(file);
      //                 file.previewElement.className= "dz-preview dz-file-preview dz-error";
      //                 file.previewElement.childNodes[9].textContent = "檔案格式須為csv";
      //                 }else{*/
      //
      //                //var name = file.name;
      //                this.processFile(file);
      //                console.log(file);
      //                console.log(file.value);
      //                console.log(file.upload);//        console.log(file.getAsBinary());
      /// /        console.log(mydropzone);
      /// / }
      //              })
      //              .on('success', function (file, res) {
      //                var $fileResult = $(file.previewElement);
      //                //if (res.type) {
      //                switch (res.type) {
      //                  case 0:
      //                    if (this.options.url == "api/lineMachine/upload") {
      //                      //var su = document.createElement('span');
      //                      //su.appendChild(document.createTextNode(" success !! "));
      //                      //file.previewElement.childNodes[1].childNodes[1].appendChild(document.createElement('br'));
      //                      //file.previewElement.childNodes[1].childNodes[1].appendChild(su);
      //                      $fileResult.find('.dz-filename').append("<p class=\"alert alert-success\"><span class=\"glyphicon glyphicon-saved\"></span><span> Success</span></p>");
      //                    } else {
      //                      file.previewElement.className = "dz-preview dz-file-preview dz-success";
      //                      file.finished = 0;
      //                      var typeName = res.data.substring(res.data.indexOf("#")),
      //                          typeId = res.data.substring(res.data.indexOf("*") + 1, res.data.indexOf("#"));
      //
      //                      file.typeId = typeId;
      //                      var sp = document.createElement('span');
      //                      sp.appendChild(document.createTextNode("type : " + typeName));
      //                      file.previewElement.childNodes[1].childNodes[1].appendChild(document.createElement('br'));
      //                      file.previewElement.childNodes[1].childNodes[1].appendChild(sp);
      //                      //this.options.url = "api/lineMachine/upload";
      //
      //                    }
      //                    // this.processFile(file)
      //                    //$fileResult.find('.dz-progress').removeClass('dz-progress').addClass('progress');
      //                    //$fileResult.find('progress').append("<div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"100\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:100%\"/>");
      //                    //       "<div class=\"progress\">  <div class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:70%"> <span class="sr-only">70% Complete</span></div></div>)
      //                    break;
      //                  case 1:
      //                  case 999:
      //                  default:
      //                    $fileResult.removeClass('dz-success').addClass('dz-error');
      //                    $fileResult.find('.dz-error-message span')
      //                        .text(res.data.substring(res.data.indexOf("*") + 1))
      //                        .css('color', '#fff')
      //                        .parent()
      //                        .css('background-color', 'rgba(0, 0, 0, 0.8)');
      //                    break;
      //                }
      //                //if(this.options.url=="api/lineMachine/checkFile"){
      //                //file.status = "added";
      //                //}
      //                //}
      //              })
      //              .on('sending', function (file, xhr, formData) {
      //                if (this.options.url == "api/lineMachine/checkFile") {
      //                  var name = file.name;
      //                  formData.append('line-type', name.substring(0, name.indexOf(".")));
      //                } else {
      //                  formData.append('type-id', file.typeId);
      //                }
      //              });
      //
      //          var myDropzone = this;
      //
      //          $("#uploadBtn").bind("click", function (e) {
      //            // Make sure that the form isn't actually being sent.
      //            myDropzone.options.url = "api/lineMachine/upload";
      //
      //            e.preventDefault();
      //            e.stopPropagation();
      //            console.log(myDropzone.files);
      //            _.each(myDropzone.files, function (ele, i) {
      //              if (ele.previewElement.class != "dz-preview dz-file-preview dz-error" && ele.finished == 0) {
      //                ele.finished = 1;
      //                myDropzone.processFile(ele);
      //              }
      //            });
      //          });
      //        }
      //      });
      //    },
      //    tab2Event: function () {
      //      $("#t2").click(function () {
      //        //當地二個分頁被點選時,自動更新select的options
      //        servkit.ajax({
      //          url: 'api/lineType/typeList',
      //          type: "GET"
      //        }, {
      //          success: function (data) {
      //            var $typeSel = $("#type-selector"),
      //                o;
      //
      //            $typeSel.children().remove();
      //
      //            _.each(data, function (ele, i) {
      //              o = o + "<option value=\"" + ele['type_id'] + "\">" + ele['type_name'] + "</option>";
      //            });
      //            $typeSel.append(o);
      //          }
      //        })
      //      });
      //
      //      $("#choose-note").hide();
      //
      //      $("#downloadBtn").click(function (e) {
      //        e.preventDefault();
      //        var $typeSel = $("#type-selector option:selected"),
      //            hiddenFormId;
      //
      //        if ($("#type-selector").find("option:selected").val() === "0") {
      //          $("#type-selector-state").attr('class', 'input state-error');
      //          $("#choose-note").show();
      //        } else {
      //          $("#type-selector-state").attr('class', 'input');
      //          $("#choose-note").hide();
      //          (hiddenFormId && $('#' + hiddenFormId).remove());
      //          hiddenFormId = 'download-line-type-' + moment().format('YYYYMMDDHHmmssSSSS');
      //
      //          var $submitForm = $('<form id="' + hiddenFormId + '"></form>'),
      //              iframeHtml = '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>';
      //          $submitForm.append($('<input>').attr('name', 'type_id').val($typeSel.val()));
      //          $submitForm.append($('<input>').attr('name', 'type_name').val($typeSel.text()));
      //
      //          $submitForm.attr({
      //            'action': 'api/lineType/download',
      //            'method': 'get',
      //            'target': 'download_target'
      //          });
      //          $(this).after($submitForm.hide());
      //          $submitForm.append(iframeHtml);
      //
      //          document.querySelector('#' + hiddenFormId).submit();
      //        }
      //      });
      //    },
      initLineTypeCRUDTable: function (context) {
        var opTableViewHead =
          '<table id="inbox-table" class="table table-striped table-hover text-center">' +
          '  <thead>' +
          '    <tr>' +
          '     <th class="text-center">　#</th>' +
          '     <th class="text-center">製程名稱</th>' +
          '     <th class="text-center">製程描述</th>' +
          '     <th class="text-center">機台數量</th>' +
          '    </tr>' +
          '  </thead>' +
          '<tbody>'
        var opTableViewTail = '</tbody></table>'
        var opView = function (opSeq, opName, opDesc, machineNum) {
          return (
            '<tr class="op-view">' +
            '<td style="width:15%;">' +
            '<span class="label label-default">' +
            opSeq +
            '</span>' +
            '</td>' +
            '<td style="width:30%;">' +
            '<div>' +
            (opName || '') +
            '</div>' +
            '</td>' +
            '<td style="width:40%;">' +
            '<div>' +
            (opDesc || '') +
            '</div>' +
            '</td>' +
            '<td style="width:15%;">' +
            '<div>' +
            (machineNum.toString() || '') +
            '</div>' +
            '</td>' +
            '</tr>'
          )
        }
        var createAndUpdateSend = function (tdEles) {
          return {
            type_id: JSON.parse(tdEles[0].parentNode.getAttribute('stk-db-id')),
            type_name: tdEles[0].querySelector('input').value,
            op: (function () {
              return _.map(tdEles[2].querySelectorAll('.opTr'), function (tr) {
                return {
                  op_seq: tr.querySelector('span').textContent,
                  op_name: tr.querySelectorAll('input')[0].value,
                  op_desc: tr.querySelector('textarea').value,
                  machine_num: tr.querySelectorAll('input')[1].value,
                }
              })
            })(),
          }
        }
        var createAndUpdateEnd = {
          3: function (td) {
            var result = _.map(td.querySelectorAll('tr.opTr'), function (tr) {
              return opView(
                tr.querySelector('td').textContent,
                tr.querySelector('input').value,
                tr.querySelector('textarea').value,
                tr.querySelectorAll('input')[1].value
              )
            })
            result.unshift(opTableViewHead)
            result.push(opTableViewTail)
            return result.join('')
          },
        }
        var createAndUpdateAndDeleteFinalDo = function () {
          context.initLineCRUDTable(context)
        }

        servkit.crudtable({
          tableSelector: '#line-type-table',
          create: {
            url: 'api/lineType/create',
            start: function (tdEles) {
              $(tdEles[1]).find('input').spinner() // op_num
              $(tdEles[2]).find('.spinner').spinner() // op
              context.machineNumArray = [1] // init
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: createAndUpdateAndDeleteFinalDo,
          },
          read: {
            url: 'api/lineType/read',
            end: {
              3: function (data) {
                var result = _.map(
                  data.sort(function (a, b) {
                    return a.op_seq - b.op_seq
                  }),
                  function (e) {
                    return opView(e.op_seq, e.op_name, e.op_desc, e.machine_num)
                  }
                )
                result.unshift(opTableViewHead)
                result.push(opTableViewTail)
                return result.join('')
              },
            },
          },
          update: {
            url: 'api/lineType/update',
            start: {
              2: function (oldTd, newTd) {
                newTd.querySelector('input').value = oldTd.textContent
                context.tempOpNum = parseInt(oldTd.textContent)
                $(newTd).find('input').spinner()
              },
              3: function (oldTd, newTd) {
                context.machineNumArray = []
                var values = _.map(
                  oldTd.querySelectorAll('tbody>tr'),
                  function (tr) {
                    var $tdEles = $(tr).find('td')
                    context.machineNumArray.push(
                      parseInt($tdEles[3].querySelector('div').textContent)
                    )
                    return [
                      $tdEles[1].querySelector('div').textContent, // op_name
                      $tdEles[2].querySelector('div').textContent, // op_desc
                      $tdEles[3].querySelector('div').textContent, // machine_num
                    ]
                  }
                )
                if (values.length > 1) {
                  var inputGroupCloneTemp = newTd.querySelector('.opTr')
                  var opTbody = newTd.querySelector('tbody')
                  _.each(_.range(values.length - 1), function () {
                    opTbody.appendChild(inputGroupCloneTemp.cloneNode(true))
                  })
                }
                _.each(newTd.querySelectorAll('tbody>tr'), function (e, i) {
                  e.querySelector('span').textContent = i + 1 // i start form 0
                  var inputEles = e.querySelectorAll('input')
                  inputEles[0].value = values[i][0] // op_name
                  e.querySelector('textarea').value = values[i][1] // op_desc
                  inputEles[1].value = values[i][2] // machine_num
                })

                $(newTd).find('.spinner').spinner()
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: createAndUpdateAndDeleteFinalDo,
          },
          delete: {
            url: 'api/lineType/delete',
            contentFunc: function () {
              return '刪除 產線類別 將一併刪除屬於該 產線類別 的所有 產線 ！'
            },
            finalDo: createAndUpdateAndDeleteFinalDo,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return '此欄位必填'
              }
            },
            2: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return '此欄位必填'
              } else if (input.value < 1) {
                return '製程數不可小於1'
              }
            },
            3: function (td, table) {
              var flag = 0
              var errorStr = ''
              _.map(td.querySelectorAll('.opTr'), function (tr) {
                if (tr.querySelectorAll('input')[0].value === '') {
                  errorStr = '製程名稱必填'
                  flag = 1
                }
                if (tr.querySelectorAll('input')[1].value < 0) {
                  if (errorStr !== '') {
                    errorStr += ' ; '
                  }
                  errorStr += '機台數不可小於0'
                  flag = 1
                }
              })
              if (flag === 1) {
                return errorStr
              }
            },
          },
        })
      },
      lineTableHtml: (function () {
        return $('#line-table-widget').html()
      })(),
      initLineCRUDTable: function (context) {
        // 因為 crudtable.trEleTemplate 會把 [stk-input-template] remove, datatables 會多長wrapper
        // 但是每次產線類別有增刪改都要修改產線類別下拉式選單, 所以就每次都重放HTML
        $('#line-table-widget').html(context.lineTableHtml)

        var opMachineLabel = _.template(
          "<td style='width:10%;'>" +
            "<span class='label label-primary' data-machine-id='<%= machine_id%>' data-op-seq='<%= op_seq%>' data-machine-seq='<%= machine_seq%>' " +
            "style='cursor:pointer;margin:5px;'><i class='fa fa-tag'></i>&nbsp<%= machine_name %></span>" +
            '</td>'
        )
        var opMachineSelect = _.template(
          '<td style="width:10%;">' +
            '<select data-op-seq="<%= op_seq%>" data-machine-seq="<%= machine_seq%>" class="form-control" name="machine">' +
            context.machineSelectHtml +
            '</select>' +
            '</td>'
        )
        var lineDetailThead = function (maxMachineNum) {
          return [
            '<table id="inbox-table" class="table table-striped table-hover">',
            ' <thead>',
            '   <tr>',
            '   <th class="text-center">　製程/機台</th>',
            _.times(maxMachineNum, function (i) {
              return '<th class="text-center">' + (i + 1) + '</th>'
            }).join(''),
            '   </tr>',
            ' </thead>',
            ' <tbody>',
          ].join('')
        }
        var lineDetailTbodySelect = function (lineTypeOpObjs, maxMachineNum) {
          return _.map(lineTypeOpObjs, function (opObj) {
            return (
              '<tr class="text-center">' +
              '     <td style="width:10%;"><span class="label label-default">' +
              opObj.op_name +
              '</span></td>' +
              _.times(maxMachineNum, function (i) {
                if (i < opObj.machine_num) {
                  return opMachineSelect({
                    op_seq: opObj.op_seq,
                    machine_seq: i + 1,
                  })
                } else {
                  return '<td></td>'
                }
              }).join('') +
              '   </tr>'
            )
          }).join('')
        }
        var lineDetailTbodyLabel = function (lineMachineOpObjs, maxMachineNum) {
          // {op_seq:[{op_seq, op_name, machine_id, machine_seq}, ...], ...}
          return _.map(lineMachineOpObjs, function (opObjs, opSeq) {
            return (
              '<tr class="text-center">' +
              '     <td style="width:10%;"><span class="label label-default">' +
              opObjs[0].op_name +
              '</span></td>' +
              _.times(maxMachineNum, function (i) {
                if (opObjs[i]) {
                  opObjs[i].machine_name = servkit.getMachineName(
                    opObjs[i].machine_id
                  )
                  return opMachineLabel(opObjs[i])
                } else {
                  return '<td></td>'
                }
              }).join('') +
              '   </tr>'
            )
          }).join('')
        }
        var createAndUpdateSend = function (tdEles) {
          return {
            type_id: tdEles[0].querySelector('select').value,
            line_id: JSON.parse(tdEles[0].parentNode.getAttribute('stk-db-id')),
            line_name: tdEles[1].querySelector('input').value,
            detail: (function () {
              return _.map(tdEles[2].querySelectorAll('select'), function (
                select
              ) {
                return {
                  op_seq: select.getAttribute('data-op-seq'),
                  machine_seq: select.getAttribute('data-machine-seq'),
                  machine_id: select.value,
                }
              })
            })(),
          }
        }
        var createAndUpdateEnd = {
          1: function (td) {
            var lineTypeName = $(td).find('option:selected').text()
            var lineTypeId = $(td).find('select').val()
            return (
              "<span class='label label-primary' style='cursor:pointer;float:left;margin:5px;' data-type-id='" +
              lineTypeId +
              "'><i class='fa fa-tag'></i>&nbsp;" +
              lineTypeName +
              '</span>'
            )
          },
          3: function (td) {
            //          var clonedTable = td.querySelector('table').cloneNode(true);
            _.each(td.querySelectorAll('select'), function (select) {
              $(select)
                .parent('td')
                .replaceWith(
                  opMachineLabel({
                    machine_id: select.value,
                    machine_name: servkit.getMachineName(select.value),
                    op_seq: select.getAttribute('data-op-seq'),
                    machine_seq: select.getAttribute('data-machine-seq'),
                  })
                )
            })
            return td.outerHTML
          },
        }

        $('#line-table').on('change', 'select[name=type_name]', function () {
          var typeId = this.value
          servkit.ajax(
            {
              url: 'api/lineType/read',
              type: 'GET',
              data: { type_id: typeId },
              async: false,
            },
            {
              success: function (data) {
                var lineTypeOpObjs = data[0].op
                getDetailSelect(lineTypeOpObjs)
              },
            }
          )
        })

        function getDetailSelect(lineTypeOpObjs) {
          var maxMachineNum = _.max(_.pluck(lineTypeOpObjs, 'machine_num'))
          var lineDetailHtml = [
            lineDetailThead(maxMachineNum),
            lineDetailTbodySelect(lineTypeOpObjs, maxMachineNum),
            ' </tbody>',
            '</table>',
          ]
          $('#line-detail').html(lineDetailHtml.join(''))
        }

        servkit.crudtable({
          tableSelector: '#line-table',
          inputTemplate: {
            handler: function (select, data) {
              $(select).html(
                _.map(data, function (elem) {
                  return (
                    '<option value="' +
                    elem.type_id +
                    '">' +
                    elem.type_name +
                    '</option>'
                  )
                }).join('')
              )
            },
          },
          create: {
            url: 'api/lineMachine/create',
            start: function () {
              // 根據地一個產線類別長出選機台的表格
              $('select[name=type_name]').trigger('change')
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/lineMachine/read',
            end: {
              3: function (detail) {
                // objs => label table
                var maxMachineNum = _.max(_.pluck(detail, 'machine_seq'))
                var lineMachineOpObjs = _.groupBy(detail, 'op_seq')
                _.each(lineMachineOpObjs, function (opObjs) {
                  opObjs = _.sortBy(opObjs, 'machine_seq')
                })
                var linDetailHtml = [
                  lineDetailThead(maxMachineNum),
                  lineDetailTbodyLabel(lineMachineOpObjs, maxMachineNum),
                  ' </tbody>',
                  '</table>',
                ]
                return linDetailHtml.join('')
              },
            },
          },
          update: {
            url: 'api/lineMachine/update',
            start: {
              3: function (oldTd, newTd) {
                // label table => select table
                var clonedTable = oldTd.querySelector('table').cloneNode(true)
                _.each(
                  clonedTable.querySelectorAll('.label-primary'),
                  function (label) {
                    var $selectTd = $(
                      opMachineSelect({
                        op_seq: label.getAttribute('data-op-seq'),
                        machine_seq: label.getAttribute('data-machine-seq'),
                      })
                    )
                    $selectTd
                      .find('select')
                      .val(label.getAttribute('data-machine-id'))
                    $(label).parent('td').replaceWith($selectTd)
                  }
                )
                $('#line-detail').html(clonedTable)
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/lineMachine/delete',
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('select')
              if (input.value === '') {
                return '此欄位必填'
              }
            },
            2: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return '此欄位必填'
              }
            },
            3: function (td, table) {
              var machines = _.map($(td).find('[name=machine]'), function (
                select
              ) {
                return select.value
              })
              if (machines.length !== _.uniq(machines).length) {
                return '機台重複，請確認'
              }
            },
          },
        })
      },
      initDialogs: function (context) {
        var opTableViewTr = _.template(
          '<tr class="opTr">' +
            '  <td style="width:15%;"><span class="label label-default op_seq"><%= op_seq %></span></td>' +
            '  <td style="width:30%;">' +
            '    <input class="op_name full-width" type="text" placeholder="製程名稱">' +
            '  </td>' +
            '  <td style="width:40%;">' +
            '    <textarea class="op_desc full-width" placeholder="製程描述"></textarea>' +
            '  </td>' +
            '  <td style="width:15%;">' +
            '    <input class="spinner machine_num" type="text" value="1" placeholder="機台數量">' +
            '  </td>' +
            '</tr>'
        )

        // 確認 減少製程數量 與 減少機台數量 的 Dialog
        $('#line-type-table')
          .on('focus', 'input[name=op_num]', function () {
            if ($(this).val() <= 0) {
              $(this).val('0')
            }
            context.tempOpNum = parseInt($(this).val())
          })
          .on('spinchange', 'input[name=op_num]', function (e) {
            if ($(this).val() <= 0) {
              $(this).val('0')
            }
            var nowOpNum = parseInt($(this).val())
            var html = ''

            console.log(
              'nowOpNum =' +
                nowOpNum +
                '  ,context.tempOpNum =' +
                context.tempOpNum
            )
            if (nowOpNum > 0 || context.tempOpNum > 0) {
              if (nowOpNum < context.tempOpNum) {
                // 刪除倒數 diff 個 OP
                $('#decreaseOpCheckDialog')
                  .data('nowOpNum', nowOpNum)
                  .dialog('open')
              } else if (nowOpNum > context.tempOpNum) {
                for (
                  var i = parseInt(context.tempOpNum) + 1;
                  i <= nowOpNum;
                  i++
                ) {
                  html += opTableViewTr({ op_seq: i })
                  context.machineNumArray.push(1)
                }
                $(this)
                  .closest('tr')
                  .find('tbody')
                  .append(html)
                  .find('.spinner')
                  .spinner()
                context.tempOpNum = nowOpNum
              }
            }
          })
          .on('spinchange', '.spinner.machine_num', function () {
            var index = parseInt($(this).closest('tr').find('td:first').text())
            //            console.log($(this).val() + "  -  " + context.machineNumArray[index - 1]);
            if ($(this).val() < context.machineNumArray[index - 1]) {
              // 跳出提示
              $('#decreaseMachineNumCheckDialog')
                .data('index', index)
                .dialog('open')
            }
          })
          .append("<div id='decreaseOpCheckDialog'></div>")
          .append("<div id='decreaseMachineNumCheckDialog'></div>")

        $.widget(
          'ui.dialog',
          $.extend({}, $.ui.dialog.prototype, {
            // 讓 Dialog 的 title 可以用 HTML 字串來設定
            _title: function (title) {
              if (!this.options.title) {
                title.html('&#160;')
              } else {
                title.html(this.options.title)
              }
            },
          })
        )

        $('#decreaseOpCheckDialog')
          .html(
            '若減少製程數量，將會刪除該產線類別中所有產線的對應製程與機台！'
          )
          .dialog({
            dialogClass: 'no-close',
            autoOpen: false,
            width: 600,
            resizable: false,
            modal: true,
            title:
              "<div class='widget-header'><h4><i class='fa fa-warning'></i> 您確定要減少製程數量? </h4></div>",
            buttons: [
              {
                html: '<i class="fa fa-trash-o"></i>&nbsp; Yes',
                class: 'btn btn-danger',
                click: function () {
                  var $this = $(this)
                  var diff =
                    context.tempOpNum - parseInt($this.data('nowOpNum'))
                  $this.dialog('close')
                  // 刪除倒數 diff 個 OP
                  if ($this.data('nowOpNum') <= 0) {
                    $('.opTr').remove()
                    // context.tempOpNum = 0;
                  } else {
                    $('.opTr')
                      .eq($this.data('nowOpNum') - 1)
                      .nextAll()
                      .remove()
                    context.tempOpNum = parseInt($this.data('nowOpNum'))
                  }
                  // find("tbody tr:nth-last-child(" + parseInt(diff + 1) + ")").nextAll().remove();
                  //
                  for (var i = 0; i < diff; i++) {
                    context.machineNumArray.pop()
                  }
                },
              },
              {
                html: '<i class="fa fa-times"></i>&nbsp; No',
                class: 'btn btn-default',
                click: function () {
                  // 復原舊的製程數量
                  $('input[name=op_num]').val(context.tempOpNum)
                  $(this).dialog('close')
                },
              },
            ],
            //            close: function (event, ui) {
            //              console.log(event);
            //              console.log(ui);
            //            }
          })

        $('#decreaseMachineNumCheckDialog')
          .html(
            '若減少機台數量，將會刪除該產線類別中所有產線該製程的機台對應！'
          )
          .dialog({
            dialogClass: 'no-close',
            autoOpen: false,
            width: 600,
            resizable: false,
            modal: true,
            title:
              "<div class='widget-header'><h4><i class='fa fa-warning'></i> 您確定要減少機台數量? </h4></div>",
            buttons: [
              {
                html: '<i class="fa fa-trash-o"></i>&nbsp; Yes',
                class: 'btn btn-danger',
                click: function () {
                  var $this = $(this)
                  $this.dialog('close')
                  // 更新 context.machineNumArray 數值以便下次數值更改時做比較
                  console.log('1.  ' + $this)
                  console.log('2.  ' + $this.data('index'))
                  context.machineNumArray[$this.data('index') - 1] = $(
                    '.spinner.machine_num:eq(' +
                      ($(this).data('index') - 1) +
                      ')'
                  ).val()
                  console.log(context.machineNumArray)
                },
              },
              {
                html: '<i class="fa fa-times"></i>&nbsp; No',
                class: 'btn btn-default',
                click: function () {
                  var $this = $(this)
                  console.log('1.  ' + $this)
                  console.log('2.  ' + $this.data)
                  console.log('3.  ' + $this.data('index'))
                  $(this).dialog('close')
                  // 復原機台數量
                  $(
                    '.spinner.machine_num:eq(' +
                      ($(this).data('index') - 1) +
                      ')'
                  ).val(context.machineNumArray[$(this).data('index') - 1])
                },
              },
            ],
          })
      },
    },
    delayCondition: ['machineList'],
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

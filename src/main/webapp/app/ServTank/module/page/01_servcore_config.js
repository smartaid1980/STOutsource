import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var servcoreViews = _.map(ctx.preCon.servcores, function (servcore) {
        return new ctx.CoreView(servcore)
      })

      $('#edit-slaves').on('click', function () {
        var url = window.location.href
        var lastIndex = url.lastIndexOf('/')
        var editUrl = url.substring(0, lastIndex + 1) + 'slaves_edit.jsp'
        window.location.href = editUrl
      })

      $('#reload-machine-ids').on('click', function () {
        servkit.loadMachineIds(function (data) {
          $.smallBox({
            title: 'Reload Machine Ids and names,   count : ' + data.length,
            content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
            color: '#739e73',
            timeout: 60000,
          })
        })
      })
    },
    util: {
      CoreView: (function () {
        var DEFAULT_PORT = '58080'

        function Obj(prop) {
          this.id = prop.id
          this.ip = prop.ip
          this.port = prop.port

          this.$ele = $(this.getView())
          $('#servcore-config').append(this.$ele)

          this.$servcoreIdInput = this.$ele.find('input[name="servcore-id"]')
          this.$ipAddressInput = this.$ele.find('input[name="ip-address"]')
          this.$pingBtn = this.$ele.find('.ping-btn')
          this.$actionBtn = this.$ele.find('.action-btn')
          this.$syncBtn = this.$ele.find('.sync-btn')
          this.bindPingEvent()
          this.bindActionEvent()
          this.bindFactoryEvent()
        }

        Obj.prototype.getView = function () {
          return (
            '<fieldset>' +
            '    <div class="form-group">' +
            '        <div class="row">' +
            '            <div class="col-sm-12 col-md-4">' +
            '                <label class="control-label">ServCore ID</label>' +
            '                <input type="text" class="form-control" name="servcore-id" value="' +
            this.getId() +
            '" disabled />' +
            '            </div>' +
            '            <div class="col-sm-12 col-md-6">' +
            '                <label class="control-label">IP Address</label>' +
            '                <input type="text" class="form-control" name="ip-address" value="' +
            this.getIp() +
            '" />' +
            '            </div>' +
            '            <div class="col-sm-12 col-md-2">' +
            '                <label class="control-label">　</label>' +
            '                <div>' +
            '                    <button class="btn ' +
            this.getActionBtnClass() +
            ' action-btn">' +
            this.getActionBtnText() +
            '</button>' +
            '                    <button class="btn btn-primary ping-btn">PING</button>' +
            '                    <button class="btn btn-success sync-btn"><span class="fa fa-refresh fa-lg"></span></button>' +
            '                </div>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</fieldset>'
          )
        }

        Obj.prototype.isConfiged = function () {
          return this.id && this.ip
        }

        Obj.prototype.getId = function () {
          return this.id || ''
        }

        Obj.prototype.getIp = function () {
          return this.ip || ''
        }

        Obj.prototype.getActionBtnText = function () {
          return this.isConfiged()
            ? `${i18n('Remove_ServCore')}`
            : `${i18n('Add_ServCore')}`
        }

        Obj.prototype.getActionBtnClass = function () {
          return this.isConfiged() ? 'btn-danger' : 'btn-primary'
        }

        Obj.prototype.bindPingEvent = function () {
          var that = this

          this.$pingBtn.on('click', function (evt) {
            evt.preventDefault()

            var ip = that.getIpInput(),
              $btn = $(this)

            if (ip) {
              $btn
                .prop('disabled', true)
                .html('<i class="fa fa-refresh fa-spin"></i>')

              servkit.ajax(
                {
                  url: servkit.rootPath + '/api/tank/master/ping',
                  type: 'GET',
                  data: {
                    ip: ip,
                    port: DEFAULT_PORT,
                  },
                },
                {
                  success: function (data) {
                    that.$servcoreIdInput.val(data)
                    $.smallBox({
                      title: 'PING Success!',
                      content:
                        "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                      color: '#739e73',
                      iconSmall: 'fa fa-thumbs-up bounce animated',
                      timeout: 4000,
                    })
                  },
                  fail: function (data) {
                    $.smallBox({
                      title: 'PING Fail...',
                      content: data,
                      color: '#C46A69',
                      iconSmall: 'fa fa-warning shake animated',
                      timeout: 4000,
                    })
                  },
                  always: function () {
                    setTimeout(function () {
                      $btn.prop('disabled', false).html('PING')
                    }, 1000)
                  },
                }
              )
            }
          })
        }

        Obj.prototype.bindActionEvent = function () {
          var that = this

          this.$actionBtn.on('click', function (evt) {
            evt.preventDefault()

            if (that.isConfiged()) {
              that.delete()
            } else {
              that.add()
            }
          })
        }

        Obj.prototype.bindFactoryEvent = function () {
          var that = this
          this.$syncBtn.on('click', function (evt) {
            evt.preventDefault()
            var ip = that.getIpInput(),
              $btn = $(this),
              coreId = that.getCoreId()
            var $dialog = $('<div></div')
            $dialog.dialog({
              autoOpen: false,
              width: 600,
              resizable: false,
              modal: true,
              title:
                "<div class='widget-header'><h4><i class='fa fa-warning'></i>" +
                coreId +
                ' 同步 </h4></div>',
              buttons: [
                {
                  html: '<i class="fa fa-trash-o"></i>&nbsp; 確定',
                  class: 'btn btn-danger',
                  click: function () {
                    if (ip) {
                      $btn
                        .prop('disabled', true)
                        .html('<i class="fa fa-refresh fa-spin"></i>')
                      servkit.ajax(
                        {
                          url:
                            servkit.rootPath + '/api/tank/master/syncFactory',
                          type: 'GET',
                          data: {
                            ip: ip,
                            port: DEFAULT_PORT,
                            id: coreId,
                          },
                        },
                        {
                          success: function (data) {
                            $.smallBox({
                              title: coreId + `${i18n('Syncing')}`,
                              content:
                                "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                              color: '#739e73',
                              iconSmall: 'fa fa-thumbs-up bounce animated',
                              timeout: 2000,
                            })

                            var coreObj = {
                              id: coreId,
                              ip: ip,
                              port: DEFAULT_PORT,
                              uuid: data,
                            }
                            setTimeout(function () {
                              that.syncResult(coreObj, $btn)
                            }, 10000)
                          },
                          fail: function (data) {
                            $.smallBox({
                              title: coreId + `${i18n('Sync_Fail')}`,
                              content: data,
                              color: '#C46A69',
                              iconSmall: 'fa fa-warning shake animated',
                              timeout: 4000,
                            })
                          },
                          always: function () {
                            $dialog.dialog('close')
                            // setTimeout(function () {
                            //     $btn.prop('disabled', false).html('<span class="fa fa-refresh fa-lg"></span>');
                            // }, 1000);
                          },
                        }
                      )
                    }
                  },
                },
                {
                  html: '<i class="fa fa-times"></i>&nbsp; 取消',
                  class: 'btn btn-default',
                  click: function () {
                    $(this).dialog('close')
                  },
                },
              ],
            })
            $dialog.html('同步後, 機台、廠區資料都將更新, 請問確定要同步嗎?')
            $dialog.dialog('open')
            // if (ip) {
            //     $btn.prop('disabled', true).html('<i class="fa fa-refresh fa-spin"></i>');
            //     servkit.ajax({
            //         url: servkit.rootPath + '/api/tank/master/syncFactory',
            //         type: 'GET',
            //         data: {
            //             ip: ip,
            //             port: DEFAULT_PORT,
            //             id: coreId
            //         }
            //     }, {
            //         success: function (data) {
            //             $.smallBox({
            //                 title: coreId + `${i18n('Syncing')}`,
            //                 content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
            //                 color: "#739e73",
            //                 iconSmall: "fa fa-thumbs-up bounce animated",
            //                 timeout: 2000
            //             });

            //             var coreObj = {
            //                 id: coreId,
            //                 ip: ip,
            //                 port: DEFAULT_PORT,
            //                 uuid: data
            //             }
            //             setTimeout(function () {
            //                 that.syncResult(coreObj, $btn);
            //             }, 10000);
            //         },
            //         fail: function (data) {
            //             $.smallBox({
            //                 title: coreId + `${i18n('Sync_Fail')}`,
            //                 content: data,
            //                 color: "#C46A69",
            //                 iconSmall: "fa fa-warning shake animated",
            //                 timeout: 4000
            //             });
            //         },
            //         always: function () {
            //             // setTimeout(function () {
            //             //     $btn.prop('disabled', false).html('<span class="fa fa-refresh fa-lg"></span>');
            //             // }, 1000);
            //         }
            //     });
            // }
          })
        }
        Obj.prototype.getIpInput = function () {
          var ip = this.$ipAddressInput.val()
          if (ip) {
            return ip
          } else {
            $.smallBox({
              title: `${i18n('Please_Input')} IP Address...`,
              content: '',
              color: '#C46A69',
              iconSmall: 'fa fa-warning shake animated',
              timeout: 6000,
            })
          }
        }
        Obj.prototype.getCoreId = function () {
          var servcoreId = this.$servcoreIdInput.val()
          if (servcoreId) {
            return servcoreId
          } else {
            return this.getIpInput()
          }
        }

        Obj.prototype.add = function () {
          var ip = this.getIpInput()
          var that = this

          if (ip) {
            this.$actionBtn
              .prop('disabled', true)
              .html('<i class="fa fa-refresh fa-spin"></i>')
            servkit.ajax(
              {
                url: servkit.rootPath + '/api/tank/master',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  ip: ip,
                  port: DEFAULT_PORT,
                }),
              },
              {
                success: function (data) {
                  that.id = data
                  that.ip = ip
                  that.port = DEFAULT_PORT
                  that.$servcoreIdInput.val(data)
                  that.$actionBtn.removeClass('btn-primary')
                  that.$actionBtn.addClass(that.getActionBtnClass())
                  $.smallBox({
                    title: `${i18n('Add_Success')}!`,
                    content:
                      "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                    color: '#739e73',
                    iconSmall: 'fa fa-thumbs-up bounce animated',
                    timeout: 4000,
                  })
                },
                fail: function (data) {
                  $.smallBox({
                    title: `${i18n('Add_Fail')}!`,
                    content: data,
                    color: '#C46A69',
                    iconSmall: 'fa fa-warning shake animated',
                    timeout: 6000,
                  })
                },
                always: function () {
                  setTimeout(function () {
                    that.$actionBtn
                      .prop('disabled', false)
                      .text(that.getActionBtnText())
                  }, 1000)
                },
              }
            )
          }
        }

        Obj.prototype.delete = function () {
          var that = this

          this.$actionBtn
            .prop('disabled', true)
            .html('<i class="fa fa-refresh fa-spin"></i>')
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/tank/master',
              type: 'DELETE',
              contentType: 'application/json',
              data: JSON.stringify({
                id: that.id,
                ip: that.ip,
                port: that.port,
              }),
            },
            {
              success: function (data) {
                that.id = undefined
                that.ip = undefined
                that.port = undefined
                that.$servcoreIdInput.val('')
                that.$ipAddressInput.val('')
                that.$actionBtn.removeClass('btn-danger')
                that.$actionBtn.addClass(that.getActionBtnClass())
                $.smallBox({
                  title: `${i18n('Remove_Success')}!`,
                  content:
                    "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                  color: '#739e73',
                  iconSmall: 'fa fa-thumbs-up bounce animated',
                  timeout: 4000,
                })
              },
              fail: function (data) {
                $.smallBox({
                  title: `${i18n('Remove_Fail')}!`,
                  content: data,
                  color: '#739e73',
                  iconSmall: 'fa fa-thumbs-up bounce animated',
                  timeout: 6000,
                })
              },
              always: function () {
                setTimeout(function () {
                  that.$actionBtn
                    .prop('disabled', false)
                    .text(that.getActionBtnText())
                }, 1000)
              },
            }
          )
        }
        Obj.prototype.syncResult = function (coreObj, $btn) {
          var that = this
          var coreId = coreObj.id
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/tank/master/lastResult',
              type: 'GET',
              data: coreObj,
            },
            {
              success: function (data) {
                $.smallBox({
                  title: coreId + ` ${i18n('Sync_Success')}`,
                  content:
                    "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                  color: '#739e73',
                  iconSmall: 'fa fa-thumbs-up bounce animated',
                  timeout: 4000,
                })
              },
              fail: function (data) {
                console.log(data)
                $.smallBox({
                  title: coreId + ` ${i18n('Sync_Fail')}...`,
                  content: data.data,
                  color: '#C46A69',
                  iconSmall: 'fa fa-warning shake animated',
                  timeout: 6000,
                })
              },
              always: function () {
                setTimeout(function () {
                  $btn
                    .prop('disabled', false)
                    .html('<span class="fa fa-refresh fa-lg"></span>')
                }, 1000)
              },
            }
          )
        }

        return Obj
      })(),
    },
    preCondition: {
      servcores: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/tank/master/servcoreAmount',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
  })
}

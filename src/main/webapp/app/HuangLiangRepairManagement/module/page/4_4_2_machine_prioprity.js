export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.setUserpermittedAuthes()
      ctx.objsIntoSelect(ctx.prioritySelect(3)[0], ctx.preCon.priority[3])
      ctx.objsIntoSelect(ctx.prioritySelect(2)[0], ctx.preCon.priority[2])
      ctx.objsIntoSelect(ctx.prioritySelect(1)[0], ctx.preCon.priority[1])
      ctx.objsIntoSelect(ctx.prioritySelect(0)[0], ctx.preCon.priority[0])

      $('#non_to_high').on('click', function (evt) {
        ctx.move(0, 3)
      })
      $('#high_to_non').on('click', function (evt) {
        ctx.move(3, 0)
      })

      $('#non_to_med').on('click', function (evt) {
        ctx.move(0, 2)
      })
      $('#med_to_non').on('click', function (evt) {
        ctx.move(2, 0)
      })

      $('#non_to_low').on('click', function (evt) {
        ctx.move(0, 1)
      })
      $('#low_to_non').on('click', function (evt) {
        ctx.move(1, 0)
      })

      $('#high_to_med').on('click', function (evt) {
        ctx.move(3, 2)
      })
      $('#med_to_high').on('click', function (evt) {
        ctx.move(2, 3)
      })

      $('#low_to_med').on('click', function (evt) {
        ctx.move(1, 2)
      })
      $('#med_to_low').on('click', function (evt) {
        ctx.move(2, 1)
      })

      $('#add_tab').on('click', function (evt) {
        ctx.save()
      })
    },

    util: {
      setUserpermittedAuthes: function () {
        var context = this
        //業務部副理，研發副理，僅可查詢
        var queryOnlyGroup = [
          context.commons.sales_manager,
          context.commons.rd_manager,
        ]
        //admin, 高階主管，廠務部副理，廠務部製造課長，廠務部製造副課長
        var editGroup = [
          context.commons.sys_super_admin_group,
          context.commons.sys_manager_group,
          context.commons.top_manager,
          context.commons.factory_service_deputy_manager,
          context.commons.process_manager_1,
          context.commons.process_manager_2,
          context.commons.process_deputy_manager_1,
          context.commons.process_deputy_manager_2,
        ]
        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        if (
          !_.intersection(userGroupList, editGroup).length &&
          _.intersection(userGroupList, queryOnlyGroup).length
        ) {
          $('.edit-btn').addClass('hide')
        }
      },

      objsIntoSelect: function (selectEle, optionObjList) {
        selectEle.innerHTML = ''

        _.each(optionObjList, function (obj) {
          selectEle.appendChild(
            $(
              '<option value="' +
                obj.machine_id +
                '">' +
                servkit.getMachineName(obj.machine_id) +
                '</option>'
            )[0]
          )
        })
      },

      prioritySelect: function (priority) {
        switch (priority) {
          case 0:
            return $('#slt4')
          case 1:
            return $('#slt3')
          case 2:
            return $('#slt2')
          case 3:
            return $('#slt1')
        }
      },

      move: function (fromPri, toPri) {
        var $fromSelect = this.prioritySelect(fromPri)
        var $toSelect = this.prioritySelect(toPri)
        var selectedMachineIds = $fromSelect.val() || []

        // 左留右不留
        var partitioned = _.partition(this.preCon.priority[fromPri], function (
          data
        ) {
          return selectedMachineIds.indexOf(data.machine_id) === -1
        })

        // 跟他 say goodbye
        this.preCon.priority[fromPri] = partitioned[0]

        // 換風水囉
        this.preCon.priority[toPri] = this.preCon.priority[toPri]
          .concat(partitioned[1])
          .sort(function (a, b) {
            if (a.machine_id < b.machine_id) return -1
            if (a.machine_id > b.machine_id) return 1
            return 0
          })
        _.each(this.preCon.priority[toPri], function (o) {
          o.priority = toPri
        })

        // 改 view
        this.objsIntoSelect(
          this.prioritySelect(fromPri)[0],
          this.preCon.priority[fromPri]
        )
        this.objsIntoSelect(
          this.prioritySelect(toPri)[0],
          this.preCon.priority[toPri]
        )
      },

      save: function () {
        servkit.ajax(
          {
            url: 'api/huangliang/repair/savePriority',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(
              (function (data) {
                return data[0].concat(data[1]).concat(data[2]).concat(data[3])
              })(this.preCon.priority)
            ),
          },
          {
            success: function (res) {
              alert('成功')
            },
          }
        )
      },
    },

    delayCondition: ['machineList'],

    preCondition: {
      priority: function (done) {
        servkit.ajax(
          {
            url: 'api/huangliang/repair/priority',
            type: 'GET',
          },
          {
            success: function (datas) {
              var result = _.groupBy(datas, function (data) {
                return data.priority
              })
              result[0] = result[0] || []
              result[1] = result[1] || []
              result[2] = result[2] || []
              result[3] = result[3] || []
              done(result)
            },
          }
        )
      },
    },
  })
}

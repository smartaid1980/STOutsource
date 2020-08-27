import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')
      context.userAuth = context.initUserAuth(
        context.loginInfo.user_group,
        context.preCon.sysGroupMap
      )
      context.userGroup = context.loginInfo.user_group
      context.initProjectTable()
      $('#project-table').on('click', '.to-rfq-list-page', function () {
        context.goRfqListPage.call(context, $(this))
      })
    },
    util: {
      loginInfo: JSON.parse(sessionStorage.getItem('loginInfo')),
      initUserAuth(currentGroup, allGroupMap) {
        const result = {}
        let hasGroup
        let groupId
        for (let role in allGroupMap) {
          groupId = allGroupMap[role]
          hasGroup = currentGroup.includes(groupId)
          result[role] = hasGroup
        }
        return _.extend(result, {
          canSeeAllProject: result.accountAst,
          canAssignProjectOwner: result.accountAst,
        })
      },
      initProjectTable() {
        const context = this
        const { userAuth } = context
        const userId = context.loginInfo.user_id
        const accountGroupId = context.preCon.sysGroupMap.account
        const groupAccountUserInfos = Object.values(
          context.preCon.userInfo
        ).filter((user) =>
          user.sys_groups.some((group) => group.group_id === accountGroupId)
        )
        const goRfqListPageButton = (projectId, userId) =>
          `<button class="btn btn-primary to-rfq-list-page" data-project-id="${projectId}" ${
            userId ? `data-user-id="${userId}"` : ''
          }>${i18n('Go')}</button>`
        const appendOptions = ($select, options) => {
          $select.append(
            options
              .map(
                (map) =>
                  `<option style="padding:3px 0 3px 3px" value="${map.key}">${map.value}</option>`
              )
              .join('')
          )
        }
        let readUrl = 'api/strongled/project'
        if (!userAuth.canSeeAllProject) {
          readUrl += `/${userId}`
        }
        appendOptions(
          $('#project-table').find('[name=user_id]'),
          groupAccountUserInfos.map((user) => ({
            key: user.user_id,
            value: user.user_name,
          }))
        )
        servkit.crudtable({
          tableSelector: '#project-table',
          create: {
            url: 'api/strongled/project',
            start(newTr, table) {
              const $userSelect = $(newTr).find('[name=user_id]')
              if (userAuth.canAssignProjectOwner) {
                $userSelect.prop('disabled', false)
              } else {
                $userSelect.prop('disabled', true).val(userId)
              }
            },
            finalDo(newRow) {
              // end無法取得新id，只好在finalDo從tr的屬性取得
              const $tr = $(newRow)
              const newId = $tr.attr('stk-db-id').replace(/"/g, '')
              const $tds = $tr.find('td')
              const { user_id } = $tr.data().rowData
              const $projectIdTd = $tds.eq(1)
              const $buttonTd = $tds.eq(5)
              $buttonTd.html(goRfqListPageButton(newId, user_id))
              $projectIdTd.text(newId)
            },
          },
          read: {
            url: readUrl,
            end: {
              3(data) {
                return context.preCon.userInfo[data].user_name
              },
              5(data, rowData) {
                return goRfqListPageButton(rowData.project_id, rowData.user_id)
              },
            },
          },
          update: {
            url: 'api/strongled/project',
            start: {
              3(oldTd, newTd, oldTr, newTr, table) {
                const $userSelect = $(newTd).find('select')
                const ownerUserId = $(oldTr).data('rowData')
                  ? $(oldTr).data('rowData').user_id
                  : ''
                if (userAuth.assistantAst) {
                  $userSelect.prop('disabled', true).val(ownerUserId)
                } else {
                  $userSelect.prop('disabled', true).val(userId)
                }
              },
            },
            end: {
              5(td, formData) {
                return goRfqListPageButton(
                  formData.project_id,
                  formData.user_id
                )
              },
            },
          },
          delete: {
            url: 'api/strongled/project/deleteWithArray',
            fail(data) {
              let errorMsg = ''
              if (_.isArray(data) && data.length) {
                errorMsg = `${i18n(
                  'There_Are_Projects_Under_The_Inquiry_Can_Not_Be_Deleted_Numbered'
                )}<br>${data.join('<br>')} `
              }
              return errorMsg
            },
          },
          validate: {
            // 項目名稱
            2(td) {
              const $input = $(td).find('input')
              const value = $input.val()
              if (value === '') {
                return `${i18n('This_Field_Is_Required')}`
              } else if (value.length > 50) {
                return `${i18n('Length_Should_Not_Exceed_Characters')}50`
              }
            },
            // 客戶名稱
            4(td) {
              const $input = $(td).find('input')
              const value = $input.val()
              if (value === '') {
                return `${i18n('This_Field_Is_Required')}`
              } else if (value.length > 10) {
                return `${i18n('Length_Should_Not_Exceed_Characters')}10`
              }
            },
          },
        })
      },
      goRfqListPage($thisBtn) {
        const context = this
        const lang = servkit.getCookie('lang')
        const { projectId, userId } = $thisBtn.data()
        const queryParam = `?projectId=${projectId}`
        const isAccountAssistant = context.userAuth.accountAst
        if (isAccountAssistant) {
          sessionStorage.setItem(
            'projectInfo',
            JSON.stringify({
              userId,
            })
          )
        }
        window.location = `#app/StrongLED/function/${lang}/14_project_rfq_list.html${queryParam}`
      },
    },
    preCondition: {
      userInfo(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
          },
          {
            success(data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem
              })
              done(userData)
            },
          }
        )
      },
      sysGroupMap(done) {
        $.get(
          './app/StrongLED/data/sysGroupIdMap.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/moment/locale/zh-cn.js',
      ],
    ],
  })
}

import { crudtable } from '../../../../js/servtech/module/table/crudTable.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'

export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      main() {
        const context = this
        context.initSettingRecipientTable()
      },
      getMailList(td) {
        const $td = $(td)
        // 按下 enter 變成 tags 的 mail
        const enteredMails = $td.find('input:first').val().split(',')
        // 將未按 enter 仍留在輸入框的文字也合併
        const unenterMail = $td.find('input:last').val().split(',')
        const mails = _.chain(enteredMails.concat(unenterMail))
          .compact()
          .uniq()
          .value()
        return mails
      },
      initSettingRecipientTable() {
        const context = this
        crudtable({
          tableSelector: '#recipient-setting',
          tableModel:
            'com.servtech.servcloud.app.model.ennoconn.UserMailConfig',
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            end: {
              3: (data) => (data ? data.split(',') : ''),
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              3(oldTd, newTd) {
                const $recipient = $(newTd).find('input[name=recipient]')
                $recipient.tagsinput()
                try {
                  _.each($(oldTd).find('span.label'), (label) => {
                    $recipient.tagsinput('add', label.textContent.trim())
                  })
                } catch (error) {
                  console.warn(error)
                }
              },
            },
            end: {
              3(td) {
                try {
                  const mails = context.getMailList(td)
                  return mails
                    .map(
                      (mail) =>
                        `<span class='label label-primary' style='float:left;margin:5px;'><i class='fa fa-tag'></i> ${mail}</span>`
                    )
                    .join('')
                } catch (error) {
                  console.warn(error)
                  return $(td).find('input[name=recipient]').val()
                }
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            3(td) {
              const invalidEmails = []
              const mailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              const mails = context.getMailList(td)
              mails.forEach((mail) => {
                if (!mailRegEx.test(mail.toString().toLocaleLowerCase())) {
                  invalidEmails.push(mail)
                }
              })
              if (invalidEmails.length) {
                return `Invalid email format: ${invalidEmails.join(',')}.`
              }
            },
          },
        })
      },
    },
    dependencies: [
      ['/js/plugin/bootstrap-tags/bootstrap-tagsinput.min.js'],
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

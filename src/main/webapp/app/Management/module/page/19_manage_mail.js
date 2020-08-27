export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initReportRecipientTable()
      context.initMailTable()
    },
    util: {
      initMailTable: function () {
        let createAndUpdateEnd = {
          2(td) {
            try {
              var mails = _.compact(
                $(td)
                  .find('input:first')
                  .val()
                  .split(',')
                  .concat($(td).find('input:last').val().split(','))
              )
              return _.map(
                mails,
                (mail) =>
                  `<span class='label label-primary' style='float:left;margin:5px;'><i class='fa fa-tag'></i>&nbsp;${mail}</span>`
              ).join('')
            } catch (error) {
              console.warn(error)
              return $(td).find('input[name=mail_address]').val()
            }
          },
        }
        servkit.crudtable({
          tableSelector: '#stk-mail-table',
          tableModel:
            'com.servtech.servcloud.app.model.production_efficiency.Mail',
          create: {
            url: 'api/stdcrud',
            start(newTr) {
              $(newTr).find('input[name=mail_address]').tagsinput()
            },
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/stdcrud',
            end: {
              2: (data) => data.split(','),
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              2(oldTd, newTd) {
                let $recipients = $(newTd).find('input[name=mail_address]')
                $recipients.tagsinput()
                try {
                  _.each($(oldTd).find('span.label'), (label) => {
                    $recipients.tagsinput('add', label.textContent.trim())
                  })
                } catch (error) {
                  console.warn(error)
                }
              },
            },
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/stdcrud',
          },
          validate: {
            2(td) {
              let invalidEmails = []
              // eslint-disable-next-line no-useless-escape
              let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              let mails = _.compact(
                $(td)
                  .find('input:first')
                  .val()
                  .split(',')
                  .concat($(td).find('input:last').val().split(','))
              )
              _.each(mails, (mail) => {
                if (!re.test(String(mail).toLocaleLowerCase())) {
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
      initReportRecipientTable() {
        let createAndUpdateEnd = {
          3(td) {
            try {
              var mails = _.compact(
                $(td)
                  .find('input:first')
                  .val()
                  .split(',')
                  .concat($(td).find('input:last').val().split(','))
              )
              return _.map(
                mails,
                (mail) =>
                  `<span class='label label-primary' style='float:left;margin:5px;'><i class='fa fa-tag'></i>&nbsp;${mail}</span>`
              ).join('')
            } catch (error) {
              console.warn(error)
              return $(td).find('input[name=recipients]').val()
            }
          },
        }
        servkit.crudtable({
          tableSelector: '#recipient-setting',
          tableModel: 'com.servtech.servcloud.app.model.cosmos.MailRecipient',
          create: {
            url: 'api/stdcrud',
            start(newTr) {
              $(newTr).find('input[name=recipients]').tagsinput()
            },
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/stdcrud',
            end: {
              3: (data) => data.split(','),
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              3(oldTd, newTd) {
                let $recipients = $(newTd).find('input[name=recipients]')
                $recipients.tagsinput()
                try {
                  _.each($(oldTd).find('span.label'), (label) => {
                    $recipients.tagsinput('add', label.textContent.trim())
                  })
                } catch (error) {
                  console.warn(error)
                }
              },
            },
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/stdcrud',
          },
          validate: {
            3(td) {
              let invalidEmails = []
              // eslint-disable-next-line no-useless-escape
              let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              let mails = _.compact(
                $(td)
                  .find('input:first')
                  .val()
                  .split(',')
                  .concat($(td).find('input:last').val().split(','))
              )
              _.each(mails, (mail) => {
                if (!re.test(String(mail).toLocaleLowerCase())) {
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

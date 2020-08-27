let servtechConfig = {}
$.ajax({
  url: './js/servtech.config.json',
  dataType: 'json',
  async: false,
  success(data) {
    servtechConfig = data
  },
  error(jqXHR, textStatus, e) {
    console.warn(e)
  },
})

export { servtechConfig }

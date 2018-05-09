Page({
  data: {
    url: '',
  },
  onLoad: function(option){
    var that = this;
    that.setData({
      url: option.base_url.format(option.fullname)
    })
  }
})

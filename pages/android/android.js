Page({
  data:{
    music: {}
  },
  onLoad: function(option){
    var that = this
    var fullname = option.fullname
    this.getRingtone(fullname)
  },
  getRingtone: function(fullname){
    var that = this
    wx.request({
      url: 'https://ringtone.appdao.com/apiv1/ringtone?ringtoneid='+ fullname,
      success: function(res){
        if (res.data.status === 0){
          that.setData({
            music: res.data.data
          })
        }
      }
    })
  },
  copyLink: function(){
    var that = this;
    console.log(that.data)
    var link = that.data.music.download_url
    if (link != ''){
      wx.setClipboardData({
        data: link,
        success: function (res) {
          wx.showModal({
            showCancel: false,
            title: '提示',
            content: '链接已经复制在剪贴板中，请前往浏览器中打开',
          })
        }
      })
    }
  }
})
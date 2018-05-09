// pages/tutorial/tutorial.js
const userModel = require('../../api/userModel.js')
var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    faqs: [
      {
        id: 0,
        "answer": "VIP会员按月收费，每月5元，由运营商直接收取",
        "question": "VIP会员如何收费？",
        "sort": 11
      },
      {
        id: 1,
        "answer": "首先，请您排查号码是否欠费，欠费状态中无法设置彩铃；其次，请您咨询运营商，确认彩铃基本业务是否已开通，如未开通，需要激活彩铃业务；如果不是上述原因，请尝试换一首铃声设置\n如果以上没有解决您的问题，请加微信客服进行一对一咨询；",
        "question": "彩铃设置提示失败",
        "sort": 20
      },
      {
        id: 2,
        "answer":  "十分抱歉，由于引动运营商的限制，移动用户暂不能直接在小程序中设置彩铃，请您移步各大应用市场，搜索并下载铃声大全进行设置",
        "question": "为什么移动手机号不能设置彩铃？",
        "sort": 21
      },
      {
        id: 3,
        "answer": "我们的彩铃业务不会出现随意切换的情况，但不同彩铃业务会有优先级之分，请咨询运营商，查询您是否开通了其他类型的彩铃音乐包",
        "question": "为什么我的彩铃一直在自己换？",
        "sort": 40
      },
      {
        id: 4,
        "answer": "请您联系客服，进行一对一咨询",
        "question": "以上没有解决我的问题",
        "sort": 50
      }
    ]
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.faqs;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      faqs: list
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    /*
    userModel.getHelpInfo(function(data) {
      that.setData({
        faqs: data.data.faqs
      });
    }, function(e) {

    })
    */

    var config = wx.getStorageSync("appConfig")
    that.setData({
      wxid: config.wxm_set_ringtone_wechat_number
    })
    wx.request({
      url: 'https://enter.appdao.com/media/text?app=Appwill&tag=QandA&state=10',
      method: "GET",
      success: function (res) {
        if (res.data.status === 0) {
          that.setData({ faqs: res.data.data })
        }
      }
    })
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var appConfig = wx.getStorageSync('appConfig')
    var shareDesc = '最最最难难难的语音口令'
    if (appConfig['sp_share'] != '') {
      shareDesc = appConfig['sp_share']
    }
    return {
      path: '/pages/hongbao/hongbao',
      title: shareDesc,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  copyWxid: function () {
    wx.getStorage({
      key: 'appConfig',
      success: function (res) {
        var wxid = res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function () {
            wx.showToast({
              title: '客服微信号复制成功，快去添加好友吧',
              icon: 'none'
            })
          }
        })
      },
    })
  },
})
//app.js

var userModel = require('/api/userModel.js')
var awconfig = require('/api/awconfig.js')
var util = require('/utils/util.js')
var api = require('/api/api.js')

import { queue } from './utils/wx-queue-request.js'
queue()
App({
  globalData: {
    appID: null,
    appName: 'WXM_Ringtones',
    appVirsion: "0.1",
    isInReview: false,
    userInfo: {},
    host: 'https://page.appdao.com',
    playing: false,
    currentPlay: {},
    position: 0,
    currentId: -1,
    smartCoverHost: 'https://bj1-smartcover.appdao.com/',
    superRedhost: 'https://enter.appdao.com/',
  },
  onShow: function(options){
    console.log("App onShow")
    var that = this;
    // 每次进入小程序，请求AWConfig
    awconfig.loadConfig(function (data) {
      console.log(data);
      wx.setStorageSync('appConfig', data)
    }, function (e) {

    })
  },
  onLaunch: function () {
    var cookie = wx.getStorageSync('cookie') || "";
    var gb = wx.getStorageSync('globalData');
    gb && (this.globalData = gb)
    this.globalData.cookie = cookie;
    var that = this
    util.setApp(that);
    that.userLogin(function (data) {
      console.log('登录成功')
    }, function (e) {
    });
  },
  onHide: function () {
    wx.setStorageSync('globalData', this.globalData)
  },
  userLogin: function (successCallback, failCallback) {
    var that = this
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          try {
            wx.setStorageSync('code', res.code)
          } catch (e) {
          }
          var code = res.code;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    var encryptedData = res.encryptedData
                    var iv = res.iv
                    userModel.userLogin(code, function (data) {
                      if (data.status == 0) {
                        var session = data.data
                        wx.setStorageSync('sessionInfo', session)
                        that.uploadUserInfo(encryptedData, iv, data.data, function (data) {
                          successCallback(session)
                        }, function (data) {

                        })
                      }
                    }, function (e) {
                      if (failCallback != null) {
                        failCallback(e);
                      }
                    })
                  }
                })
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  checkAuth: function (successCallBack) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '小程序需要获取您的权限，请点击确认前往设置',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: function success(res) {
              // if (res.authSetting['scope.userInfo']) {
              successCallBack(res)
              // } else {

              // }
            }
          });
        } else if (!res.cancel) {
          that.checkAuth(successCallBack)
        }
      }
    })
  },
  uploadUserInfo: function (encryptedData, iv, session, successCallback, failCallback) {
    var that = this
    var uploadData = {
      'app': that.globalData.appName,
      'app_id': that.globalData.appID,
      'encrypted': encryptedData,
      'iv': iv,
    }
    var requestHeader = {
      'content-type': 'application/x-www-form-urlencoded',
      'session-id': session.trd_session
    }
    userModel.uploadUserInfo(uploadData, requestHeader, function (data) {
      console.log('上传用户信息成功')
      // that.setData({
      //   userInfo: data.data
      // })
      // console.log('1111111')
      wx.setStorageSync('globalUserInfo', data.data)
      console.log("globalUserInfo:" + data.data.is_vip)
      successCallback();
    }, function (e) {
      console.log('上传用户信息失败')
      failCallback()
    })
  },
  isInReview: function () {
    var that = this;
    var config = wx.getStorageSync('appConfig');
    if (config != null && config.wxm_in_review_version == that.globalData.appVersion) {
      return true;
    } else {
      return false;
    }
  },
  preplay: function () {
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    this.globalData.globalStop = true;
    wx.pauseBackgroundAudio();
  },
  gPlay: function(music){
    let that = this;
    let m = that.globalData.currentPlay
    console.log(m.url)
    //let m = music
    wx.playBackgroundAudio({
      dataUrl: m.url,
      title: m.name,
      coverImgUrl: m.icon,
      success: function (res) {
        //wx.seekBackgroundAudio({
        //  position: that.globalData.position,
        //})
        console.log(res)
        that.globalData.playing = true;
      }
    })
    console.log(this.globalData.currentId)
  },
  gStop: function () {
    var that = this
    wx.stopBackgroundAudio({
      success: function(){
        that.globalData.playing = false;
        if (wx.getBackgroundAudioManager) {
          wx.getBackgroundAudioManager({
            success: function (res) {
              that.globalData.position = res.currentPosition;
            }
          })
        }else{
          wx.getBackgroundAudioPlayerState({
            success: function (res) {
              that.globalData.position = res.currentPosition;
            }
          })
        }
      },
      fail: function(res){
        console.log(res)
      }
    })
  },
})

//var util = require('../../utils/util.js');

//music utils
var bsurl = require('../../utils/bsurl.js');
var async = require("../../utils/async.js");
var nt = require("../../utils/nt.js");

//wallpaper
var wallpapers = require("../../api/wallpapers.js")
var smartPage = require("../../api/smartPage.js")
var awconfig = require("../../api/awconfig.js")
var smartCover = require('../../api/smartCover.js')
var base64 = require('../../utils/base64.js')
var userModel = require('../../api/userModel.js')
var app = getApp();
var interval

import api from '../../api/api.js'
import util from '../../utils/util.js'

const RINGTONE_URL = 'https://ringtone.appdao.com/v2/ringtones?app=WXM_Ringtones&ev=0-nrVWE2g=&vcode=31&flag=&lang=zh&debug=vip'+ '&name={0}&page={1}&limit={2}&after={3}&sort={4}'

Page({
  data: {
    userInfo: {},
    date: new Date().getDate(),
    bannerData: [],
    hotPages: [],
    ringtones: [], 
    page: 1,
    count: 25,
    cursor: -1,
    isInReview: false,
    music: {},
    playing: false,
    currentPlay: {},
    currentId: 0,
    position: 0,
    from_share:false,
    animationData: {},
    showModal: 0
  },
/*==============================*/
  onShareAppMessage: function (res) {
    var fn = ""
    if (res.from === 'button') {
      fn = res.target.dataset.fn
      console.log(fn)
    }
    var appConfig = wx.getStorageSync('appConfig')
    var shareTitle = '抖音最火铃声都在这里了'
    if (appConfig['wxm_share_title']) {
      shareTitle = appConfig['wxm_share_title']
    }
    return {
      title: shareTitle,
      path: '/pages/index/index' + "?fn=" + fn
    }
  },
  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      success: function (user) {
        console.log(user)
        that.setData({
          userInfo: user.userInfo,
        })
      }
    })
    that.setData({
      recommendTag : '_all_',
      recommendSort : 'hot'
    })
    awconfig.registerConfigCallback(function () {
      that.awconfigSuccessCallback();
    }, function (error) {
      console.log('register wrong')
    });
    
    that.awconfigSuccessCallback()
    that.loadSmartCover()
    that.loadPages()

    that.refresh()
    if (options.fn !== undefined && options.fn !== ""){
      that.fromShare(options.fn)
      that.setData({
        from_share: true
      })
    }
  },
  onShow: function (e) {
  },
  onHide: function(){
    //clearInterval(interval)
  },
  onUnload: function () {
    wx.stopBackgroundAudio({
      success: function () {
        console.log('stopped')
        clearInterval(interval)
        that.setData({
          playing: false,
          position: 0,
        })
      }
    })
  },
  onReachBottom: function () {
    console.log("上拉拉加载更多...." + this.data.page)
    this.loadMore()
  },
  onPullDownRefresh: function (e) {
    console.log("下拉刷新....")
    this.refresh()
  },

  toHotSearch: function () {
    var that = this;
    that.setData({
      focus: false
    })
    wx.hideKeyboard()
    wx.navigateTo({
      url: '../hotSearch/hotSearch',
    })
  },
  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  bannerTap: function (event) {
    
    var that = this
    var index = event.currentTarget.dataset.currentIndex
    var contentCover = that.data.bannerData[index];
    if (contentCover.linkInfo) {
      //console.log('here')
      var urlInfo = util.parseSmartLinkUrl(contentCover.linkInfo.url)
      if (urlInfo.path != undefined && urlInfo.path != '' && (urlInfo.appid == undefined || urlInfo.appid == '')) {
        console.log('a')
        var path = base64.decode(urlInfo.path)
        wx.navigateTo({
          url: path,
        })
      } else if (urlInfo.path != undefined && urlInfo.path != '' && urlInfo.appid != undefined && urlInfo.appid != '') {
        console.log('b')
        var path = base64.decode(urlInfo.path)
        var appid = urlInfo.appid
        wx.navigateToMiniProgram({
          appId: appid,
          path: path,
          extraData: {
          },
          envVersion: 'release',
          success(res) {
            console.log(res)
          },
          fail(error) {
            console.log(error)
          }
        })
      } else if ((urlInfo.path == undefined || urlInfo.path == '') && (urlInfo.appid == undefined || urlInfo.appid == '') && urlInfo.name != undefined && urlInfo.name != '') {
        console.log('c')
        var name = urlInfo.name
        //var name = 'sw_page_rt_cata_douyinhot'
        var title = urlInfo.title
        var navigateUrl = "../pageDetail/pageDetail?page={0}&title={1}".format(name, title)
        //console.log(navigateUrl)
        wx.navigateTo({
          url: navigateUrl
        })
      }
      smartCover.sendLinkStatistics(contentCover.link, 1, function (data) {
        if (data.status == 0) {
          console.log('发送link统计成功')
        }
      }, function (error) {
        console.log('发送link统计失败')
      })
    } else {
      console.log('there')
    }
    console.log(contentCover)
    wx.stopBackgroundAudio({
      success: function () {
        console.log('stopped')
        clearInterval(interval)
        that.setData({
          playing: false,
          position: 0,
        })
      }
    })

  },

/** ================================== Methods ============================ */

  awconfigSuccessCallback:function(){
    var that = this;
    var config = wx.getStorageSync("appConfig");
    var isInReview = true
    if (config.wxm_in_review_version == app.globalData.appVersion) {
      isInReview = true
    } else {
      isInReview = false
    }
    //isInReview = false
    that.setData({
      isInReview: isInReview,
      recommendTag: config.wxm_rt_recommend_tag,
      recommendSort: config.wxm_rt_recommend_sort,
      shareTitle: config.wxm_rt_share_title,
      topText: config.wxm_rt_recommend_top_text,
      hotPagesName: config.wxm_rt_hot_pages,
    })
  //  if (beforeHotPagesName != config.wxm_hot_pages) {
  //    that.loadPages();
  //  }
  //  if (beforeRecommendTag != config.wxm_rt_recommend_tag) {
  //    that.refresh()
  //  }
  },
  cacheData: function () {
    try {
       //wx.setStorageSync('keyword', this.data.selectedKeyword),
        wx.setStorageSync('page', this.data.page)
        //wx.setStorageSync('selectedIndex', this.data.selectedIndex),
        //wx.setStorageSync('selectedItem', this.data.searchResult[this.data.selectedIndex])
    } catch (e) {
    }
  },
  refresh: function () {
    this.setData({
      searchResult: [],
      resultIndex: [],
      loading: false,
      loaded: false,
      loadtxt: '正在努力的加载...',
      page: 1,
      count: 36,
      maxID:"",
      selectedIndex: 0
    })
    this.loadMore()
  },
  loadPages: function () {
    var that = this;
    var params = {
      //name: that.data.hotPagesName
      name: 'rt_pages_mini_xiaochengxu'
      //name: 'pages_ringtones_v1'
    }
    smartPage.loadPages(params, function (data) {
      if (data != NaN && data.status == 0) {
        that.setData({
          hotPages: data.data.slice(0, 6),
        })
      }
    }, function (error) {
      that.setData({
      })
    })
  },
  loadSmartCover: function () {
    var that = this
    smartCover.loadAllSmartCover(function (data) {
      that.prepareSmartCoverData(data.data)
    }, function (error) {
      var data = [{
        "load_type": 1,
        "res": {},
        "link": 16119307,
        "c": 2,
        "tags": "",
        "monitor": {},
        "priority": 100,
        "page": 1,
        "duration": 0,
        "name": "【小程序】banner小清新",
        "options": "{}",
        "id": "676",
        "end_utc": 1522508400,
        "content": "{\"params\":{\"wp_forwardtype\":\"6\",\"banner_title\":\"\",\"wp_banner_img_width\":\"414\",\"wp_banner_img\":\"http:\\/\\/wpcover.appdao.com\\/da\\/21\\/da2158d9aae572826e650f09cdb9c506.gif\",\"banner_img_height\":\"240\",\"wp_banner_title\":\"\",\"wp_forwardlink\":\"16119307\",\"wp_forwarddata\":\"{\\\"monitor\\\":{\\\"in_server_v2\\\":\\\"\\\",\\\"out_server_v2\\\":\\\"\\\",\\\"type\\\":\\\"\\\"},\\\"id\\\":62966,\\\"status\\\":0,\\\"fullname\\\":\\\"16119307\\\",\\\"stats\\\":1,\\\"description\\\":\\\"\\\",\\\"newtype\\\":301,\\\"type\\\":101,\\\"tags\\\":\\\"小程序\\\",\\\"url\\\":\\\"app:\\\\\\/\\\\\\/forwardtypeinapp=wxm&name=sw_page_wp_mind_healing&title=治愈系\\\",\\\"is_short\\\":0,\\\"name\\\":\\\"【小程序】治愈\\\",\\\"lang\\\":2}\",\"banner_img_width\":\"414\",\"wp_location\":\"\",\"wp_banner_img_height\":\"240\"},\"pages\":{}}",
        "is_ad": 100,
        "state": 1,
        "ever": 1,
        "begin_utc": 1522051036,
        "interval": 60
      },
      {
        "load_type": 1,
        "res": {},
        "link": 16119563,
        "c": 2,
        "tags": "",
        "monitor": {},
        "priority": 100,
        "page": 1,
        "duration": 0,
        "name": "【小程序】创意文字page",
        "options": "{}",
        "id": "680",
        "end_utc": 1522222613,
        "content": "{\"params\":{\"wp_forwardtype\":\"6\",\"banner_title\":\"\",\"wp_banner_img_width\":\"414\",\"wp_banner_img\":\"http:\\/\\/wpcover.appdao.com\\/1f\\/c0\\/1fc02b393544f8e582a64d4ce274e18e.jpg\",\"banner_img_height\":\"240\",\"wp_banner_title\":\"\",\"wp_forwardlink\":\"16119563\",\"wp_forwarddata\":\"{\\\"id\\\":62967,\\\"status\\\":0,\\\"fullname\\\":\\\"16119563\\\",\\\"stats\\\":1,\\\"description\\\":\\\"\\\",\\\"type\\\":101,\\\"url\\\":\\\"app:\\\\\\/\\\\\\/forwardtypeinapp=wxm&name=sw_page_wp_pp_quotes_cn&title=创意文字\\\",\\\"tags\\\":\\\"小程序\\\",\\\"is_short\\\":0,\\\"newtype\\\":301,\\\"name\\\":\\\"【小程序】创意文字\\\",\\\"lang\\\":2}\",\"banner_img_width\":\"414\",\"wp_location\":\"\",\"wp_banner_img_height\":\"240\"},\"pages\":{}}",
        "is_ad": 100,
        "state": 1,
        "ever": 1,
        "begin_utc": 1522115776,
        "interval": 60
      }]
      that.prepareSmartCoverData(data)
    })
  },
  loadMore: function () {
    var that = this
    console.log("isloading:" + that.data.loading)
    if (that.data.loaded == true || that.data.loading==true) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
    })
    that.setData({
      loading: true
    })
    var requestUrl = util.formatUrl(RINGTONE_URL).format(that.data.recommendTag,that.data.page,that.data.count,that.data.cursor,that.data.recommendSort)
    console.log(requestUrl)
    wx.request({
      url: requestUrl,
      data: {},
      method: 'GET',
      success: function (res) {
        console.log(res)
        if (res.data.data != NaN && res.data.data.length > 0) {
          that.setData({
            ringtones: that.data.ringtones.concat(res.data.data),
            loading: false
          })
          if (res.data.info.count <  res.data.info.limit || res.data.info.page>14) {
            that.setData({
              loaded: true,
              loadtxt: "没有了~"
            })
          }
        } else {
          that.setData({
            loaded: true,
            loadtxt: "没有了~"
          })
        }
      },
      fail: function () {
        that.setData({
          loading: false
        })
      },
      complete: function () {
        that.setData({
          loading: false
        })
      }
    })
  },
  prepareSmartCoverData: function (data) {
    var that = this
    var length = data.length
    for (var i = 0; i < length; i++) {
      var contentCover = data[i]
      var content = contentCover.content
      var contentInfo = JSON.parse(content)
      var linkInfo = JSON.parse(contentInfo.params.wp_forwarddata)
      contentCover['contentInfo'] = contentInfo
      contentCover['linkInfo'] = linkInfo
    }
    that.setData({
      bannerData: data
    })
  },
  togglePlay: function(event) {
    console.log('toogleplay')
    var that = this
    //play here
    let music = event.currentTarget.dataset.music
    if (music.fullname != that.data.currentPlay.fullname){
      that.setData({
        from_share: false
      })
    }
    that.playMusic(music)
  },
  toggleStop: function(){
    var that = this
    if(that.data.from_share){
      wx.stopBackgroundAudio({
        success: function () {
          console.log('stopped')
          clearInterval(interval)
          that.setData({
            playing: false,
            position: 0,
          })
        }
      })
    }else{
      wx.stopBackgroundAudio({
        success:function(){
          clearInterval(interval)
          that.setData({
            playing: false,
            music: {},
            currentPlay: {},
            position: 0,
            from_share: false
          })
        }
      })
    }
  },
  setGlobalData: function(m){
    app.globalData.playing = true
    console.log(m.fullname)
    if (app.globalData.currentId != m.fullname){
      app.globalData.currentPlay = m
      app.globalData.currentId = m.fullname
      app.globalData.position = 0
    }
    console.log(app.globalData)
  },
  setThisRingtone: function(){
    var that = this
    wx.navigateTo({
      url: '../vip/vip',
    })
  },
  downloadThisRingtone: function(event) {
    var that= this
    wx.getSystemInfo({
      success: function(res){
        if (res.system.indexOf('iOS') != -1){
          console.log('ios')
          wx.navigateTo({
            url: '../activity/activity?page=28',
          })
        } else{
          console.log(event.currentTarget.dataset.du)
          var link = event.currentTarget.dataset.du
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
  },/*
  addService: function(event){
    var that = this
    var fullname = event.currentTarget.dataset.du
    wx.showModal({
      title: '设置铃声方式',
      content: '1.加客服微信\n2.复制铃声信息给客服',
      cancelText: "加客服",
      confirmText: "复制编号",
      success: function(res){
        if(res.cancel){
          wx.setClipboardData({
            data: "refertonull",
            success: wx.showToast({
              title: '已复制客服微信号，请您前往添加',
              icon: 'none'
          })
          })
        }else if(res.confirm){
          wx.setClipboardData({
            data: fullname,
            success: wx.showToast({
              title: '已复制兑换码,快去调戏客服吧',
              icon: 'none'
            })
          })
        }
      }
    })
  },*/
  addService: function(event){
    this.setData({
      showModal: 1
    })
  },
  addService2: function (event) {
    var config = wx.getStorageSync("appConfig")
    if (config.wxm_ringtone_base_url) {
      wx.navigateTo({
        url: '../activity/activity?base_url={0}&fullname={1}'.format(config.wxm_ringtone_base_url, this.data.currentId),
      })
    } else{
      this.setData({
      showModal: 2
    })
    }
  },
  hideModal: function(){
    this.setData({
      showModal: 0
    })
  },
  onCancel: function(){
    wx.getStorage({
      key: 'appConfig',
      success: function(res) {
        var wxid=res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function(){
            wx.showToast({
            title: '客服微信号复制成功，快去添加好友吧',
            icon: 'none'
          })}
        })
      },
    })
    this.hideModal()
  },
  onConfirm: function(event){
    wx.setClipboardData({
      data: this.data.currentId.toString(),
      success: function(){
        wx.showToast({
        title: '复制成功，去私信给客服吧',
        icon: 'none'
      })}
    })
    this.hideModal()
  },
  bindTapHotPage: function (event) {
    var that = this;
    if (event.detail.formId && event.detail.formId != 'the formId is a mock one') {
      var sessionInfo = wx.getStorageSync('sessionInfo')
      var globalUserInfo = wx.getStorageSync('globalUserInfo')
      if (sessionInfo && globalUserInfo) {
        var requestHeader = {
          'content-type': 'application/x-www-form-urlencoded',
          'session-id': sessionInfo.trd_session
        }
        var data = {
          'open_id': globalUserInfo.open_id,
          'app_id': app.globalData.appID,
          'form_id': event.detail.formId
        }
        userModel.uploadFormID(data, requestHeader, function (data) {
          console.log(data)
        }, function (error) {
          console.log(error)
        })
      }
    }
    var currentIndex = event.detail.target.dataset.currentIndex;
    var currentItem = that.data.hotPages[currentIndex];
    console.log(currentItem);
    var navigateUrl = "../pageDetail/pageDetail?page={0}&title={1}".format(currentItem.name, currentItem.title)
    console.log(navigateUrl)
    wx.navigateTo({
      url: navigateUrl
    })
    wx.stopBackgroundAudio({
      success: function () {
        console.log('stopped')
        clearInterval(interval)
        that.setData({
          playing: false,
          position: 0,
        })
      }
    })
  },
  
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  search: function(){
    wx.navigateTo({
      url: '../searchResult/searchResult?keyword=' + this.data.inputVal,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  fromShare: function (fullname) {
    var that = this
    wx.request({
      url: 'https://ringtone.appdao.com/apiv1/ringtone?ringtoneid=' + fullname,
      success: function (res) {
        if (res.data.status === 0) {
          let music = res.data.data
          that.setData({
            playing: false,
            music: music,
            currentPlay: music
          });
          //that.sleep(300)
          that.playMusic(music)
        }
      }
    })
  },
  playMusic: function(music){
    var that = this;
    wx.playBackgroundAudio({
      dataUrl: music.url,
      title: music.name,
      coverImgUrl: music.icon,
      success: function () {
        that.data.playing = true
        clearInterval(interval)
        that.setData({ 
          position: 0,
          currentId: music.fullname,
          playing: true,
          music: music,
          currentPlay: music
        });
        /*
        var animation = wx.createAnimation({
          duration: 1000*that.data.currentPlay.duration,
          timingFunction: 'linear',
          delay: 0,
        })
        animation.width("600rpx").step()
        that.setData({
          animationData: animation.export()
        })
        */
        
        interval = setInterval(function () {
          let posi = that.data.position + 0.2
          let playi = true
          if(posi > that.data.currentPlay.duration){
            playi = false
          }
          that.setData({
            position : posi,
            playing: playi
          })
    }, 200)
    
      }
    });
    
    
  },
  copyWxid: function(){
    wx.getStorage({
      key: 'appConfig',
      success: function (res) {
        var wxid = res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function(){
            wx.showToast({
            title: '客服微信号复制成功，快去添加好友吧',
            icon: 'none'
          })}
        })
      },
    })
  },
  sleep: function (milliSeconds){
    var startTime = new Date().getTime(); // get the current time    
    while(new Date().getTime() < startTime + milliSeconds);
  },
})

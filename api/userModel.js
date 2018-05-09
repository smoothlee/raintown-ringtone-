
import { get, post } from "../utils/network.js";
const util = require("../utils/util.js");
var superRedhost = "https://enter.appdao.com/"
// 用户登录
function userLogin(code, successCallback, failCallback) {
  //发送请求，获取session code
  var url = superRedhost + 'packet/v1/login'
  var data = {
    'code': code,
    'app': getApp().globalData.appName,
    'app_id': getApp().globalData.appID
  }
  var header = { 'content-type': 'application/x-www-form-urlencoded' }
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    });
}
// 上传用户信息
function uploadUserInfo(data, header, successCallback, failCallback) {
  var url = superRedhost + 'packet/v1/signin'
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
// 获取常见问题
function getHelpInfo(successCallback, failCallback) {
  var url = getApp().globalData.superRedhost + 'packet/v1/faq'
  get(url)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
// 用户举报
function userReport(data, header, successCallback, failCallback) {
  var url = getApp().globalData.superRedhost + 'packet/v1/reports'
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
function vipPay(data, header, successCallback, failCallback) {
  var url = getApp().globalData.superRedhost + 'packet/v1/vip'
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
//请求支付
function requestPayment(data, successCallback, failCallback) {
  if (data) {
    wx.requestPayment({
      'timeStamp': data.data.payment.timeStamp,
      'nonceStr': data.data.payment.nonceStr,
      'package': data.data.payment.package,
      'signType': data.data.payment.signType,
      'paySign': data.data.payment.paySign,
      'success': function (res) {
        successCallback(res)
      },
      'fail': function (res) {
        failCallback(res)
      }
    })
  }
}
// 支付结果回调到服务端
function paymentResultsCallbackToServer(data, header) {
  var url = getApp().globalData.superRedhost + 'packet/v1/vip/callback'
  post(url, data, header)
    .then(data => {
      console.log(data)
    })
    .catch(e => {
      console.log(e)
    })
}
//  兑换VIP
function exchangeVIP(data, header, successCallback, failCallback) {
  var url = getApp().globalData.superRedhost + 'packet/v1/vip/gift'
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
// 上传FormID
function uploadFormID(data, header, successCallback, failCallback) {
  var url = getApp().globalData.superRedhost + 'packet/v1/form'
  post(url, data, header)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
module.exports.userLogin = userLogin
module.exports.uploadUserInfo = uploadUserInfo
module.exports.getHelpInfo = getHelpInfo
module.exports.userReport = userReport
module.exports.vipPay = vipPay
module.exports.requestPayment = requestPayment
module.exports.paymentResultsCallbackToServer = paymentResultsCallbackToServer
module.exports.exchangeVIP = exchangeVIP
module.exports.uploadFormID = uploadFormID
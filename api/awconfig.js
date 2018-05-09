import { get, post } from "../utils/network.js"
const util = require("../utils/util.js");

var successCallbacks = [];
var failCallbacks = [];

function loadConfig(successCallback, failCallback) {
  var that = this;
  var url = "https://conf.appwill.com/conf"
  url = util.formatUrl(url)
  console.log("config url:" + url);
  console.log("successCallbacks:" + successCallbacks.length);
  var params = {}
  var header = {}
  get(url, params, header).then(data => {
    if (data != null && data.length != 0) {
      successCallback(data);
      for (var i = 0, length = successCallbacks.length;i<length;i++) {
        successCallbacks[i]();
      }
    } else {
      failCallback();
      for (var i = 0, i = failCallbacks.length; i < length; i++) {
        failCallbacks[i]();
      }
    }
  }).catch(e => {
    wx.hideLoading();
    failCallback();
  })
}

function registerConfigCallback(successCallback,failCallback){
  successCallbacks.push(successCallback);
  failCallbacks.push(failCallback);
}

module.exports = {
  loadConfig: loadConfig,
  registerConfigCallback: registerConfigCallback
}
import { get, post } from "../utils/network.js"
const util = require("../utils/util.js");

// 加载所有cover
function loadAllSmartCover(successCallback, failCallback) {
  var requestUrl = getApp().globalData.smartCoverHost + "v3/getlink"
  requestUrl = util.formatUrl(requestUrl) + '&type=1';
  get(requestUrl)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
// 点击cover发送link统计
function sendLinkStatistics(linkID, statisticeType, successCallback, failCallback) {
  var requestUrl = getApp().globalData.smartCoverHost + "feedback"
  requestUrl = util.formatUrl(requestUrl) + '&id=' + linkID + '&type=' + statisticeType;
  get(requestUrl)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

module.exports.loadAllSmartCover = loadAllSmartCover
module.exports.sendLinkStatistics = sendLinkStatistics
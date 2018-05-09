import { get, post } from "../utils/network.js"
const util = require("../utils/util.js");

function loadVideoList(params, successCallback, failCallback) {
  var requestUrl = "https://enter.appdao.com/api/v1/categories/100866/posts?ida=1234"
  requestUrl = util.formatUrl(requestUrl);
  get(requestUrl, params)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

function loadWXMiniList(params, successCallback, failCallback) {
  var requestUrl = "https://mv.appdao.com/wxmlist"
  requestUrl = util.formatUrl(requestUrl);
  get(requestUrl, params)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

module.exports = {
  loadVideoList: loadVideoList,
  loadWXMiniList: loadWXMiniList
}
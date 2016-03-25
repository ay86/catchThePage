/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description background script.
 * @Since 16/2/2
 */

var LOCAL_STORAGE = window.localStorage;
var TAB_ID, COUNT, TOTAL_TIME, SUCCESS_TOTAL;
var START_FLAG;

chrome.tabs.onSelectionChanged.addListener(function (tabId) {
	checkURL(tabId, function () {
		chrome.pageAction.show(tabId);
	});
});
// 当页面更新后发送消息给content script进行抓取
chrome.tabs.onUpdated.addListener(function (nTabId, oChange) {
	if (oChange.status === 'complete') {
		checkURL(nTabId, function () {
			chrome.pageAction.show(nTabId);
			if (nTabId == TAB_ID && START_FLAG) {
				fCatch();
			}
		});
	}
});
chrome.runtime.onMessage.addListener(function (oMessage, oSender, fCb) {
	if (oMessage.catch) {
		fCounter();
	}
	else {
		//console.log(oSender);
		fSendMessage({console: true, data: JSON.stringify(oMessage)});
		var oData = oMessage;
		var sPostURL = LOCAL_STORAGE.getItem('CC_postUrl');
		if (sPostURL) {
			SUCCESS_TOTAL++;
			$.ajax({
				url: sPostURL,
				method: 'post',
				data: oData,
				success: function () {
					fSendMessage('send data successfully!');
				},
				error: function (e) {
					fSendMessage({console: true, error: e});
				}
			});
		}
	}
});

/* 开始 */
function fStart(nTabId) {
	TAB_ID = nTabId;
	COUNT = 1;
	TOTAL_TIME = new Date();
	SUCCESS_TOTAL = 0;
	START_FLAG = true;
	fTogglePage();
}
/* 切换页面 */
function fTogglePage() {
	var nId = LOCAL_STORAGE.getItem('CC_startId');
	// 每次抓取都根据ID去获取需要查询的关键词
	// TODO 后期把访问地址也做进配置里
	$.get(LOCAL_STORAGE.getItem('CC_catchUrl') + nId, function (jRes) {
		if (jRes !== '--0') {
			chrome.tabs.update(TAB_ID, {
				url: LOCAL_STORAGE.getItem('CC_targetUrl') + jRes
			});
		}
		else {
			fCounter();
		}
	});
}
/* 统计器 */
function fCounter() {
	var nId = LOCAL_STORAGE.getItem('CC_startId');
	var nTotal = LOCAL_STORAGE.getItem('CC_total');
	var nDelay = LOCAL_STORAGE.getItem('CC_delay');
	var nLoop = LOCAL_STORAGE.getItem('CC_loop');

	LOCAL_STORAGE.setItem('CC_startId', ++nId);
	if (COUNT < nTotal) {
		// 如果是在一定周期内的次数将延时下一次执行
		if (COUNT % nLoop !== 0) {
			nDelay = 0;
		}
		COUNT++;
		console.log('current:', nDelay, COUNT, nLoop, COUNT % nLoop);
		setTimeout(fTogglePage, nDelay);
	}
	else {
		START_FLAG = false;
		chrome.pageAction.setIcon({tabId: TAB_ID, path: 'images/icon_stop.png'});
		notifyMe('完成, 处理: ' + COUNT + ', 成功: ' + SUCCESS_TOTAL + ', 耗时: ' + Math.round((new Date() - TOTAL_TIME) / 1000) + 's');
	}
}
/* 获取当前页面数据 */
function fCatch(bBreak) {
	var nId = LOCAL_STORAGE.getItem('CC_startId');
	fSendMessage('id: ' + nId);
	fSendMessage({console: false, catch: true, id: nId, break: bBreak});
}
/* 与content script的通信函数 */
function fSendMessage(oData, fCb) {
	chrome.tabs.sendMessage(TAB_ID, oData, fCb);
}
/* 通知提示 */
function notifyMe(sText) {
	if (!("Notification" in window)) {
		fSendMessage("This browser does not support desktop notification");
	}
	else if (Notification.permission === "granted") {
		var notification = new Notification(sText);
	}
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				var notification = new Notification(sText);
			}
		});
	}
}
/* 检测当前URL是否采集的URL一致 */
function checkURL(nTabId, fCb) {
	chrome.tabs.get(nTabId, function (oTab) {
		var sUrl = oTab.url;
		var sSetUrl = LOCAL_STORAGE.getItem('CC_targetUrl');
		sUrl = sUrl.substr(sUrl.indexOf('//') + 2);
		sUrl = sUrl.substr(0, sUrl.indexOf('/'));
		sSetUrl = sSetUrl.substr(sSetUrl.indexOf('//') + 2);
		sSetUrl = sSetUrl.substr(0, sSetUrl.indexOf('/'));
		console.log(sSetUrl, sUrl, oTab);
		if (sUrl === sSetUrl) {
			// 地址一致的话显示插件图标
			fCb();
		}
	});
}
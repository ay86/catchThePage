/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Core.js
 * @Since 2016/11/25
 */

var LOCAL_STORAGE = window.localStorage;
var TASK_LIST = [];
var FAIL_LIST = [];
var X_ID, TAB_ID, COUNT, START_TIME, SUCCESS_TOTAL;
var START_FLAG;
var ROBOT_RESET, RETRY_TIMER;

/* 检测 url 是否匹配规则 */
function fCheckUrlRule(nTabId, fCb) {
	// 获取对应标签页信息
	chrome.tabs.get(nTabId, function (oTab) {
		var sUrl = oTab.url;
		var sType = LOCAL_STORAGE.getItem('catch.opt.type');
		var aRule = [];
		if (sType === 'sync') {
			aRule = JSON.parse('[' + LOCAL_STORAGE.getItem('catch.opt.result') + ']');
		}
		else {
			var sRule = LOCAL_STORAGE.getItem('catch.opt.rule');
			if (sRule.length) {
				var aOptRule = sRule.replace(/\r/g, '').split('\n');
				var oRule = {};
				for (var i = 0; i < aOptRule.length; i++) {
					var aItem = aOptRule[i].split(':');
					oRule[aItem[0]] = aItem[1];
				}
				aRule.push({url: sUrl, rule: oRule});
			}
		}
		console.info(aRule);
		var oMatchRule = _.find(aRule, function (oItem) {
			return sUrl.indexOf(oItem.url) > -1;
		});
		if (oMatchRule) {
			fCb(oMatchRule);
		}
		else {
			fSendMessage('Not matched rules.');
			fTogglePage();
		}
	});
}
/* 通知提示 */
function fNotifyMe(sText) {
	var sAppName = 'Content Catcher';
	var oNotify = {
		tab : 'CCResult',
		icon: 'images/icon.png',
		body: sText
	};
	var notification;
	if (!("Notification" in window)) {
		fSendMessage('This browser does not support desktop notification');
	}
	else if (Notification.permission === 'granted') {
		notification = new Notification(sAppName, oNotify);
	}
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
			if (permission === 'granted') {
				notification = new Notification(sAppName, oNotify);
			}
		});
	}
	notification.onclick = function () {
		notification.close();
	}
}
/* 与 content script 的通信函数 */
function fSendMessage(oData, fCb) {
	chrome.tabs.sendMessage(TAB_ID, oData, fCb);
}
/* 跳转任务页面 */
function fTogglePage() {
	var aURL = TASK_LIST.splice(0, 1);
	X_ID = null;
	if (aURL.length) {
		COUNT++;
		var sTargetUrl = aURL[0];
		var aTarget = sTargetUrl.split(' ');
		if (aTarget.length > 1) {
			X_ID = aTarget[0];
			sTargetUrl = aTarget[1];
		}
		else {
			sTargetUrl = aTarget[0];
		}
		chrome.tabs.update(TAB_ID, {
			url: sTargetUrl
		});
	}
	else {
		fEnd();
	}
}
/* 通知页面开始抓取 */
function fCatch(oRule) {
	fSendMessage('Match rule: ' + JSON.stringify(oRule.rule));
	fSendMessage({console: false, catch: true, rule: oRule, id: X_ID});
}

function fSetTask(aTask) {
	if (aTask instanceof Array) {
		TASK_LIST = aTask;
	}
	else {
		for (var k in aTask) {
			if (aTask.hasOwnProperty(k)) {
				TASK_LIST.push(k + ' ' + encodeURI(aTask[k]));
			}
		}
	}
	TASK_LIST = _.uniq(TASK_LIST);
}

function fGetTask() {
	return TASK_LIST.join(',');
}
function fStart(nTabId, aTasks) {
	TAB_ID = nTabId;
	TASK_LIST = aTasks;
	START_FLAG = true;
	START_TIME = new Date();
	COUNT = 0;
	SUCCESS_TOTAL = 0;
	fTogglePage();
}
function fEnd() {
	START_FLAG = false;
	chrome.pageAction.setIcon({tabId: TAB_ID, path: 'images/icon_stop.png'});
	var oResult = {
		console : true,
		total   : COUNT,
		success : SUCCESS_TOTAL,
		fail    : COUNT - SUCCESS_TOTAL,
		time    : new Date() - START_TIME,
		failList: FAIL_LIST
	};
	fSendMessage(oResult);
	fSendMessage('All task complete.');
	fNotifyMe('完成, 处理: ' + oResult.total + ', 成功: ' + oResult.success + ', 耗时: ' + Math.round(oResult.time / 1000) + 's');
}

(function (_, chrome, $) {
	// 接收与 content script 通信
	chrome.runtime.onMessage.addListener(function (oMessage, oSender, fCb) {
		var oData = oMessage;
		if (oData.robot) {
			var nRetry = parseInt(LOCAL_STORAGE.getItem('catch.set.retry'), 10);
			ROBOT_RESET = true;
			if (nRetry > 0) {
				RETRY_TIMER = setTimeout(function () {
					fSendMessage({retry: true});
				}, nRetry * 1000 * 60);
				fSendMessage('Waiting robot time ' + nRetry + ' minutes.');
			}
			else {
				fTogglePage();
			}
			return;
		}
		if (!_.size(oData)) {
			fSendMessage('Data is empty!');
			FAIL_LIST.push(oSender.url);
			fTogglePage();
			return;
		}
		var sPostURL = LOCAL_STORAGE.getItem('catch.set.submit');
		$.ajax({
			method    : 'post',
			url       : sPostURL,
			data      : oData,
			dataType  : 'json',
			retryCount: 3,
			success   : function (jRes) {
				jRes.error && console.warn(jRes.errorText, '-', jRes.source);
				SUCCESS_TOTAL++;
				fSendMessage('Send data successfully!');
				//	执行下一个任务
				fTogglePage();
			},
			error     : function (e) {
				fSendMessage({console: true, error: e});
			}
		});
	});
	// 标签页切换时
	chrome.tabs.onSelectionChanged.addListener(function (tabId) {
		//	判断是否规则内 url 显示插件
		chrome.pageAction.show(tabId);
	});
	// 当页面更新后发送消息给 content script 进行抓取
	chrome.tabs.onUpdated.addListener(function (nTabId, oChange) {
		if (oChange.status === 'complete' && nTabId == TAB_ID && START_FLAG) {
			fCheckUrlRule(nTabId, function (oRule) {
				chrome.pageAction.show(nTabId);
				// 当进入机器人时间时刷新页面则重置相关设置
				if (ROBOT_RESET) {
					ROBOT_RESET = false;
					clearTimeout(RETRY_TIMER);
				}
				fCatch(oRule);
			});
		}
	});
})(_, chrome, jClass);
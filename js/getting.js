/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description 抓取页面内容
 * @Since 2016/12/9
 */

function fGetContent(oRule, xId) {
	var $ = jClass;
	var oData = {};
	var jRule = oRule.rule;
	var bRobot;
	if (oRule.robot && oRule.robot.length > 0) {
		bRobot = new RegExp(oRule.robot, 'g').test($('body').text())
	}
	if (bRobot) {
		oData.robot = true;
	}
	else {
		var nOther = 0;
		for (var v in jRule) {
			if (jRule.hasOwnProperty(v)) {
				oData[v] = $(jRule[v]).html();
				nOther++;
			}
		}
		if (nOther > 0 && xId && oRule['idKey']) {
			oData[oRule['idKey']] = xId;
		}
	}
	// 传递给 background script
	chrome.runtime.sendMessage(oData);
}

(function () {
	// 接收与 backgroud script 的通信
	chrome.runtime.onMessage.addListener(function (request, sender, callback) {
		if (request.catch) {
			fGetContent(request.rule, request.id);
		}
		else if (request.retry) {
			window.location.reload();
			return;
		}
		if (typeof request !== 'object' || request.console) {
			delete request.console;
			console.info(request);
		}
		callback({success: true});
	});
})();
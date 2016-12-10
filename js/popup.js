/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description popup script.
 * @Since 16/2/3
 */

var $ = jClass;
$(function () {
	var bg = chrome.extension.getBackgroundPage();
	var oLocalStorage = window.localStorage;

	var $RemoteUrl = $('#remoteUrl');
	var $SubmitUrl = $('#submitUrl');
	var $RetryTime = $('#retryTime');

	function fCheckRequire() {
		if ($RemoteUrl.val()) {
			$('#takeTask').removeAttr('disabled');
		}
		else {
			$('#takeTask').attr('disabled', true);
		}

		if ($SubmitUrl.val()) {
			$('#start').removeAttr('disabled');
		}
		else {
			$('#start').attr('disabled', true);
		}
	}

	$RemoteUrl.val(oLocalStorage.getItem('catch.set.remote'));
	$SubmitUrl.val(oLocalStorage.getItem('catch.set.submit'));
	$RetryTime.val(oLocalStorage.getItem('catch.set.retry'));

	fCheckRequire();

	//	显示已存在的任务
	var sTasks = bg.fGetTask();
	if (sTasks.length) {
		$('#taskInfo').removeClass('hidden').find('span').html(sTasks.split(',').length);
	}

	$RemoteUrl.on('change', function () {
		oLocalStorage.setItem('catch.set.remote', $(this).val());
		fCheckRequire();
	});
	$SubmitUrl.on('change', function () {
		oLocalStorage.setItem('catch.set.submit', $(this).val());
		if (this.value === '') {
			$(this).addClass('border-error');
		}
		else {
			$(this).removeClass('border-error');
		}
		fCheckRequire();
	});
	$RetryTime.on('change', function () {
		oLocalStorage.setItem('catch.set.retry', $(this).val());
	});

	// 接收任务
	$('#takeTask').on('click', function () {
		$.ajax({
			url     : $RemoteUrl.val(),
			cache   : false,
			dataType: 'json',
			success : function (jRes) {
				if (jRes.error) {
					jRes = JSON.parse(jRes.source);
				}
				bg.fSetTask(jRes);
				$('#taskInfo').removeClass('hidden').find('span').html(jRes.length);
				$(this).addClass('btn-success');
			},
			error   : function () {
				$(this).addClass('btn-error');
			}
		});
	});

	// 获取当前激活窗口标签的信息
	chrome.tabs.query({active: true, currentWindow: true}, function (aTab) {
		var nTabId = aTab[0].id;
		var sUrl = aTab[0].url;

		// 执行任务
		$('@setting').on('submit', function () {
			var sTask = bg.fGetTask();
			sTask = sTask || sUrl;
			var aTask = sTask.split(',');

			oLocalStorage.setItem('catch.set.remote', $RemoteUrl.val());
			oLocalStorage.setItem('catch.set.submit', $SubmitUrl.val());
			oLocalStorage.setItem('catch.set.retry', $RetryTime.val());

			bg.fStart(nTabId, aTask);
			window.close();
			return false;
		});
	});
});
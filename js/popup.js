/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description popup script.
 * @Since 16/2/3
 */

$(function () {
	var bg = chrome.extension.getBackgroundPage();
	chrome.tabs.query({active: true, currentWindow: true}, function (aTab) {
		var nTabId = aTab[0].id;
		var wLocalSto = window.localStorage;

		var $Total = $('#total');
		var $StartId = $('#startId');

		$StartId.val(wLocalSto.getItem('CC_startId') || 1);
		$Total.val(wLocalSto.getItem('CC_total') || 200);

		$StartId.on('change', function () {
			wLocalSto.setItem('CC_startId', $(this).val());
		});
		$Total.on('change', function () {
			wLocalSto.setItem('CC_total', $(this).val());
		});

		$('#start').on('click', function () {
			bg.fStart(nTabId);
			window.close();
		});

		$('#catch').on('click', function () {
			bg.fCatch(true);
			window.close();
		});
	});
});
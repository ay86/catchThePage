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
		var $Delay = $('#delay');
		var $Loop = $('#loop');

		$StartId.val(wLocalSto.getItem('CC_startId') || 1);
		$Total.val(wLocalSto.getItem('CC_total') || 200);
		$Delay.val(wLocalSto.getItem('CC_delay') || 1000);
		$Loop.val(wLocalSto.getItem('CC_loop') || 10);

		$StartId.on('change', function () {
			wLocalSto.setItem('CC_startId', $(this).val());
		});
		$Total.on('change', function () {
			wLocalSto.setItem('CC_total', $(this).val());
		});
		$Delay.on('change', function () {
			wLocalSto.setItem('CC_delay', $(this).val());
		});
		$Loop.on('change', function () {
			wLocalSto.setItem('CC_loop', $(this).val());
		});

		$('#start').on('click', function () {
			wLocalSto.setItem('CC_startId', $StartId.val());
			wLocalSto.setItem('CC_total', $Total.val());
			wLocalSto.setItem('CC_delay', $Delay.val());
			wLocalSto.setItem('CC_loop', $Loop.val());

			bg.fStart(nTabId);
			window.close();
		});

		$('#catch').on('click', function () {
			bg.fCatch(true);
			window.close();
		});
	});
});
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
		var $Retry = $('#retry');

		$StartId.val(wLocalSto.getItem('CC_startId'));
		$Total.val(wLocalSto.getItem('CC_total'));
		$Delay.val(wLocalSto.getItem('CC_delay'));
		$Loop.val(wLocalSto.getItem('CC_loop'));
		$Retry.val(wLocalSto.getItem('CC_retry'));

		$StartId.on('change', function () {
			wLocalSto.setItem('CC_startId', $(this).val());
			$(this).removeClass('has-error');
		});
		$Total.on('change', function () {
			wLocalSto.setItem('CC_total', $(this).val());
			$(this).removeClass('has-error');
		});
		$Delay.on('change', function () {
			wLocalSto.setItem('CC_delay', $(this).val());
			$(this).removeClass('has-error');
		});
		$Loop.on('change', function () {
			wLocalSto.setItem('CC_loop', $(this).val());
			$(this).removeClass('has-error');
		});
		$Retry.on('change', function () {
			wLocalSto.setItem('CC_retry', $(this).val());
			$(this).removeClass('has-error');
		});

		$('#start').on('click', function () {
			var bDone = true;
			$('form input').each(function () {
				if (!this.value.toString().length) {
					$(this).addClass('has-error');
					bDone = false;
					return false;
				}
			});

			if (bDone) {
				wLocalSto.setItem('CC_startId', $StartId.val());
				wLocalSto.setItem('CC_total', $Total.val());
				wLocalSto.setItem('CC_delay', $Delay.val());
				wLocalSto.setItem('CC_loop', $Loop.val());
				wLocalSto.setItem('CC_retry', $Retry.val());

				bg.fStart(nTabId);
				window.close();
			}
		});

		$('#catch').on('click', function () {
			bg.fInit(nTabId);
			bg.fCatch(true);
			window.close();
		});
	});
});
/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description options page
 * @Since 16/2/18
 */

$(function () {
	var wLocalSto = window.localStorage;
	var $Url = $('#url');
	var $CatchUrl = $('#catchUrl');
	var $TargetUrl = $('#targetUrl');

	$Url.val(wLocalSto.getItem('CC_postUrl') || '');
	$CatchUrl.val(wLocalSto.getItem('CC_catchUrl') || '');
	$TargetUrl.val(wLocalSto.getItem('CC_targetUrl') || '');

	$('#save').on('click', function () {
		wLocalSto.setItem('CC_postUrl', $Url.val());
		wLocalSto.setItem('CC_catchUrl', $CatchUrl.val());
		wLocalSto.setItem('CC_targetUrl', $TargetUrl.val());
		$(this).addClass('button-success').text('保存成功');
	});
	$('input').on('keypress', function () {
		$('#save').removeClass('button-success').text('保存');
	});
});
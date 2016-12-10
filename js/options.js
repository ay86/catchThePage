/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description options page
 * @Since 16/2/18
 */

var $ = jClass;
$(function () {
	var oLocalStorage = window.localStorage;
	var sType = oLocalStorage.getItem('catch.opt.type');
	var sRule = oLocalStorage.getItem('catch.opt.rule');
	var sSync = oLocalStorage.getItem('catch.opt.sync');
	var sResult = oLocalStorage.getItem('catch.opt.result');
	var sDate = oLocalStorage.getItem('catch.opt.syncDate');

	$('.tab-opt').hide();
	$('#' + sType).show();
	$('@type[value="' + sType + '"]').attr('checked', true);
	$('#rule').val(sRule);
	$('#syncUrl').val(sSync);
	$('#syncDate').html(sDate);
	$('#syncResult').val(sResult);

	$('form input[type="radio"]').on('change', function () {
		$('.tab-opt').hide();
		$('#' + this.value).show();
	});

	$('#getSync').on('click', function () {
		var sURL = $('#syncUrl').val();
		var oIcon = $('i', this);
		oLocalStorage.setItem('catch.opt.sync', sURL);
		oIcon.addClass('sa-icon-spin');
		$.ajax({
			method : 'get',
			url    : sURL,
			success: function (jRes) {
				var dDate = new Date();
				$('#syncDate').html(dDate.toLocaleString());
				$('#syncResult').val(jRes);
				oLocalStorage.setItem('catch.opt.syncDate', dDate.toLocaleString());
				oIcon.removeClass('sa-icon-spin');
			},
			error  : function () {
				alert('同步失败，请稍候重试！');
				oIcon.removeClass('sa-icon-spin');
			}
		});
	});

	$('form').on('submit', function () {
		var oElement = this.elements;

		oLocalStorage.setItem('catch.opt.type', oElement['type'].value);
		oLocalStorage.setItem('catch.opt.rule', oElement['rule'].value);
		oLocalStorage.setItem('catch.opt.result', oElement['syncResult'].value);

		alert('保存成功！');
		return false;
	});

});
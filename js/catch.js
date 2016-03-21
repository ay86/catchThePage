/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description content script.
 * @Since 16/2/2
 */

function fGetContent(sId, bContinue) {
	//var oBody = document.getElementsByTagName('body')[0];
	var $Div = $('body');
	var nId = sId || 0;
	var sPath = '';
	var sDetail = '';

	if ($('#productdetail-box1').length) {
		var $Img = $Div.find('#ctl00_ContentMain_img1');
		if ($Img.length) {
			var src = $Img.attr('src').replace('../../../', '');
			src = src.replace('/images/', '/lrg/');
			sPath = 'http://uk.mouser.com/' + src;
		}
		$Div.find('img:not([src$="icon_rohs.gif"])').remove();
		var $Table = $Div.find('#spec table');
		if ($Table.length) {
			$Table.find('.find-similar').remove();
			var $Any = $Table.find('*');
			$Any.each(function () {
				this.removeAttribute('class');
				this.removeAttribute('id');
				this.removeAttribute('href');
				if ((this.tagName.toUpperCase() === 'IMG') && (this.src.indexOf('icon_rohs.gif') > 0)) {
					this.parentNode.innerHTML = '<img alt="RoHS" src="/images/icon_rohs.gif">';
				}
			});

			$Table.removeAttr('id').removeAttr('class').removeAttr('rules');
			sDetail = $Table[0].outerHTML.replace(/\t/g, '');
		}
	}
	var oData;
	if (sPath || sDetail) {
		oData = {
			act: 'save',
			image: sPath,
			detail: sDetail,
			id: nId
		};
	}
	else if ($Div.html().indexOf('did not return any results.') > -1) {
		oData = {
			act: 'bad',
			id: nId
		};
	}
	else if ($Div.html().indexOf('Pardon Our Interruption') > -1) {
		return;
	}
	else {
		oData = {
			act: 'tick',
			id: nId
		}
	}
	chrome.runtime.sendMessage(oData);
	if (bContinue) {
		setTimeout(function () {
			chrome.runtime.sendMessage({catch: true});
		}, 100 + Math.random() * 200);
	}

	//chrome.extension.connect({name: 'send'}).postMessage(oData);
	//chrome.extension.connect({name: 'catch'}).postMessage({success: true});
}
//$('script').remove();
//$('iframe').remove();
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	if (request.catch) {
		fGetContent(request.id, !request.break);
	}
	if (typeof request !== 'object' || request.console) {
		delete request.console;
		console.info(request);
	}
	callback({success: true});
});
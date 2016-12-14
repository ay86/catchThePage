# Content Catcher

> Author: AngusYoung <angusyoung@mrxcool.com>

> Since: 2016-02-02

### 什么是CC？

Content Catcher 是一个 Chrome 的扩展插件，通过设置抓取规则采集所需数据。支持远程同步任务，远程提交，远程同步规则。

作用你懂的。

### 怎么用？

直接通过 `chrome://extensions/` 加载本扩展，由于开发者认证需要 $ 所以就不上架 Chrome WebStore 了（严重怀疑也过不了审核-_-#）。
如果你不知道怎么加载扩展，额...麻烦下一位（妹纸请加我，包教会）。

### 配置

- [选项配置](#选项配置)
- [POPUP设置](#popup设置)

#### 选项配置
选项配置包括两种方式，一种是纯手动方式，需要手动定义抓取规则。

eg.

	title:#title-id
	content:.content-class
	
每一行定义一条抓取规则，格式为 `key:selector` 其中 `key` 为提交时的参数名，`selector` 是一个 `DOM` 选择器作用就是抓取此 element 的内容以参数名为 `key` 的结果提交到远程地址。

手动规则对当前页面生效，不验证是否匹配 URL 。

另外一种配置是同步远程配置（也可以是localhost），同步结果为 `JSON` 格式的数组，允许存在多个网站的规则并可配置扩展选项。

eg.

	{
		"url"  : "http://www.com",
		"rule" : {
			"title"  : ".title-class",
			"content": ".content-class",
			"image"  : ".image-class"
		},
		"robot": "Pardon Our Interruption",
		"idKey": "id"
	},
	{
	  ...
	}

其中 `url` 指定了规则所匹配的页面地址，`rule` 里的内容于手动输入的规则一样。`robot` 是指目标地址存在反机器人时出现的内容，用此来标识区分正常抓取页面的内容，并抛出一个中断的指令等待重试（或跳过）。`idKey` 是一个较为特殊的参数，它指定了当最终数据提交时是否带上任务队列携带的 ID ，并以此值作为该数据的键名提交。
例如任务存在一个提交数据时需带上的 `uid` 参数，则可在此设置为 `"idKey" : "uid"` 。

#### POPUP设置
POPUP设置主要工作是执行任务，在界面上可以设置远程提交地址以及远程任务接收地址。通过远程接收任务可以实现批量化的抓取工作。扩展会自动按照任务地址跳转并完成抓取任务，直到全部完成。

远程任务接口返回的格式有两种，一种是纯任务的，每一行一条地址。

eg.

	http://www.com/abc.html
	http://www.com/def.html

一种是携带扩展需求的则是返回 `JSON` 格式的数据。

eg.

	{
		"123":"http://www.com/abc.html",
		"456":"http://www.com/efg.html"
	}
	
前面的数字 `123` `456` 表示前面配置的 `idKey` 对应传递的值。如果双方没有同时存在将勿略此项。

### 未来？

也许考虑加入 selection range 内容的采集而不单依赖于规则， who knows ...

欢迎给我反馈意见，EMail ISSUE 都可以，妹纸请加我微信[留口水]
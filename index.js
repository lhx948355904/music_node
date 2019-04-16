// 初始化 express
var app = require('express')();

var request = require('superagent');

var cheerio = require('cheerio');
/**
 * 开启路由
 * 第一个参数指定路由地址,当前指向的是 localhost:3000/
 * 如果需要其他路由,可以这样定义,比如 需要我们的获取推荐歌单的路由 /recommendLst
 * app.get('/recommendLst', function(req, res){});
 */
app.get('/playlist/:status/:cate/:limit/:offset', function(req, res){
	//获取歌单 和 页数
	var status = req.params.status,
		cate = encodeURI(req.params.cate),
		limit = req.params.limit,
		offset = req.params.offset,
		resObj = {
			code:200,
			data:[],
			pageCount:0,
		};
		
	request.get(`https://music.163.com/discover/playlist/?order=${status}&cat=${cate}&limit=${limit}&offset=${offset}`).end(function(err,_response){
    	
    	var dom = _response.text;
    	
    	var $ = cheerio.load(dom);
    	
    	$(".m-cvrlst").eq(0).find("li").each(function(index,obj){
    		var img = $(obj).find('img').attr('src');
    		var count = $(obj).find('.nb').text();
    		var name = $(obj).find('.dec').find('.tit').text();
    		var namehref = "https://music.163.com"+$(obj).find('.dec').find('.tit').attr('href');
    		var author = $(obj).children("p").eq(1).children('a').text();
    		var authorhref = "https://music.163.com"+$(obj).children("p").eq(1).children('a').attr('href');
    		var star = $(obj).children("p").eq(1).children('sup').length>0;
    		
    		resObj.data.push({
    			imgSrc:img,
    			time:count,
    			title:name,
    			author:author,
    			star:star,
    			authorhref:authorhref,
    			namehref:namehref
    		})
    	})
    	var data = $(".u-page").eq(0).find('.zpgi');
		var i = data.length-1;
    	resObj.pageCount = data.eq(i).text();
    	
    	res.send(resObj)
    })
}).get('/playlist/cate',function(req,res){
	//歌单分类
	var resObj = {
		data:[]
	}
	
	request.get('https://music.163.com/discover/playlist').end(function(err,_response){
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		$("#cateListBox").find('dl').each(function(index,obj){
			var arr = [];
			var key = $(obj).find("dt").text().replace(/[^\u4e00-\u9fa5]/gi,"");
			$(obj).find('a').each(function(indexx,objj){
				arr.push($(objj).text())
			})
			resObj.data.push({
				'key':key,
				'value':arr
			})
		})
		
		res.send(resObj)
	})
}).get('/radioCate',function(req,res){
	//电台分类
	var resObj = {
		data:[]
	}
	
	request.get("https://music.163.com/discover/djradio").end(function(err,_response){
		
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		$(".boxes").eq(0).find('li').each(function(index,obj){
			resObj.data.push({
				id:$(obj).find('a').attr('href').split('id=')[1],
				name:$(obj).find('em').text(),
				img:$(obj).find('div').attr('style')
			})
		})
		
		res.send(resObj)
	})
}).get('/radioData/:id/:pageSize',function(req,res){
	var id = req.params.id;
	var offset = req.params.pageSize*30;
	
	var resObj = {
		newRadio:[],
		dataList:[],
		pageCount:"",
	}
	
	request.get(`https://music.163.com/discover/djradio/category?id=${id}&order=1&_hash=allradios&limit=30&offset=${offset}`).end((err,_response)=>{
		var dom = _response.text;
		var $ = cheerio.load(dom);
		
		$(".new").find('li').each(function(index,obj){
			resObj.newRadio.push({
				href:"https://music.163.com"+$(obj).find('a').eq(0).attr('href'),
				img:$(obj).find('img').attr('src'),
				title1:$(obj).find('a').eq(1).text(),
				title2:$(obj).find('p').text()
			})
		})
		
		$("#allradios").find('li').each(function(index,obj){
			resObj.dataList.push({
				href:"https://music.163.com"+$(obj).find('a').eq(0).attr('href'),
				img:$(obj).find('img').attr('src'),
				title:$(obj).find('a').eq(1).text(),
				title2:$(obj).find('p').eq(1).text(),
				author:$(obj).find('a').eq(2).text(),
				authorHref:"https://music.163.com"+$(obj).find('a').eq(2).attr('href')
			})
		})
		
		var data = $(".u-page").eq(0).find('.zpgi');
		var i = data.length-1;
    	resObj.pageCount = data.eq(i).text();
		
		res.send(resObj);
	})
	
})
/**
 * 开启express服务,监听本机3000端口
 * 第二个参数是开启成功后的回调函数
 */
var server = app.listen(81, function(){
    // 如果 express 开启成功,则会执行这个方法
    var port = server.address().port;

    console.log(`地址为http://localhost:${port}`);
});
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
app

//获取歌曲
.get('/getSong/:id',function(req,res){
	var id = req.params.id;
	
	var song = {
		
	}
	
	request.get(``).end((err,_response)=>{
		console.log(_response);
		
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		res.send(JSON.stringify(_response));
	})
})

//首页数据
.get('/indexData',function(req,res){
	var data = {
		hotSong:[],
		styleSong:[],
		newSong:[],
		songList:[]
	}
	
	request.get("https://music.163.com/discover").end((err,_response)=>{
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		$(".n-rcmd").eq(0).find('li').each(function(i,e){
			data.hotSong.push({
				title:$(e).children('.dec').find('a').text(),
				namehref:"https://music.163.com"+$(e).children('.dec').find('a').attr('href'),
				id:$(e).children('.dec').find('a').attr('data-res-id'),
				imgSrc:$(e).children('.u-cover').children('img').attr('src'),
				time:$(e).find('.nb').text(),
				radio:$(e).find('.u-icn').length>0?true:false
			})
		})
		
		$("#personalRec").find('li').each(function(i,e){
			if(i!=0){
				data.styleSong.push({
					title:$(e).children('.dec').children('a').text(),
					namehref:"https://music.163.com"+$(e).children('.dec').children('a').attr('href'),
					id:$(e).children('.dec').children('a').attr('data-res-id'),
					imgSrc:$(e).children('.u-cover').children('img').attr('src'),
					time:$(e).find('.nb').text(),
					title1:$(e).children('.idv').children('em').text()
				})
			}
		})
		
		$(".n-new").eq(0).find('.roller-flag').each(function(i,e){
			data.newSong.push([]);
			$(e).find('li').each(function(index,obj){
				data.newSong[i].push({
					name:$(obj).children('.f-thide').eq(0).children('a').text(),
					albumHref:"https://music.163.com"+$(obj).children('.f-thide').eq(0).children('a').attr('href'),
					author:$(obj).children('.tit').children('a').text(),
					authorHref:"https://music.163.com"+$(obj).children('.tit').children('a').attr('href'),
					img:$(obj).find('.j-img').attr('data-src')
				})
			})
		})
		
		$(".n-bilst").eq(0).find('.blk').each(function(i,e){
			data.songList.push([]);
			data.songList[i].push({
				img:$(e).find('.j-img').attr('data-src'),
				name:$(e).find('.msk').attr('title'),
				href:"https://music.163.com"+$(e).find('.msk').attr('href')
			})
			
			$(e).find('li').each(function(index,obj){
				data.songList[i].push({
					order:index+1,
					name:$(obj).find('.nm').text(),
					href:"https://music.163.com"+$(obj).find('.nm').attr('href'),
				})
			})
		})
		
		res.send(data);
	})
})

//排行榜分类
.get('/rankingCata',function(req,res){
	
	var resObj = {
		special:[],
		allWorld:[]
	}
	
	request.get(`https://music.163.com/discover/toplist`).end(function(err,_response){
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		$("#toplist").find('.g-sd3').find('ul').eq(0).find('li').each(function(index,obj){
			resObj.special.push({
				name:$(obj).find('a').eq(1).text(),
				href:"https://music.163.com"+$(obj).find('a').eq(1).attr('href'),
				imgSrc:$(obj).find('img').attr('src'),
				status:$(obj).find('p').eq(1).text(),
				id:$(obj).attr('data-res-id')
			})
		})
		
		$("#toplist").find('.g-sd3').find('ul').eq(1).find('li').each(function(index,obj){
			resObj.allWorld.push({
				name:$(obj).find('a').eq(1).text(),
				href:"https://music.163.com"+$(obj).find('a').eq(1).attr('href'),
				imgSrc:$(obj).find('img').attr('src'),
				status:$(obj).find('p').eq(1).text(),
				id:$(obj).attr('data-res-id')
			})
		})
		
		res.send(resObj);
	})
})

//排行榜歌曲
.get('/rankingCate/:id',function(req,res){
	
	var id = req.params.id;
	var resObj = {
		data:[],
	}
	
	request.get(`https://music.163.com/discover/toplist?id=${id}`).end((err,_response)=>{
		var dom = _response.text;
		
		var $ = cheerio.load(dom);
		
		resObj.data = $("#song-list-pre-data").text();
		
		resObj.name = $(".g-wrap").find('h2.f-ff2').text();
		
		resObj.status = $(".g-wrap").find('.sep.s-fc3').text();
		
		resObj.status1 = $(".g-wrap").find('.user').find('.s-fc4').text();
		
		resObj.fav = $("#toplist-fav").find('i').text();
		
		resObj.share = $("#toplist-share").find('i').text();
		
		resObj.comment = "("+$("#comment-count").text()+")";
		
		resObj.playCount = $("#play-count").text();
		
		resObj.imgSrc = $(".g-wrap").find('img').attr('src');
		
		resObj.songCount = $(".g-wrap12").find('.u-title').find('.sub.s-fc3').find('span').text();
		
		res.send(resObj);
	})
})

//获取歌单 和 页数
.get('/playlist/:status/:cate/:limit/:offset', function(req, res){

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
})

//歌单分类
.get('/playlist/cate',function(req,res){
	
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
})

//电台分类
.get('/radioCate',function(req,res){
	
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
})

//电台数据（包括分页）
.get('/radioData/:id/:pageSize',function(req,res){
	
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
/*
url : 服务器端处理图片上传的地址
container : 渲染上传图片的容器
countWrap : 显示上传数量
file : 文件域
scale : 压缩比例
name :请求服务器端时传递的参数名
success : 上传成功之后执行的回调函数
error : 上传失败之后执行的回调函数
warning : 上传发生错误之后执行的回调函数
*/

function UpLoadImg(opt){
	var defaluts = {
		url : "upload.php",
		container : "",
		countWrap : "",
		file : "",
		max : 8,
		scale : 0.8,
		name : "img",
		success : function(imgsrc,index){
			console.log(imgsrc)
			$("#list"+index).removeClass(".upload-loading").find("img").attr("src",imgsrc);
		},
		error : function(msg){
			$.dialog({
	   	   	  msg:msg,
	   	   	  btn:["","取消"],
	   	   	  callback1:function(){
	   	   	  	 console.log($(this).text())
	             $parent.remove();
	   	   	  }
	   	   })			
		},
		warning : function(msg){
			// alert("请输入正确的图片");
			$.dialog({
       	   	  msg:msg,
       	   	  btn:["","取消"],
       	   	  callback1:function(){
       	   	  	 console.log($(this).text())
                 $parent.remove();
       	   	  }
       	   })
		}
	}

	this.opt = $.extend({},defaluts,opt);

	this.init();
}

UpLoadImg.prototype = {
	liIndex : 0,
	init : function(){
		var _this = this;
		//显示上传数目
		this.showImgCount();
		$("#"+this.opt.file).change(function(){
		 	var files = this.files ? this.files :null,
		 		_tag = files[0],
		 		max = 2*1024*1024,
		 		reg = /(jpeg)|(jpg)|(gif)|(png)/,
		 		err="",
		 		$ol = $("#"+_this.opt.container);
		

		 	//判断图片的大小是否小于2M
		 	if(_tag.size>max){
		 		err ="请上传不超过2M的图片";

		 	}else if(!reg.test(_tag.name)){                //判断图片的格式
		 		err = "请上传正确的图片格式JPEG/png/gif";
		 		
		 	}

		 	//如果有错误
		 	if(err){
		 		_this.opt.warning(err);
		 		return;
		 	}
		 	_this.liIndex+=1;

		 	var html = '<li class="upload-img upload-loading" id="list'+_this.liIndex+'">'
		 					+'<img src="" />'
		 					+'<a href="javascropt:void(0)" class="close"></a>'
		 				+'</li>'
		 	
		 	$(html).prependTo($ol);
		 	_this.showImgCount();
		 	//压缩图片

		 	_this.zipImg({
		 		files :files, 
		 		scale : _this.opt.scale,
		 		callback : function(tar){
		 			//如果tar不是数组，将它转化为数组
		 			if(tar.constructor!='Array'){
		 				tar = [tar],
		 				_this.submit(tar,_this.liIndex);
		 			}
		 		}
		 	})
		})

		//删除操作
		$("#upload-container").on("click","a.close",function(){
			$(this).parent().remove();
			_this.liIndex-=1;
			_this.showImgCount();
		})
	},
	 //压缩图片方法
   zipImg: function(cfg){
	    /*
	     * cfg.files      input对象触发onchange时候的files
	     * cfg.scale      压缩比例
	     * cfg.callback     压缩成功后的回调
	     */
	     var _this = this;
	     var options = cfg;

	    [].forEach.call(options.files, function(v, k){
	      var fr = new FileReader();  
	      fr.onload= function(e) {  
	        var oExif = EXIF.readFromBinaryFile(new BinaryFile(e.target.result)) || {};
	        var $img = document.createElement('img');                         
	        $img.onload = function(){                 
	          _this.fixDirect().fix($img, oExif, options.callback,options.scale);
	        };  
	        // if(typeof(window.URL) != 'undefined'){
	        //  $img.src = window.URL.createObjectURL(v);
	        // }else{
	        //  $img.src = e.target.result;       
	        // }
	        $img.src = window.URL.createObjectURL(v);
	      };  
	      //fr.readAsDataURL(v);
	      fr.readAsBinaryString(v);
	    }); 
	   },
	   //调整图片方向
	   fixDirect: function(){
	    var r = {};
	    r.fix = function(img, a, callback,scale) {
	      var n = img.naturalHeight,
	        i = img.naturalWidth,
	        c = 1024,
	        o = document.createElement("canvas"),
	        s = o.getContext("2d");
	      a = a || {};
	      //o.width = o.height = c;
	      //debugger;
	      if(n > c || i > c){
	        o.width = o.height = c;
	      }else{
	        o.width = i;
	        o.height = n;
	      }
	      a.Orientation = a.Orientation || 1;
	      r.detectSubSampling(img) && (i /= 2, n /= 2);
	      var d, h;
	      i > n ? (d = c, h = Math.ceil(n / i * c)) : (h = c, d = Math.ceil(i / n * c));
	      // var g = c / 2,
	      var g = Math.max(o.width,o.height)/2,
	        l = document.createElement("canvas");
	      if(n > c || i > c){
	        l.width = g, l.height = g;
	      }else{
	        l.width = i;
	        l.height = n;
	        d = i;
	        h =n;
	      }
	      //l.width = g, l.height = g;
	      var m = l.getContext("2d"), u = r.detect(img, n) || 1;
	      s.save();
	      r.transformCoordinate(o, d, h, a.Orientation);
	      var isUC = navigator.userAgent.match(/UCBrowser[\/]?([\d.]+)/i);
	      if (isUC && $.os.android){
	        s.drawImage(img, 0, 0, d, h);
	      }else{
	        for (var f = g * d / i, w = g * h / n / u, I = 0, b = 0; n > I; ) {
	          for (var x = 0, C = 0; i > x; )
	            m.clearRect(0, 0, g, g), m.drawImage(img, -x, -I), s.drawImage(l, 0, 0, g, g, C, b, f, w), x += g, C += f;
	          I += g, b += w
	        }
	      }
	      s.restore();
	      a.Orientation = 1;
	      img = document.createElement("img");
	      img.onload = function(){
	        a.PixelXDimension = img.width;
	        a.PixelYDimension = img.height;
	        //e(img, a);
	      };
	      
	      callback && callback(o.toDataURL("image/jpeg", scale).substring(22));//压缩图片
	    };
	    r.detect = function(img, a) {
	      var e = document.createElement("canvas");
	      e.width = 1;
	      e.height = a;
	      var r = e.getContext("2d");
	      r.drawImage(img, 0, 0);
	      for(var n = r.getImageData(0, 0, 1, a).data, i = 0, c = a, o = a; o > i; ) {
	        var s = n[4 * (o - 1) + 3];
	        0 === s ? c = o : i = o, o = c + i >> 1
	      }
	      var d = o / a;
	      return 0 === d ? 1 : d
	    };
	    r.detectSubSampling = function(img) {
	      var a = img.naturalWidth, e = img.naturalHeight;
	      if (a * e > 1048576) {
	        var r = document.createElement("canvas");
	        r.width = r.height = 1;
	        var n = r.getContext("2d");
	        return n.drawImage(img, -a + 1, 0), 0 === n.getImageData(0, 0, 1, 1).data[3]
	      }
	      return !1;
	    };
	    r.transformCoordinate = function(img, a, e, r) {
	      switch (r) {
	        case 5:
	        case 6:
	        case 7:
	        case 8:
	          img.width = e, img.height = a;
	          break;
	        default:
	          img.width = a, img.height = e
	      }
	      var n = img.getContext("2d");
	      switch (r) {
	        case 2:
	          n.translate(a, 0), n.scale(-1, 1);
	          break;
	        case 3:
	          n.translate(a, e), n.rotate(Math.PI);
	          break;
	        case 4:
	          n.translate(0, e), n.scale(1, -1);
	          break;
	        case 5:
	          n.rotate(.5 * Math.PI), n.scale(1, -1);
	          break;
	        case 6:
	          n.rotate(.5 * Math.PI), n.translate(0, -e);
	          break;
	        case 7:
	          n.rotate(.5 * Math.PI), n.translate(a, -e), n.scale(-1, 1);
	          break;
	        case 8:
	          n.rotate(-.5 * Math.PI), n.translate(-a, 0)
	      }
	    };
	    return r;
	   },
		showImgCount : function(){
			var $span = $("#"+this.opt.countWrap).find("span"),
				count = $(".upload-img").length,   //上传的数量
				num = this.opt.max - count,
				$upload = $(".upload-action");        //还可以上传的数量
				
			$span.eq(0).text(num);
			$span.eq(1).text(count);
			if(num == 0){
				$upload.hide();
			}else{
				$upload.show();
			}
		},
		submit : function(files,index){
			var files=files[0],
				url = this.opt.url,
				param = {},
				_this = this;
				 param[this.opt.name]=files; 
				// console.log(param);
				
			$.ajax({
				url : url,
				type : "post",
				data : param,
				dataType : "json",
				success : function(result){
					console.log(result);
					_this.opt.success(result.url,index);
				},
				error : function(){
					 _this.opt.error("上传失败，请重新上传!");
				}
			})
			
		}
	}
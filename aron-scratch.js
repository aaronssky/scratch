/**
 * author aron_阿伦
 * QQ:398155437
 * [Scratch description]
 * @param  {[type]} id [description]
 * @return {[type]}        [description]
 */
function Scratch(id) {
	this.canvas = document.getElementById(id);
	this.ctx = this.canvas.getContext("2d");
	this.originData = {};
	this.originPixData = [];
	this.imgUrl = "";
	this.surfaceColor = [0, 0, 0];
	this.radius = 10;
	this.percentage = 0.5;
	this.autoClear = true;
	this.offAreaRatio = 0;
	this.FuncComplete = function() {};
	this.FuncScratching = function() {};
	this.isCompleted = false;
	this.borderWidth = {
		top: 0,
		left: 0
	};
	this.offsetCoord = {
		top: 0,
		left: 0
	};
	this.paddingWidth = {
		top: 0,
		left: 0
	};
	this.shape = "circle";
}

Scratch.prototype = {
	init: function(config) {
		!!config?"":config={};
		this.initData(config);
		"texts" in config ? this.drawText(config.texts) : "imgUrl" in config ? this.drawImg() : this.drawText();
		this.bindEvent();
	},
	initData: function(config) {
		"imgUrl" in config ? this.imgUrl = config.imgUrl : "";
		if ("surfaceColor" in config) {
			var color = config.surfaceColor;
			var definedColor = [];
			var flag = true;
			if (color.length == 3 || color.length == 6) {
				var arr = color.length == 3 ? color.split("") : [color[0] + color[1], color[2] + color[3], color[4] + color[5]];
				arr.forEach(function(val, index) {
					if (!parseInt(val, 16) && parseInt(val, 16) != 0) {
						flag = false;
						return false;
					}
					definedColor[index] = parseInt(color.length == 3 ? val + val : val, 16);
				});
				flag ? this.surfaceColor = definedColor : "";
			}
		}
		"radius" in config ? this.radius = config.radius : "";
		"autoClear" in config ? this.autoClear = config.autoClear : "";
		"percentage" in config ? this.percentage = config.percentage : "";
		"FuncComplete" in config ? this.FuncComplete = config.FuncComplete : "";
		"FuncScratching" in config ? this.FuncScratching = config.FuncScratching : "";
		"shape" in config ? this.shape = config.shape : "";
		var b_left = this.canvas.style.borderLeftWidth;
		var b_top = this.canvas.style.borderTopWidth;
		this.borderWidth.left = !!b_left ? ~~b_left.split("px")[0] : 0;
		this.borderWidth.top = !!b_top ? ~~b_top.split("px")[0] : 0;
		this.offsetCoord.top = getTop(this.canvas);
		this.offsetCoord.left = getLeft(this.canvas);
		var p_left = this.canvas.style.paddingLeft;
		var p_top = this.canvas.style.paddingTop;
		this.paddingWidth.top = !!b_top ? ~~p_top.split("px")[0] : 0;
		this.paddingWidth.left = !!b_left ? ~~p_left.split("px")[0] : 0;

	},
	drawImg: function() {
		var that = this;
		var img = new Image();
		img.src = this.imgUrl;
		if (img.complete) {
			this.ctx.drawImage(img, 0, 0);
			this.drawSurface();
		} else {
			img.onload = function() {
				that.ctx.drawImage(img, 0, 0);
				that.drawSurface();
			};
			img.onerror = function() {
				window.alert('Image loading failure, please try again!');
			};
		};

	},
	drawText: function(texts) {
		var def_fillStyle = "black";
		var def_font = "bold 30px Arial";
		var def_fillText = "Aron原创";
		var x = 0,
			y = 0;
		!!texts?"":texts = [{}];
		this.ctx.textBaseline = "top";
		for (var i = 0; i < texts.length; i++) {
			x = "offsetX" in texts[i] ? texts[i].offsetX : 0;
			y = "offsetY" in texts[i] ? texts[i].offsetY : 0;
			this.ctx.fillStyle = "fillStyle" in texts[i] ? texts[i].fillStyle : def_fillStyle;
			this.ctx.font = "font" in texts[i] ? texts[i].font : def_font;
			this.ctx.fillText("fillText" in texts[i] ? texts[i].fillText : def_fillText, x, y);
		}
		this.drawSurface();
	},
	drawSurface: function() {
		var originData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var originPixData = [];
		for (var j = 0; j < originData.data.length; j++) {
			originPixData[j] = originData.data[j];
		}
		for (var i = 0; i < this.canvas.width * this.canvas.height; i++) {
			originData.data[i * 4] = this.surfaceColor[0];
			originData.data[i * 4 + 1] = this.surfaceColor[1];
			originData.data[i * 4 + 2] = this.surfaceColor[2];
			originData.data[i * 4 + 3] = 255;
		}
		this.ctx.putImageData(originData, 0, 0);
		this.originPixData = originPixData;
		this.originData = originData;
	},
	bindEvent: function() {
		var that = this;
		addEventHandler(this.canvas, "mousemove", function(e) {
			var x = e.clientX - that.borderWidth.left - that.offsetCoord.left - that.paddingWidth.left + window.scrollX;
			var y = e.clientY - that.borderWidth.top - that.offsetCoord.top - that.paddingWidth.top + window.scrollY;
			that.shape == "circle" ? that.setCircleMode(x, y, that.radius) : that.setSquareMode(x, y, that.radius);
			that.ctx.putImageData(that.originData, 0, 0);
			that.setOffAreaRatio();
			that.offAreaRatio < 1 ? that.FuncScratching() : "";
		});
		addEventHandler(this.canvas, "mouseout", function(e) {
			that.checkFinish(0.5, function() {
				that.isCompleted ? "" : that.FuncComplete();
			});
		});
	},
	setSquareMode: function(x, y, radius) {
		for (var i = x - radius; i <= x + radius; i++)
			for (var j = y - radius; j <= y + radius; j++) {
				this.setOriginPixData(i, j);
			}
	},
	setCircleMode: function(x, y, radius) {
		for (var i = x - radius; i <= x + radius; i++)
			for (var j = y - radius; j <= y + radius; j++) {
				if (Math.sqrt(Math.pow(x - i, 2) + Math.pow(y - j, 2)) <= radius) {
					this.setOriginPixData(i, j);
				}
			}
	},
	setOriginPixData: function(x, y) {
		var curPix = (y * this.canvas.width + x) * 4;
		if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
			return false;
		}
		this.originData.data[curPix] = this.originPixData[curPix];
		this.originData.data[curPix + 1] = this.originPixData[curPix + 1];
		this.originData.data[curPix + 2] = this.originPixData[curPix + 2];
		this.originData.data[curPix + 3] = this.originPixData[curPix + 3];
	},
	setOffAreaRatio: function() {
		var count = 0;
		var size = this.canvas.width * this.canvas.height;
		for (var i = 0; i < size; i++) {
			if (this.originData.data[i * 4] != this.surfaceColor[0] || this.originData.data[i * 4 + 1] != this.surfaceColor[1] || this.originData.data[i * 4 + 2] != this.surfaceColor[2] || this.originData.data[i * 4 + 3] != 255) {
				count++;
			}
		}
		this.offAreaRatio = count / size;
	},
	checkFinish: function(percentage, callback) {
		if (this.offAreaRatio > this.percentage) {
			if (this.autoClear) {
				this.clearSurface();
				callback();
				this.isCompleted = true;
			} else if (this.offAreaRatio == 1) {
				callback();
				this.isCompleted = true;
			}
		}
	},
	clearSurface: function() {
		var size = this.canvas.width * this.canvas.height;
		for (var i = 0; i < size; i++) {
			this.originData.data[i * 4] = this.originPixData[i * 4];
			this.originData.data[i * 4 + 1] = this.originPixData[i * 4 + 1];
			this.originData.data[i * 4 + 2] = this.originPixData[i * 4 + 2];
			this.originData.data[i * 4 + 3] = this.originPixData[i * 4 + 3];
		}
		this.ctx.putImageData(this.originData, 0, 0);
	}
}

function addEventHandler(target, type, func) {
	if (target.addEventListener) {
		target.addEventListener(type, func, false);
	} else if (target.attachEvent) {
		target.attachEvent("on" + type, func);
	} else {
		target["on" + type] = func;
	}
}

function getTop(e) {
	var offset = e.offsetTop;
	if (e.offsetParent != null) offset += getTop(e.offsetParent);
	return offset;
}

function getLeft(e) {
	var offset = e.offsetLeft;
	if (e.offsetParent != null) offset += getLeft(e.offsetParent);
	return offset;
}
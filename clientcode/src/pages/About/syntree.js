// By Miles Shang <mail@mshang.ca>
// MIT license

var debug = true;
var margin = 15; // Number of pixels from tree to edge on each side.
var padding_above_text = 6; // Lines will end this many pixels above text.
var padding_below_text = 6;

function Node() {
  this.value = null;
  this.step = null; // Horizontal distance between children.
  this.draw_triangle = null;
  this.label = null; // Head of movement.
  this.tail = null; // Tail of movement.
  this.max_y = null; // Distance of the descendent of this node that is farthest from root.
  this.children = new Array();
  this.has_children;
  this.first = null;
  this.last = null;
  this.parent = null;
  this.next = null;
  this.previous = null;
  this.x = null; // Where the node will eventually be drawn.
  this.y = null;
  this.head_chain = null;
  this.tail_chain = null;
  this.starred = null;
}

Node.prototype.set_siblings = function(parent) {
  for (var i = 0; i < this.children.length; i++)
    this.children[i].set_siblings(this);

  this.has_children = (this.children.length > 0);
  this.parent = parent;

  if (this.has_children) {
    this.first = this.children[0];
    this.last = this.children[this.children.length - 1];
  }

  for (var i = 0; i < this.children.length - 1; i++)
    this.children[i].next = this.children[i+1];

  for (var i = 1; i < this.children.length; i++)
    this.children[i].previous = this.children[i-1];
}

Node.prototype.check_triangle = function() {
  this.draw_triangle = 0;
  if ((!this.has_children) && (this.parent.starred))
    this.draw_triangle = 1;

  for (var child = this.first; child != null; child = child.next)
    child.check_triangle();
}

Node.prototype.set_width = function(ctx, vert_space, hor_space, term_font, nonterm_font) {
  ctx.font = term_font;
  if (this.has_children)
    ctx.font = nonterm_font;

  var val_width = ctx.measureText(this.value).width;

  for (var child = this.first; child != null; child = child.next)
    child.set_width(ctx, vert_space, hor_space, term_font, nonterm_font);

  if (!this.has_children) {
    this.left_width = val_width / 2;
    this.right_width = val_width / 2;
    return;
  }

  // Figure out how wide apart the children should be placed.
  // The spacing between them should be equal.
  this.step = 0;
  for (var child = this.first; (child != null) && (child.next != null); child = child.next) {
    var space = child.right_width + hor_space + child.next.left_width;
    this.step = Math.max(this.step, space);
  }

  this.left_width = 0.0;
  this.right_width = 0.0;

  if (this.has_children) {
    var sub = ((this.children.length - 1) / 2) * this.step;
    this.left_width = sub + this.first.left_width;
    this.right_width = sub + this.last.right_width;
  }

  this.left_width = Math.max(this.left_width, val_width / 2);
  this.right_width = Math.max(this.right_width, val_width / 2);

}

Node.prototype.find_height = function() {
  this.max_y = this.y;
  for (var child = this.first; child != null; child = child.next)
    this.max_y = Math.max(this.max_y, child.find_height());

  console.log("max y", this.max_y);
  return this.max_y;
}

Node.prototype.assign_location = function(x, y, vert_space, font_size, term_lines) {
  // floor + 0.5 for antialiasing

  console.log("vert_space", vert_space);

  this.x = Math.floor(x) + 0.5;
  this.y = Math.floor(y) + 0.5;

  if (this.has_children) {
    var left_start = x - (this.step)*((this.children.length-1)/2);
    for (var i = 0; i < this.children.length; i++)
      this.children[i].assign_location(left_start + i*(this.step), y + vert_space, vert_space, font_size, term_lines);
  } else {
    if ((this.parent) && (!term_lines) && (this.parent.children.length == 1) && (!this.draw_triangle))
      this.y = this.parent.y + padding_above_text + padding_below_text + font_size;
  }
}

Node.prototype.draw = function(ctx, font_size, term_font, nonterm_font, color, term_lines) {
  ctx.font = term_font;
  if (this.has_children)
    ctx.font = nonterm_font;

  ctx.fillStyle = "black";
  if (color) {
    ctx.fillStyle = "green";
    if (this.has_children)
      ctx.fillStyle = "blue";
  }

  ctx.fillText(this.value, this.x, this.y);
  for (var child = this.first; child != null; child = child.next)
    child.draw(ctx, font_size, term_font, nonterm_font, color, term_lines);

  if (!this.parent) return;

  if (this.draw_triangle) {
    ctx.moveTo(this.parent.x, this.parent.y + padding_below_text);
    ctx.lineTo(this.x - this.left_width, this.y - font_size - padding_above_text);
    ctx.lineTo(this.x + this.right_width, this.y - font_size - padding_above_text);
    ctx.lineTo(this.parent.x, this.parent.y + padding_below_text);
    ctx.stroke();
    return;
  }

  if ((!this.has_children) && (!term_lines) && (this.parent.children.length == 1)) return;

  ctx.moveTo(this.parent.x, this.parent.y + padding_below_text);
  ctx.lineTo(this.x, this.y - font_size - padding_above_text);
  ctx.stroke();

  console.log("ctx", ctx);
}

Node.prototype.find_head = function(label) {
  for (var child = this.first; child != null; child = child.next) {
    var res = child.find_head(label);
    if (res != null) return res;
  }

  if (this.label == label) return this;
  return null;
}

Node.prototype.find_movement = function(mlarr, root) {
  for (var child = this.first; child != null; child = child.next)
    child.find_movement(mlarr, root);

  if (this.tail != null) {
    var m = new MovementLine;
    m.tail = this;
    m.head = root.find_head(this.tail);
    mlarr.push(m);
  }
}

Node.prototype.reset_chains = function() {
  this.head_chain = null;
  this.tail_chain = null;

  for (var child = this.first; child != null; child = child.next)
    child.reset_chains();
}

Node.prototype.find_intervening_height = function(leftwards) {
  var max_y = this.y;

  var n = this;
  while (true) {
    if (leftwards) {n = n.previous;} else {n = n.next;}
    if (!n) break;
    if ((n.head_chain) || (n.tail_chain)) return max_y;
    max_y = Math.max(max_y, n.max_y);
  }

  max_y = Math.max(max_y,
    this.parent.find_intervening_height(leftwards));
  return max_y;
}

function MovementLine() {
  this.head = null;
  this.tail = null;
  this.lca = null;
  this.dest_x = null;
  this.dest_y = null;
  this.bottom_y = null;
  this.max_y = null;
  this.should_draw = null;
  this.leftwards = null;
}

MovementLine.prototype.set_up = function() {
  this.should_draw = 0;
  if ((this.tail == null) || (this.head == null)) return;

  // Check to see if head is parent of tail,
  if (!this.check_head()) return;

  // Find the last common ancestor.
  this.find_lca();
  if (this.lca == null) return;

  // Find out the greatest intervening height.
  this.find_intervening_height();

  this.dest_x = this.head.x;
  this.dest_y = this.head.max_y;
  this.bottom_y = this.max_y + vert_space;
  this.should_draw = 1;
  return;
}

MovementLine.prototype.check_head = function() {
  var n = this.tail;
  n.tail_chain = 1;
  while (n.parent != null) {
    n = n.parent;
    if (n == this.head) return 0;
    n.tail_chain = 1;
  }
  return 1;
}

MovementLine.prototype.find_lca = function() {
  var n = this.head;
  n.head_chain = 1;
  this.lca = null;
  while (n.parent != null) {
    n = n.parent;
    n.head_chain = 1;
    if (n.tail_chain) {
      this.lca = n;
      break;
    }
  }
}

MovementLine.prototype.find_intervening_height = function() {
  for (var child = this.lca.first; child != null; child = child.next) {
    if ((child.head_chain) || (child.tail_chain)) {
      this.leftwards = false;
      if (child.head_chain) this.leftwards = true;
      break;
    }
  }

  this.max_y = Math.max(this.tail.find_intervening_height( this.leftwards),
    this.head.find_intervening_height(!this.leftwards),
    this.head.max_y);
}

MovementLine.prototype.draw = function(ctx) {
  var tail_x = this.tail.x + 3;
  this.dest_x -= 3;
  if (this.leftwards) {
    tail_x -= 6;
    this.dest_x += 6;
  }

  ctx.moveTo(tail_x, this.tail.y + padding_below_text);
  ctx.quadraticCurveTo(tail_x, this.bottom_y, (tail_x + this.dest_x) / 2, this.bottom_y);
  ctx.quadraticCurveTo(this.dest_x, this.bottom_y, this.dest_x, this.dest_y + padding_below_text);
  ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.lineTo(this.dest_x + 3, this.dest_y + padding_below_text + 10);
  ctx.lineTo(this.dest_x - 3, this.dest_y + padding_below_text + 10);
  ctx.lineTo(this.dest_x, this.dest_y + padding_below_text);
  ctx.closePath();
  ctx.fillStyle = "#000000";
  ctx.fill();
}

var scaleCanvas = function(oCanvas, iWidth, iHeight) {
  if (iWidth && iHeight) {
    var oSaveCanvas = document.createElement("canvas");
    oSaveCanvas.width = iWidth;
    oSaveCanvas.height = iHeight;
    oSaveCanvas.style.width = iWidth+"px";
    oSaveCanvas.style.height = iHeight+"px";

    var oSaveCtx = oSaveCanvas.getContext("2d");

    oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
    return oSaveCanvas;
  }
  return oCanvas;
}

export function go(str, font_size, term_font, nonterm_font, vert_space, hor_space, color, term_lines) {
  // Clean up the string
  str = str.replace(/^\s+/, "");
  var open = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] == "[") open++;
    if (str[i] == "]") open--;
  }
  while (open < 0) {
    str = "[" + str;
    open++;
  }
  while (open > 0) {
    str = str + "]";
    open--;
  }

  var root = parse(str);
  console.log("root", root);
  root.set_siblings(null);
  root.check_triangle();

  var canvas;
  var ctx;

  try {
    // Make a new canvas. Required for IE compatability.
    canvas = document.createElement("canvas");
    ctx = canvas.getContext('2d');
  } catch (err) {
    throw "canvas";
  }

  // Find out dimensions of the tree.
  root.set_width(ctx, vert_space, hor_space, term_font, nonterm_font);
  root.assign_location(0, 0, vert_space, font_size, term_lines);
  root.find_height();

  var movement_lines = new Array();
  root.find_movement(movement_lines, root);
  for (var i = 0; i < movement_lines.length; i++) {
    root.reset_chains();
    movement_lines[i].set_up();
  }

  console.log("starting convas");

  // Set up the canvas.
  var width = root.left_width + root.right_width + 2 * margin;
  var height = root.max_y + font_size + 2 * margin;
  // Problem: movement lines may protrude from bottom.
  for (var i = 0; i < movement_lines.length; i++) {
    if (movement_lines[i].max_y == root.max_y) {
      height += vert_space;
      break;
    }
  }

  console.log("width", width);
  console.log("height", height);

  // height = 200;
  // width =400;

  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.textAlign = "center";
  var x_shift = Math.floor(root.left_width + margin);
  var y_shift = Math.floor(font_size + margin);
  ctx.translate(x_shift, y_shift);

  root.draw(ctx, font_size, term_font, nonterm_font, color, term_lines);
  for (var i = 0; i < movement_lines.length; i++)
    if (movement_lines[i].should_draw) movement_lines[i].draw(ctx);

  // Swap out the image
  // console.log("canvas data", canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height));
  var iWidth = parseInt(canvas.width);
  var iHeight = parseInt(canvas.height);
  var oScaledCanvas = scaleCanvas(canvas, iWidth, iHeight);
  var strData = oScaledCanvas.toDataURL("image/png");
  return strData;
  // console.log(strData);
  // return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  // return Canvas2Image.saveAsPNG(canvas, true);
}

function subscriptify(in_str) {
  var out_str = "";
  for (var i = 0; i < in_str.length; ++i) {
    switch (in_str[i]) {
      case "0": out_str = out_str + "₀"; break;
      case "1": out_str = out_str + "₁"; break;
      case "2": out_str = out_str + "₂"; break;
      case "3": out_str = out_str + "₃"; break;
      case "4": out_str = out_str + "₄"; break;
      case "5": out_str = out_str + "₅"; break;
      case "6": out_str = out_str + "₆"; break;
      case "7": out_str = out_str + "₇"; break;
      case "8": out_str = out_str + "₈"; break;
      case "9": out_str = out_str + "₉"; break;
    }
  }
  return out_str;
}

function parse(str) {
  var n = new Node();

  if (str[0] != "[") { // Text node
    // Get any movement information.
    // Make sure to collapse any spaces around <X> to one space, even if there is no space.
    str = str.replace(/\s*<(\w+)>\s*/,
      function(match, tail) {
        n.tail = tail;
        return " ";
      });
    str = str.replace(/^\s+/, "");
    str = str.replace(/\s+$/, "");
    n.value = str;
    return n;
  }

  var i = 1;
  while ((str[i] != " ") && (str[i] != "[") && (str[i] != "]")) i++;
  n.value = str.substr(1, i-1)
  n.value = n.value.replace(/\^/,
    function () {
      n.starred = true;
      return "";
    });
  n.value = n.value.replace(/_(\w+)$/,
    function(match, label) {
      n.label = label;
      if (n.label.search(/^\d+$/) != -1)
        return subscriptify(n.label);
      return "";
    });

  while (str[i] == " ") i++;
  if (str[i] != "]") {
    var level = 1;
    var start = i;
    for (; i < str.length; i++) {
      var temp = level;
      if (str[i] == "[") level++;
      if (str[i] == "]") level--;
      if (((temp == 1) && (level == 2)) || ((temp == 1) && (level == 0))) {
        if (str.substring(start, i).search(/[^\s]/) > -1)
          n.children.push(parse(str.substring(start, i)));
        start = i;
      }
      if ((temp == 2) && (level == 1)) {
        n.children.push(parse(str.substring(start, i+1)));
        start = i+1;
      }
    }
  }
  return n;
}

var Canvas2Image = (function() {

  // check if we have canvas support
  var bHasCanvas = false;
  var oCanvas = document.createElement("canvas");
  if (oCanvas.getContext("2d")) {
    bHasCanvas = true;
  }

  // no canvas, bail out.
  if (!bHasCanvas) {
    return {
      saveAsBMP : function(){},
      saveAsPNG : function(){},
      saveAsJPEG : function(){}
    }
  }

  var bHasImageData = !!(oCanvas.getContext("2d").getImageData);
  var bHasDataURL = !!(oCanvas.toDataURL);
  var bHasBase64 = !!(window.btoa);

  var strDownloadMime = "image/octet-stream";

  // ok, we're good
  var readCanvasData = function(oCanvas) {
    var iWidth = parseInt(oCanvas.width);
    var iHeight = parseInt(oCanvas.height);
    return oCanvas.getContext("2d").getImageData(0,0,iWidth,iHeight);
  }

  // base64 encodes either a string or an array of charcodes
  var encodeData = function(data) {
    var strData = "";
    if (typeof data == "string") {
      strData = data;
    } else {
      var aData = data;
      for (var i=0;i<aData.length;i++) {
        strData += String.fromCharCode(aData[i]);
      }
    }
    return btoa(strData);
  }

  // creates a base64 encoded string containing BMP data
  // takes an imagedata object as argument
  var createBMP = function(oData) {
    var aHeader = [];

    var iWidth = oData.width;
    var iHeight = oData.height;

    aHeader.push(0x42); // magic 1
    aHeader.push(0x4D);

    var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256);

    aHeader.push(0); // reserved
    aHeader.push(0);
    aHeader.push(0); // reserved
    aHeader.push(0);

    aHeader.push(54); // dataoffset
    aHeader.push(0);
    aHeader.push(0);
    aHeader.push(0);

    var aInfoHeader = [];
    aInfoHeader.push(40); // info header size
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iImageWidth = iWidth;
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256);

    var iImageHeight = iHeight;
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256);

    aInfoHeader.push(1); // num of planes
    aInfoHeader.push(0);

    aInfoHeader.push(24); // num of bits per pixel
    aInfoHeader.push(0);

    aInfoHeader.push(0); // compression = none
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iDataSize = iWidth*iHeight*3;
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256);

    for (var i=0;i<16;i++) {
      aInfoHeader.push(0);	// these bytes not used
    }

    var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

    var aImgData = oData.data;

    var strPixelData = "";
    var y = iHeight;
    do {
      var iOffsetY = iWidth*(y-1)*4;
      var strPixelRow = "";
      for (var x=0;x<iWidth;x++) {
        var iOffsetX = 4*x;

        strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
        strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
        strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
      }
      for (var c=0;c<iPadding;c++) {
        strPixelRow += String.fromCharCode(0);
      }
      strPixelData += strPixelRow;
    } while (--y);

    var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

    return strEncoded;
  }


  // sends the generated file to the client
  var saveFile = function(strData) {
    console.log("strdata", strData);
    document.location.href = strData;
  }

  var makeDataURI = function(strData, strMime) {
    console.log("string data", strData);
    return "data:" + strMime + ";base64," + strData;
  }

  // generates a <img> object containing the imagedata
  var makeImageObject = function(strSource) {
    var oImgElement = document.createElement("img");
    // console.log("string source", strSource);
    oImgElement.src = strSource;
    return oImgElement;
  }

  var scaleCanvas = function(oCanvas, iWidth, iHeight) {
    if (iWidth && iHeight) {
      var oSaveCanvas = document.createElement("canvas");
      oSaveCanvas.width = iWidth;
      oSaveCanvas.height = iHeight;
      oSaveCanvas.style.width = iWidth+"px";
      oSaveCanvas.style.height = iHeight+"px";

      var oSaveCtx = oSaveCanvas.getContext("2d");

      oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
      return oSaveCanvas;
    }
    return oCanvas;
  }

  return {

    saveAsPNG : function(oCanvas, bReturnImg, iWidth, iHeight) {
      if (!bHasDataURL) {
        return false;
      }
      var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
      var strData = oScaledCanvas.toDataURL("image/png");
      console.log(strData);
      if (bReturnImg) {
        return makeImageObject(strData);
      } else {
        saveFile(strData.replace("image/png", strDownloadMime));
      }
      return true;
    },

    saveAsJPEG : function(oCanvas, bReturnImg, iWidth, iHeight) {
      if (!bHasDataURL) {
        return false;
      }

      var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
      var strMime = "image/jpeg";
      var strData = oScaledCanvas.toDataURL(strMime);

      // check if browser actually supports jpeg by looking for the mime type in the data uri.
      // if not, return false
      if (strData.indexOf(strMime) != 5) {
        return false;
      }

      if (bReturnImg) {
        return makeImageObject(strData);
      } else {
        saveFile(strData.replace(strMime, strDownloadMime));
      }
      return true;
    },

    saveAsBMP : function(oCanvas, bReturnImg, iWidth, iHeight) {
      if (!(bHasImageData && bHasBase64)) {
        return false;
      }

      var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);

      var oData = readCanvasData(oScaledCanvas);
      var strImgData = createBMP(oData);
      if (bReturnImg) {
        return makeImageObject(makeDataURI(strImgData, "image/bmp"));
      } else {
        saveFile(makeDataURI(strImgData, strDownloadMime));
      }
      return true;
    }
  };

})();

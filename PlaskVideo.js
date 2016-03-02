var fs = require('fs');
var plask = require('plask');

var vert = fs.readFileSync(__dirname + '/PlaskVideo.vert', 'utf8');
var frag = fs.readFileSync(__dirname + '/PlaskVideo.frag', 'utf8');

function PlaskVideo(ctx, file) {
    this.ctx = ctx;

    this.planeVAO = this.createPlaneVAO();

    this.player = new plask.AVPlayer(ctx.getGL());
    if (file) {
        this.player.appendFile(file);
    }
    //this.player.setRate(1); //play

    this.videoTexture = ctx.createTexture2D(null, 1280, 1280);

    this.fbo = ctx.createFramebuffer([ { texture: this.videoTexture } ]);

    this.program = ctx.createProgram(vert, frag);
}

PlaskVideo.prototype.getTexture = function() {
    return this.videoTexture;
}

PlaskVideo.prototype.update = function() {
    if (this.player.rate() === 0) this.player.setRate(1);

    var tex = this.player.currentFrameTexture();
    var ctx = this.ctx;
    var gl = ctx.getGL();

    gl.enable(gl.TEXTURE_RECTANGLE);
    ctx.pushState(ctx.FRAMEBUFFER_BIT | ctx.PROGRAM_BUT | ctx.TEXTURE_BIT | ctx.VERTEX_ARRAY_BIT | ctx.VIEWPORT_BIT);
    ctx.bindFramebuffer(this.fbo);
    ctx.setViewport(0, 0, this.videoTexture.getWidth(), this.videoTexture.getHeight())
    ctx.setClearColor(1,0,0,1);
    ctx.clear(ctx.COLOR_BIT);
    ctx.bindProgram(this.program);
    if (tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_RECTANGLE, tex.texture);
        gl.texParameteri(gl.TEXTURE_RECTANGLE, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_RECTANGLE, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_RECTANGLE, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_RECTANGLE, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.program.setUniform('uTextureSize', [tex.s1, tex.t1])
    }
    this.program.setUniform('uTexture', 0);

    ctx.bindVertexArray(this.planeVAO);
    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    ctx.popState();
}

PlaskVideo.prototype.createPlaneVAO = function() {
    var ctx = this.ctx;

    var pos = new Float32Array([
        -1, -1, 0, 1, -1, 0, 1,  1, 0,
        -1, -1, 0, 1,  1, 0,-1,  1, 0
    ]);
    var uv = new Float32Array([
       0, 1, 1, 1, 1, 0,
       0, 1, 1, 0, 0, 0
    ]);

    var posBuf = ctx.createBuffer(ctx.ARRAY_BUFFER, pos);
    var uvBuf = ctx.createBuffer(ctx.ARRAY_BUFFER, uv);

    var attributesDesc = [
        { location: ctx.ATTRIB_POSITION, buffer: posBuf, size: 3 },
        { location: ctx.ATTRIB_TEX_COORD_0, buffer: uvBuf, size: 2 },
    ];

    return ctx.createVertexArray(attributesDesc, null);
}

module.exports = PlaskVideo;

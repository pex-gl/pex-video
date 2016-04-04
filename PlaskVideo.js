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

    this.videoTexture = ctx.createTexture2D(null, 1, 1);

    this.fbo = ctx.createFramebuffer([ { texture: this.videoTexture } ]);

    this.program = ctx.createProgram(vert, frag);

    this.autoplay = true;
    this.autoplayStarted = false;

    var loops = false;
    var src = '';

    Object.defineProperty(this, 'src', {
        get: function() { return src; },
        set: function(file) {
            src = file;
            this.player.removeAll();
            this.player.appendFile(file);
        }
    });

    Object.defineProperty(this, 'duration', {
        get: function() { return this.player.currentDuration(); }
    });

    Object.defineProperty(this, 'currentTime', {
        get: function() { return this.player.currentTime(); },
        set: function(time) { this.player.seekToTime(time); }
    });

    Object.defineProperty(this, 'loop', {
        get: function() { return loops; },
        set: function(state) { loops = state; this.player.setLoops(state); }
    });

    Object.defineProperty(this, 'paused', {
        get: function() { return this.player.rate() == 0; },
    });

    Object.defineProperty(this, 'volume', {
        get: function() { return this.player.volume(); },
        set: function(time) { this.player.setVolume(time); }
    });
}

PlaskVideo.prototype.play = function() {
    this.player.setRate(1);
}

PlaskVideo.prototype.pause = function() {
    this.player.setRate(0);
}

PlaskVideo.prototype.getTexture = function() {
    return this.videoTexture;
}

PlaskVideo.prototype.update = function() {
    var tex = this.player.currentFrameTexture();

    if (this.player.rate() === 0 && this.player.currentDuration() > 0 && this.autoplay && !this.autoplayStarted) {
        this.autoplayStarted = true;
        this.player.setRate(1);
    }

    var ctx = this.ctx;
    var gl = ctx.getGL();

    if (tex && (tex.s1 != this.videoTexture.getWidth() || tex.t1 != this.videoTexture.getHeight())) {
        //resize video texture to match the video size
        this.videoTexture.update(null, tex.s1, tex.t1)
    }

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
        gl.disable(gl.TEXTURE_RECTANGLE);
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

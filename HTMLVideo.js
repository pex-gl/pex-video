function HTMLVideo(ctx, url) {
    this.ctx = ctx;

    var videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.volume = 0;
    videoElement.src = url || '';

    this.videoElement = videoElement;

    this.videoTexture = ctx.createTexture2D(null, 1, 1);

    Object.defineProperty(this, 'src', {
        get: function() {
            return this.videoElement.src;
        },
        set: function(value) {
            this.videoElement.src = value;
        }
    });

    Object.defineProperty(this, 'duration', {
        get: function() { return this.videoElement.duration; }
    });

    Object.defineProperty(this, 'currentTime', {
        get: function() { return this.videoElement.currentTime; },
        set: function(time) { this.videoElement.currentTime = time; }
    });

    Object.defineProperty(this, 'loop', {
        get: function() { return this.videoElement.loop; },
        set: function(state) { this.videoElement.loop = state; }
    });
}

HTMLVideo.prototype.update = function() {
    if (this.videoElement.currentTime > 0) {
        this.videoTexture.update(this.videoElement, this.videoElement.videoWidth, this.videoElement.videoHeight);
    }
}

HTMLVideo.prototype.getTexture = function() {
    return this.videoTexture;
}

module.exports = HTMLVideo;

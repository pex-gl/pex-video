function HTMLVideo(ctx, url) {
    this.ctx = ctx;

    var videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.volume = 0;
    videoElement.src = url || '';

    this.videoElement = videoElement;

    //TODO: handle different video size
    this.videoTexture = ctx.createTexture2D(null, 1280, 1280);

    Object.defineProperty(this, 'src', {
        get: function() {
            return this.videoElement.src;
        },
        set: function(value) {
            this.videoElement.src = value;
        }
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
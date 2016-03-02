uniform sampler2DRect uTexture;
uniform vec2 uTextureSize;

varying vec2 vTexCoord0;

void main() {
    gl_FragColor.rgb = texture2DRect(uTexture, vTexCoord0 * uTextureSize).xyz;
    gl_FragColor.a = 1.0;
}

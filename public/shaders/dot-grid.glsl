#version 300 es

precision highp float;

uniform float time;
uniform float deltaTime;
uniform vec2 mouse;
uniform float width;
uniform float height;

out vec4 fragColor;

void main(void) {
    vec2 size = vec2(width, height);
    vec2 uv = (gl_FragCoord.xy / size);

    float cellSize = 10.f;
    float circleSize = .1f;
    vec2 p = gl_FragCoord.xy / cellSize;
    vec2 gv = fract(p);

    vec2 cellCenter = floor(p) + .5f;
    float mouseDist = length(cellCenter / size * cellSize - 1.f + mouse);

    float circle = length(gv - .5f) - mouseDist + .1f;
    circle = smoothstep(0.1f, .0f, circle);

    vec3 color = mix(vec3(1.f), vec3(0.f), circle);
    fragColor = vec4(color, 1.0f);
}
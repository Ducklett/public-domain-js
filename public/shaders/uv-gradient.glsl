#version 300 es

precision highp float;

uniform float time;
uniform float deltaTime;
uniform vec2 mouse;
uniform float width;
uniform float height;

out vec4 fragColor;

void main(void) {
    vec2 uv = (gl_FragCoord.xy / vec2(width, height));

    vec2 p = uv * 2.f - 1.f;
    p.x *= width / height;
    vec2 m = mouse * 2.f - 1.f;
    m.x *= width / height;

    float distanceFromCenter = length(m);
    float circle = min(1.f, length(p + m)) - .2f;
    circle = smoothstep(0.01f + distanceFromCenter, 0.00f, circle);

    vec3 color = vec3(uv, sin(time) * .5f + .5f);
    color = color * .3f + color * circle * (.8f + .4f * (sin(time) * .5f + .5f));
    color = clamp(vec3(0.f), vec3(1.f), color);
    fragColor = vec4(pow(color, vec3(2.2f)), 1.0f);
}

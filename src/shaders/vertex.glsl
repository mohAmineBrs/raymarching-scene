uniform float uTime;

varying vec2 vUv;

float PI = 3.15159265;

void main() {

	vUv = uv;

	vec4 mvPosition = modelViewMatrix * vec4(position, 1.);

	gl_Position = projectionMatrix * mvPosition;
}
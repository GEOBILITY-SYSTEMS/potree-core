// Set precision for floats and ints
precision highp float;
precision highp int;

// Uniforms for camera, projection and point parameters
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 projectionMatrix;
uniform float opacity;
uniform bool useOrthographicCamera;
uniform float blendHardness;
uniform float blendDepthSupplement;
uniform float fov;
uniform float spacing;
uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;
uniform float far;
uniform sampler2D depthMap;
uniform vec3 ambientLightColor;
uniform int numDirectionalLights;
uniform int numPointLights;
uniform vec3 directionalLightDirections[MAX_DIR_LIGHTS];
uniform vec3 directionalLightColors[MAX_DIR_LIGHTS];
uniform vec3 pointLightPositions[MAX_POINT_LIGHTS];
uniform vec3 pointLightColors[MAX_POINT_LIGHTS];
uniform float pointLightRanges[MAX_POINT_LIGHTS];

out vec4 fragColor;

#ifdef highlight_point
	// Color used to highlight a point
	uniform vec4 highlightedPointColor;
#endif

in vec3 vColor;

#if !defined(color_type_point_index)
	// Opacity attribute when not using point index color type
	in float vOpacity;
#endif

#if defined(weighted_splats)
	// Linear depth value for weighted splats
	in float vLinearDepth;
#endif



in vec3 vViewPosition;
#if defined(weighted_splats) || defined(paraboloid_point_shape)
	// Radius for point shapes
	in float vRadius;
#endif

#if defined(color_type_phong)
	// Normal for Phong shading
	in vec3 vNormal;
#endif

#ifdef highlight_point
	// Highlight flag for the point
	in float vHighlight;
#endif

const float specularStrength = 1.0;

void main() {
	vec3 color = vColor;

	// Precompute normalized point coordinate if needed
	#if defined(circle_point_shape) || defined(paraboloid_point_shape) || defined(weighted_splats)
		vec2 pc = 2.0 * gl_PointCoord - 1.0;
	#endif

	// Discard fragments outside circle for certain shapes
	#if defined(circle_point_shape) || defined(weighted_splats)
		if(dot(pc, pc) > 1.0) discard;
	#endif

	// Depth comparison for weighted splats
	#if defined(weighted_splats)
		vec2 uv = gl_FragCoord.xy / vec2(screenWidth, screenHeight);
		if(vLinearDepth > texture(depthMap, uv).r + vRadius + blendDepthSupplement) discard;
	#endif

	// Initialize fragment color and opacity
	#if defined(weighted_splats)
		float wx = 2.0 * length(pc);
		float w = exp(-wx * wx * 0.5);
		fragColor = vec4(color * w, w);
	#elif defined(color_type_point_index)
		fragColor = vec4(color, pcIndex / 255.0);
	#else
		fragColor = vec4(color, vOpacity);
	#endif

	// Lighting calculations for Phong shading
	#if defined(color_type_phong)
		float normalLength = length(vNormal);
		vec3 normal = normalLength > 0.0 ? vNormal / normalLength : vec3(0.0, 0.0, 1.0);
		normal.z = abs(normal.z);
		vec3 viewDir = normalize(-vViewPosition);
		vec3 diffuseTerm = ambientLightColor;
		vec3 specularTerm = vec3(0.0);
		const float shininess = 32.0;
		const float pointSpecularScale = 0.2;
		const float directionalSpecularScale = 0.2;

		for (int i = 0; i < MAX_DIR_LIGHTS; i++)
		{
			if (i >= numDirectionalLights)
			{
				break;
			}

			vec3 lightDir = normalize(directionalLightDirections[i]);
			float diffuseWeight = max(dot(normal, lightDir), 0.0);
			diffuseTerm += directionalLightColors[i] * diffuseWeight;

			vec3 halfVec = normalize(lightDir + viewDir);
			float specularWeight = specularStrength * pow(max(dot(normal, halfVec), 0.0), shininess);
			specularTerm += directionalLightColors[i] * (directionalSpecularScale * specularWeight);
		}

		for (int i = 0; i < MAX_POINT_LIGHTS; i++)
		{
			if (i >= numPointLights)
			{
				break;
			}

			vec3 lightVector = pointLightPositions[i] - vViewPosition;
			float lightDistance = length(lightVector);
			if (lightDistance <= 0.0)
			{
				continue;
			}

			vec3 lightDir = lightVector / lightDistance;
			float attenuation = 1.0;
			float range = pointLightRanges[i];
			if (range > 0.0)
			{
				attenuation = max(1.0 - lightDistance / range, 0.0);
			}

			float diffuseWeight = max(dot(normal, lightDir), 0.0);
			diffuseTerm += pointLightColors[i] * (diffuseWeight * attenuation);

			vec3 halfVec = normalize(lightDir + viewDir);
			float specularWeight = specularStrength * pow(max(dot(normal, halfVec), 0.0), shininess);
			specularTerm += pointLightColors[i] * (pointSpecularScale * specularWeight * attenuation);
		}

		fragColor.rgb = fragColor.rgb * diffuseTerm + specularTerm;
	#endif

	// Compute depth from view position
	vec4 pos = vec4(vViewPosition, 1.0);
	#if defined(paraboloid_point_shape)
		if(!useOrthographicCamera){
			// Adjust depth based on point shape
			pos.z += -dot(pc, pc) * vRadius;
		}
	#endif

	float linearDepth = -pos.z;
	vec4 clipPos = projectionMatrix * pos;
	clipPos /= clipPos.w;

	// When using an orthographic camera, paraboloid correction is not applied,
	// so use the GPU-compluted default depth (gl_FragCoord.z).
	if(useOrthographicCamera){
		// Orthographic camera: use the GPU-computed default depth.
		// When using an orthographic camera, Three.js does not use `logarithmicDepthBuffer` either.
		gl_FragDepth = gl_FragCoord.z;
	}else{
		#if defined(use_log_depth)
			// Logarithmic depth
			gl_FragDepth = log2(linearDepth + 1.0) * log(2.0) / log(far + 1.0);
		#else
			// Use the GPU-computed default depth.
			gl_FragDepth = gl_FragCoord.z;
		#endif
	}

	#if defined(color_type_depth)
		// Stable near->far coloring (near=purple, far=yellow)
		float depth01 = clamp(linearDepth / max(far, 1e-6), 0.0, 1.0);
		vec3 nearDepthColor = vec3(0.36, 0.18, 0.64);
		vec3 farDepthColor = vec3(1.0, 0.92, 0.23);
		fragColor.rgb = mix(nearDepthColor, farDepthColor, depth01);
	#endif

	#if defined(use_edl)
		// For EDL, store log2(linearDepth) in alpha.
		// This is recomputed here (rather than in VS) so it matches per-fragment depth
		// adjustments such as paraboloid point shape.
		fragColor.a = log2(max(linearDepth, 1e-6));
	#endif

	#if defined(highlight_point)
		// Override color for highlighted points
		if(vHighlight > 0.0) {
			fragColor = highlightedPointColor;
		}
	#endif
}

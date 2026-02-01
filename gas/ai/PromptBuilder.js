/**
 * PromptBuilder.js
 * Build AI prompts from parameters
 * 
 * Creates positive and negative prompts for AI image generation
 * based on user's clothing and background preferences.
 */

/**
 * Base prompt template
 */
const BASE_PROMPT_TEMPLATE = `professional ID photo, half-body portrait, {clothing_type} {clothing_color}, {background_color} solid background, studio lighting, natural skin tone, sharp focus on face, photorealistic, high quality, corporate headshot style, exact same face, preserve facial features, identical face structure, maintain body proportions, realistic body size, natural physique, professional studio lighting, soft shadows, even illumination`;

/**
 * Negative prompt (fixed)
 */
const NEGATIVE_PROMPT = `cartoon, illustration, painting, drawing, art, sketch, anime, 3d render, distorted face, deformed, ugly, blurry, duplicate, multiple people, watermark, text, cropped, low quality, jpeg artifacts, mutation, extra limbs, missing limbs, floating limbs, disconnected limbs, malformed hands, long neck, cross-eyed, mutated, bad anatomy, bad proportions, cloned face, disfigured, gross proportions, malformed, pattern background, patterned clothing, logo, stripes, texture, gradient background, objects in background`;

/**
 * Build positive prompt from parameters
 * @param {Object} params - Prompt parameters
 * @param {string} params.clothing_type - Clothing type (e.g., 'formal shirt', 't-shirt')
 * @param {string} params.clothing_color - Clothing color (e.g., 'white', 'black')
 * @param {string} params.background_color - Background color (e.g., 'blue', 'red')
 * @returns {string} Complete prompt
 */
function buildPrompt(params) {
  let prompt = BASE_PROMPT_TEMPLATE;
  
  // Replace placeholders
  prompt = prompt.replace('{clothing_type}', params.clothing_type || DEFAULT_PARAMS.clothing_type);
  prompt = prompt.replace('{clothing_color}', params.clothing_color || DEFAULT_PARAMS.clothing_color);
  prompt = prompt.replace('{background_color}', params.background_color || DEFAULT_PARAMS.background_color);
  
  logInfo('Built prompt', { params, promptLength: prompt.length });
  return prompt;
}

/**
 * Get negative prompt
 * @returns {string} Negative prompt
 */
function getNegativePrompt() {
  return NEGATIVE_PROMPT;
}

/**
 * Build full prompt configuration for AI
 * @param {Object} params - Prompt parameters
 * @returns {Object} Full prompt config {prompt, negative_prompt}
 */
function buildPromptConfig(params) {
  return {
    prompt: buildPrompt(params),
    negative_prompt: getNegativePrompt(),
  };
}

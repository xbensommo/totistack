/**
 * Media Feature Entry Point
 * @module features/media
 * @description Main entry point for media management feature
 * @author Totistack Team
 * @date 2026-03-22
 */

import mediaService from './services/mediaService';
import uploadService from './services/uploadService';
import imageService from './services/imageService';
import mediaStore from './stores/mediaStore';
import MediaUploader from './components/MediaUploader.vue';
import MediaGallery from './components/MediaGallery.vue';
import MediaPicker from './components/MediaPicker.vue';
import ImageCropper from './components/ImageCropper.vue';

/**
 * Initialize the media feature
 * @param {Object} context - Application context
 * @param {Object} config - Feature configuration
 * @returns {Promise<Object>} Initialized feature API
 */
export async function initialize(context, config = {}) {
  try {
    console.info('[Media Feature] Initializing...');
    
    // Validate dependencies
    if (!context.features || !context.features.auth) {
      throw new Error('Media feature requires auth feature to be initialized first');
    }
    
    // Register store module
    if (context.store && !context.store.hasModule('media')) {
      context.store.registerModule('media', mediaStore);
    }
    
    // Initialize services
    await mediaService.initialize(config, context.features.auth);
    await uploadService.initialize(config);
    await imageService.initialize(config);
    
    // Register global components if Vue app is available
    if (context.app) {
      context.app.component('MediaUploader', MediaUploader);
      context.app.component('MediaGallery', MediaGallery);
      context.app.component('MediaPicker', MediaPicker);
      context.app.component('ImageCropper', ImageCropper);
      console.debug('[Media Feature] Components registered');
    }
    
    console.info('[Media Feature] Initialized successfully');
    
    return {
      mediaService,
      uploadService,
      imageService,
      MediaUploader,
      MediaGallery,
      MediaPicker,
      ImageCropper
    };
    
  } catch (error) {
    console.error('[Media Feature] Initialization failed:', error);
    throw new Error(`Failed to initialize media feature: ${error.message}`);
  }
}

export { mediaService, uploadService, imageService };
export default { initialize };

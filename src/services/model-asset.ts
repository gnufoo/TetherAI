/**
 * Copies the bundled GGUF model from Android APK assets to the filesystem
 * using a native Java module (AssetCopier) that calls AssetManager.open().
 *
 * expo-file-system cannot read from android_asset:// URIs, so we need
 * native code to extract large files from the APK.
 */
import { NativeModules, Platform } from 'react-native';

const MODEL_FILENAME = 'Llama-3.2-1B-Instruct-Q4_0.gguf';

export async function getLocalModelPath(
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (Platform.OS !== 'android') {
    throw new Error('Model bundling only supported on Android');
  }

  const { AssetCopier } = NativeModules;
  if (!AssetCopier) {
    throw new Error(
      'AssetCopier native module not found. Ensure AssetCopierPackage is registered in MainApplication.',
    );
  }

  // Destination: app's internal files directory
  // React Native's document directory is /data/user/0/<pkg>/files/
  const destDir = `${
    require('react-native').NativeModules.ExponentFileSystem?.documentDirectory ||
    '/data/user/0/com.transsion.transcend/files/'
  }models/`;
  const destPath = `${destDir}${MODEL_FILENAME}`;

  onProgress?.(0.05);
  console.log(`[model-asset] Copying model via native AssetCopier to ${destPath}`);

  try {
    const result: string = await AssetCopier.copyAsset(MODEL_FILENAME, destPath);
    console.log(`[model-asset] Native copy complete: ${result}`);
    onProgress?.(1);
    return result;
  } catch (e: any) {
    console.error(`[model-asset] Native AssetCopier failed: ${e?.message || e}`);
    throw new Error(`Failed to extract model from APK: ${e?.message || e}`);
  }
}

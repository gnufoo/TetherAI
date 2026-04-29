/**
 * Monkey-patch react-native-keychain to force software-backed crypto.
 *
 * On certain Android devices/OS versions, the hardware-backed Android Keystore
 * produces IllegalBlockSizeException when decrypting data it just encrypted.
 * This is a known react-native-keychain issue.
 *
 * By patching setGenericPassword and getGenericPassword to always use
 * SECURITY_LEVEL.ANY (software AES), we bypass the broken hardware crypto.
 *
 * Call this ONCE at app startup, before any keychain operations.
 */
import * as Keychain from 'react-native-keychain';

let patched = false;

export function patchKeychainSecurity() {
  if (patched) return;
  patched = true;

  const originalSet = Keychain.setGenericPassword;
  const originalGet = Keychain.getGenericPassword;

  // @ts-ignore - monkey-patching
  Keychain.setGenericPassword = (
    username: string,
    password: string,
    options?: Parameters<typeof originalSet>[2],
  ) => {
    const patchedOptions = {
      ...options,
      // Force no-auth AES instead of biometric/hardware-gated Keystore paths.
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    };
    delete (patchedOptions as any).accessControl;
    console.log(`[keychain-patch] setGenericPassword (service: ${patchedOptions.service || 'default'}, security: ANY)`);
    return originalSet(username, password, patchedOptions);
  };

  // @ts-ignore - monkey-patching
  Keychain.getGenericPassword = (options?: Parameters<typeof originalGet>[0]) => {
    const patchedOptions = {
      ...options,
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    };
    delete (patchedOptions as any).accessControl;
    console.log(`[keychain-patch] getGenericPassword (service: ${patchedOptions.service || 'default'}, security: ANY, storage: AES_GCM_NO_AUTH)`);
    return originalGet(patchedOptions);
  };

  console.log('[keychain-patch] Patched keychain to use SECURITY_LEVEL.ANY');
}

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
    options?: Keychain.Options,
  ) => {
    const patchedOptions = {
      ...options,
      // Force software-backed AES instead of hardware Keystore
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
      // Use Facebook Conceal as storage backend (avoids Keystore entirely)
      storage: Keychain.STORAGE_TYPE.AES,
    };
    console.log(`[keychain-patch] setGenericPassword (service: ${patchedOptions.service || 'default'}, security: ANY)`);
    return originalSet(username, password, patchedOptions);
  };

  // @ts-ignore - monkey-patching
  Keychain.getGenericPassword = (options?: Keychain.Options) => {
    const patchedOptions = {
      ...options,
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
    };
    return originalGet(patchedOptions);
  };

  console.log('[keychain-patch] Patched keychain to use SECURITY_LEVEL.ANY');
}

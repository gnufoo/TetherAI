#!/usr/bin/env bash
set -euo pipefail

# WDK beta stores seed with BIOMETRY_ANY by default. On some Android devices this
# hits react-native-keychain / Android Keystore IllegalBlockSizeException during
# decrypt, even after reset. Force software AES/no accessControl so local debug
# and sideload release builds can create wallets reliably.
TARGET="node_modules/@tetherto/wdk-react-native-provider/lib/module/services/wdk-service/wdk-secret-manager-storage.js"

if [ ! -f "$TARGET" ]; then
  echo "[patch-wdk-keychain] skip: $TARGET not found"
  exit 0
fi

python3 - <<'PY'
from pathlib import Path
p = Path('node_modules/@tetherto/wdk-react-native-provider/lib/module/services/wdk-service/wdk-secret-manager-storage.js')
s = p.read_text()
old_set = """    await Keychain.setGenericPassword(key, b4a.isBuffer(value) ? b4a.toString(value, 'hex') : value, {\n      service: itemService,\n      accessControl: key === 'seed' ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY : undefined\n    });"""
new_set = """    await Keychain.setGenericPassword(key, b4a.isBuffer(value) ? b4a.toString(value, 'hex') : value, {\n      service: itemService,\n      securityLevel: Keychain.SECURITY_LEVEL.ANY,\n      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH\n    });"""
old_get = """      const credentials = await Keychain.getGenericPassword({\n        service: itemService,\n        accessControl: key === 'seed' ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY : undefined\n      });"""
new_get = """      const credentials = await Keychain.getGenericPassword({\n        service: itemService,\n        securityLevel: Keychain.SECURITY_LEVEL.ANY,\n        storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH\n      });"""
changed = False
if old_set in s:
    s = s.replace(old_set, new_set)
    changed = True
if old_get in s:
    s = s.replace(old_get, new_get)
    changed = True
if 'storage: Keychain.STORAGE_TYPE.AES' in s:
    s = s.replace('storage: Keychain.STORAGE_TYPE.AES', 'storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH')
    changed = True
if changed:
    p.write_text(s)
    print('[patch-wdk-keychain] patched WDK keychain storage')
elif 'securityLevel: Keychain.SECURITY_LEVEL.ANY' in s and 'storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH' in s:
    print('[patch-wdk-keychain] already patched')
else:
    raise SystemExit('[patch-wdk-keychain] expected WDK keychain patterns not found')
PY

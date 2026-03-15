import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xinbridge.app',
  appName: 'XinBridge 心桥',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

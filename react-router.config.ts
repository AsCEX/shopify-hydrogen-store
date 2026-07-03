import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';
import {vercelPreset} from '@vercel/react-router/vite';

const isVercelBuild = Boolean(process.env.VERCEL);

/**
 * Use Hydrogen's preset for local dev/Oxygen and Vercel's preset on Vercel.
 */
export default {
  ssr: true,
  presets: [isVercelBuild ? vercelPreset() : hydrogenPreset()],
} satisfies Config;

// Fix "UNABLE_TO_VERIFY_LEAF_SIGNATURE" when running behind a corporate proxy or a
// network layer that re-signs TLS certificates (e.g. Cursor's internal network).
// Safe to apply unconditionally here: next.config.js only runs during dev/build on the
// developer's machine, never inside the deployed production runtime.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support dynamic features and API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  // Optimize chunk loading
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // Enable support for audio worklets and WebAssembly
  webpack: (config, { isServer, dev }) => {
    // Support for WebAssembly (needed for Essentia.js)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Exclude browser-only libraries from server-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Optimize chunk splitting in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }

    // Suppress warnings for known issues
    config.ignoreWarnings = [
      // Supabase realtime-js has dynamic requires which are safe to ignore
      /Critical dependency: the request of a dependency is an expression/,
      // Tone.js source map warnings
      /Failed to parse source map/,
    ];

    return config;
  },

  // Add headers for SharedArrayBuffer support (required for some audio processing)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

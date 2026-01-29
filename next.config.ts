import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Webpack config to handle client-only modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude Agora SDK from server-side bundle
      config.externals = config.externals || [];
      config.externals.push("agora-rtc-sdk-ng");
    }
    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize for different screen sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail sizes
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://api-2.agora.io https://web-1.agora.io https://web-2.agora.io https://webrtc2-ap-web-1.agora.io https://webrtc2-2-ap-web-1.agora.io https://statscollector-1.agora.io https://web-2.statscollector.sd-rtn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https://api.dicebear.com https://res.cloudinary.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.dicebear.com https://res.cloudinary.com wss: https://api-2.agora.io https://web-1.agora.io https://web-2.agora.io https://webrtc2-ap-web-1.agora.io https://webrtc2-2-ap-web-1.agora.io https://statscollector-1.agora.io https://web-2.statscollector.sd-rtn.com https://sua-ap-web-1.agora.io https://api.dicebear.com https://res.cloudinary.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },

  // Compression and optimization
  compress: true,

  // PWA support (optional)
  // You can enable this later with next-pwa configuration
};

export default nextConfig;

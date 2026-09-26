import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Serve as fotos em AVIF/WebP automaticamente (bem mais leves que PNG)
  images: { formats: ["image/avif", "image/webp"] },
  // Links curtos: bio do Instagram, cartão e QR code do balcão.
  async redirects() {
    return [
      { source: "/agendar", destination: "/#booking", permanent: false },
      {
        source: "/whatsapp",
        destination:
          "https://api.whatsapp.com/send?phone=5513974249209&text=" +
          encodeURIComponent("Olá! Gostaria de agendar um horário na Barbearia do Alemão."),
        permanent: false,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PDFKit reads its built-in AFM font metric files at runtime. Keeping it as
  // a Node.js external package makes Render retain pdfkit/js/data/*.afm
  // instead of Next bundling the JS and dropping those font files.
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
};

export default nextConfig;

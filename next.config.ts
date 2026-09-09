import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @react-pdf/renderer is CJS with native-ish deps — keep it out of the bundle.
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default nextConfig

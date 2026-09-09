import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep these out of the server bundle: @react-pdf/renderer is CJS with
  // native-ish deps; the pg driver stack must not be bundled or its socket
  // handling breaks under `next start`.
  serverExternalPackages: ['@react-pdf/renderer', '@prisma/adapter-pg', 'pg'],
}

export default nextConfig

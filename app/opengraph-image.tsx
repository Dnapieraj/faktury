import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Faktury — fakturowanie dla freelancerów i małych firm'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#fafafa',
          backgroundImage:
            'radial-gradient(circle at 78% 8%, rgba(79,70,229,0.22), rgba(79,70,229,0) 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#4F46E5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
              <path
                d="M7 4h7.5L18 7.5V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
                stroke="#FFFFFF"
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
              <path
                d="M9 9.5h5M9 13h5M9 16.5h3"
                stroke="#FFFFFF"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={{ fontSize: 32, fontWeight: 600, color: '#18181b' }}>Faktury</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 56,
            maxWidth: 880,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#18181b',
            }}
          >
            Fakturowanie, które kończy się na „opłacona”.
          </span>
          <span style={{ fontSize: 28, color: '#52525b', marginTop: 28 }}>
            Faktury · PDF · płatności Stripe · przypomnienia — dla freelancerów i małych firm
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}

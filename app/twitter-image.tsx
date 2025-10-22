import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NeX AI - Marketing Automation for African Entrepreneurs';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F24',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1a2332 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a2332 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FEE440 0%, #fff59d 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.05em',
            }}
          >
            NeX
          </div>
          <div
            style={{
              fontSize: '70px',
              fontWeight: '600',
              color: '#FEE440',
              marginLeft: '15px',
            }}
          >
            AI
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '40px',
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: '1.3',
          }}
        >
          Marketing Automation for African Entrepreneurs
        </div>

        {/* Features badges */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(254, 228, 64, 0.1)',
              border: '2px solid #FEE440',
              borderRadius: '10px',
              color: '#FEE440',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            ✨ AI Chat
          </div>
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(254, 228, 64, 0.1)',
              border: '2px solid #FEE440',
              borderRadius: '10px',
              color: '#FEE440',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            🎨 Image Gen
          </div>
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(254, 228, 64, 0.1)',
              border: '2px solid #FEE440',
              borderRadius: '10px',
              color: '#FEE440',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            🎙️ Voice AI
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

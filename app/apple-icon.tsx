import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F24',
          borderRadius: '22.5%',
        }}
      >
        <div
          style={{
            fontSize: '100px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FEE440 0%, #fff59d 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            fontFamily: 'system-ui',
            display: 'flex',
          }}
        >
          N
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

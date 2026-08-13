"use client";

const FONT_MAP: Record<string, string> = {
  playfair:  "'Playfair Display', serif",
  cormorant: "'Cormorant Garamond', serif",
  dancing:   "'Dancing Script', cursive",
  vibes:     "'Great Vibes', cursive",
  caveat:    "'Caveat', cursive",
  pacifico:  "'Pacifico', cursive",
};

interface Props {
  title: string;
  message: string;
  signature: string;
  font: string;
  sticker: string;
  rotate?: number;
  scale?: number;
}

export default function LetterPreview({ title, message, signature, font, sticker, rotate = 0, scale = 1 }: Props) {
  const fontFamily = FONT_MAP[font] || FONT_MAP.playfair;

  return (
    <div style={{
      width: 300,
      minHeight: 400,
      background: "#f5f0e6",
      borderRadius: "3px",
      padding: "32px 28px 36px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.5) inset",
      transform: `rotate(${rotate}deg) scale(${scale})`,
      transformOrigin: "center top",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "0",
      flexShrink: 0,
    }}>
      {/* Paper texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
        borderRadius: "3px",
        pointerEvents: "none",
      }}/>

      {/* Sticker */}
      {sticker && (
        <div style={{
          position: "absolute", top: 12, right: 14,
          fontSize: "28px", lineHeight: 1,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
        }}>{sticker}</div>
      )}

      {/* Ornament */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "16px",
        color: "rgba(139,32,32,0.5)",
        marginBottom: "12px",
        letterSpacing: "0.1em",
      }}>❧</div>

      {/* Title */}
      {title && (
        <h2 style={{
          fontFamily,
          fontSize: "17px",
          fontWeight: 700,
          color: "#2a1515",
          marginBottom: "16px",
          lineHeight: 1.3,
        }}>{title}</h2>
      )}

      {/* Divider */}
      <div style={{
        height: "1px",
        background: "rgba(42,21,21,0.12)",
        marginBottom: "16px",
      }}/>

      {/* Message */}
      <div style={{
        fontFamily,
        fontSize: "14px",
        color: "#2a1515",
        lineHeight: 1.75,
        flex: 1,
        whiteSpace: "pre-wrap",
        opacity: message ? 1 : 0.35,
        minHeight: "80px",
      }}>
        {message || "Your words will appear here…"}
      </div>

      {/* Signature */}
      {signature && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ height: "1px", background: "rgba(42,21,21,0.1)", marginBottom: "10px" }}/>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "18px",
            color: "#8b2020",
            opacity: 0.8,
          }}>— {signature}</p>
        </div>
      )}

      {/* Wax seal placeholder */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #c41e3a 0%, #8b2020 50%, #6b1a1a 100%)",
          boxShadow: "0 2px 8px rgba(139,32,32,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontFamily: "'Playfair Display', serif",
          color: "rgba(245,240,230,0.85)",
          fontWeight: 700,
        }}>OW</div>
      </div>
    </div>
  );
}

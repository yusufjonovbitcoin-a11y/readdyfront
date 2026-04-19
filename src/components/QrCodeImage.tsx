import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** PNG data URL — `<img>` va yuklab olish uchun */
export function useQrPngDataUrl(value: string, size = 180): { dataUrl: string | null; loading: boolean } {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!value.trim()) {
      setDataUrl(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return { dataUrl, loading };
}

type QrCodeImageProps = {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
};

/**
 * Haqiqiy QR — PNG orqali, SVG emas (ko‘rinish barqaror).
 */
export default function QrCodeImage({ value, size = 180, className = "", alt = "QR kod" }: QrCodeImageProps) {
  const { dataUrl, loading } = useQrPngDataUrl(value, size);

  if (!value.trim()) {
    return (
      <div
        className={`rounded-lg bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  if (loading || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[11px] text-gray-500 ${className}`}
        style={{ width: size, height: size }}
        role="status"
        aria-live="polite"
      >
        {loading ? "Yuklanmoqda…" : "QR yaratilmadi"}
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`block max-h-full max-w-full select-none rounded-sm ${className}`}
      draggable={false}
    />
  );
}

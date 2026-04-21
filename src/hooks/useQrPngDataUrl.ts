import { useEffect, useState } from "react";
import QRCode from "qrcode";

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

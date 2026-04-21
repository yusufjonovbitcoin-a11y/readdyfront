import { useQrPngDataUrl } from "@/hooks/useQrPngDataUrl";

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

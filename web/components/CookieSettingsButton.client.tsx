"use client";

type CookieSettingsButtonProps = {
  className?: string;
  underlined?: boolean;
};

export default function CookieSettingsButton({ className = "", underlined = true }: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("frisia:open-cookie-settings"))}
      className={`cursor-pointer text-left text-xs hover:text-[color:var(--color-brackish)] ${underlined ? "underline underline-offset-4" : "no-underline"} ${className}`}
    >
      Cookie-Einstellungen ändern
    </button>
  );
}

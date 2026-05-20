import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Cal_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const calSans = Cal_Sans({
  variable: "--font-cal-sans",
  subsets: ["latin"],
  weight: "400",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Nautilus Builder Base",
  description: "A Nautilus-branded starter for building car wash growth tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${calSans.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <Script id="ui-picker-light-mode" strategy="afterInteractive">
          {`(function () {
  var styles = "[data-panel]{background:rgba(255,255,255,0.85);box-shadow:0 0 0 1px rgba(0,0,0,0.08),inset 0 0 0 1px rgba(255,255,255,0.6),0 25px 50px -12px rgba(0,0,0,0.15)}[data-nav]{color:#525252}[data-nav]:hover,[data-nav]:focus-visible{color:#0a0a0a;background:rgba(0,0,0,0.06)}[data-divider]{background:rgba(0,0,0,0.12)}[data-center]{color:#0a0a0a}[data-center]:hover,[data-center]:focus-within{background:rgba(0,0,0,0.06)}[data-position]{color:rgba(0,0,0,0.5)}[data-select]{color:#0a0a0a}[data-select]:disabled{color:rgba(0,0,0,0.5)}[data-select] option{color:#0a0a0a;background:#ffffff}[data-chevron]{color:#737373}";
  function apply(picker) {
    if (!picker || picker.dataset.uiPickerLightMode || !picker.shadowRoot) return;
    try {
      var sheet = new CSSStyleSheet();
      sheet.replaceSync(styles);
      picker.shadowRoot.adoptedStyleSheets = [].concat(picker.shadowRoot.adoptedStyleSheets, sheet);
    } catch (e) {
      var el = document.createElement("style");
      el.textContent = styles;
      picker.shadowRoot.appendChild(el);
    }
    picker.dataset.uiPickerLightMode = "1";
  }
  function scan() { document.querySelectorAll("uidotsh-picker").forEach(apply); }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

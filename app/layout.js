import Script from 'next/script';
import Providers from './providers';
import '../styles/happpy-tokens.css';
import '../styles/fonts.css';
import './globals.css';

const GTM_CONTAINER_ID = 'GTM-P6GXD64V';
const HAPPY_HERO_WEBP_SRCSET =
    '/images/talent/outreach/hero/hero-bg-768.webp 768w, /images/talent/outreach/hero/hero-bg-1280.webp 1280w, /images/talent/outreach/hero/hero-bg.webp 1536w';

export const metadata = {
    title: 'Happpy Agent',
    description: 'An AI referral agent that finds people inside the company and introduces you.',
    icons: {
        icon: '/images/talent/outreach/happpy-agent-favicon.ico',
    },
};

/** Same as uts talent/index.blade.php — required for topnav mobile breakpoints. */
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
                />
                <link rel="preload" href="/fonts/Montserrat-Font.ttf" as="font" type="font/ttf" crossOrigin="" />
                <link rel="preload" href="/fonts/Montserrat-Italic.ttf" as="font" type="font/ttf" crossOrigin="" />
                <link rel="preload" href="/fonts/Rubik.ttf" as="font" type="font/ttf" crossOrigin="" />
                <link rel="preload" href="/fonts/Rubik-Italic.ttf" as="font" type="font/ttf" crossOrigin="" />
                <link rel="preload" href="/fonts/TelegrafUltraBold.otf" as="font" type="font/otf" crossOrigin="" />
                <link
                    rel="preload"
                    as="image"
                    type="image/webp"
                    fetchPriority="high"
                    imageSrcSet={HAPPY_HERO_WEBP_SRCSET}
                    imageSizes="100vw"
                />
            </head>
            <body>
                <Script id="gtm" strategy="afterInteractive">
                    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
                </Script>
                <Script
                    id="razorpay-checkout"
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="lazyOnload"
                />
                <Script
                    id="vimeo-player"
                    src="https://player.vimeo.com/api/player.js"
                    strategy="lazyOnload"
                />
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                        title="Google Tag Manager"
                    />
                </noscript>
                <div id="happpy-root">
                    <Providers>{children}</Providers>
                </div>
            </body>
        </html>
    );
}

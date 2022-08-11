import "../assets/app.css"
import Script from 'next/script'
import { NextSeo } from 'next-seo';

function MyApp({ Component, pageProps }) {
  return <>
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-5WREWT1MPD"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-5WREWT1MPD');
        `}
    </Script>

    <NextSeo
      title="Oproxy.ml - Realtime Best Proxy Servers"
      description="Oproxy.ml is a realtime updated proxy server list. Find the best proxy server for your needs."
      canonical="https://oproxy.ml/"
      openGraph={{
        url: 'https://oproxy.ml/',
        title: 'Oproxy.ml - Realtime Best Proxy Servers',
        description: 'Oproxy.ml is a realtime updated proxy server list. Find the best proxy server for your needs.',
        images: [
          {
            url: 'https://oproxy.ml/banner.png',
            width: 800,
            height: 600,
            alt: 'Banner Image',
            type: 'image/png',
          },
        ],
        site_name: 'Open Proxy Project',
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    />

    <Component {...pageProps} />
  </>
}

export default MyApp

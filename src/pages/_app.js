import "../assets/app.css"
import Script from 'next/script'

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
    <Component {...pageProps} />
  </>
}

export default MyApp

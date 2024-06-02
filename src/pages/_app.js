import "../assets/app.css";
import Script from "next/script";
import { NextSeo } from "next-seo";
import Progress from "../components/Progress";

function MyApp({ Component, pageProps }) {
  return (
    <>
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
        title="Open Proxy Project - Realtime Best Proxy Servers"
        description="opp.redsoc.in is a realtime updated proxy server list. Find the best proxy server for your needs."
        canonical="https://opp.redsoc.in/"
        openGraph={{
          url: "https://opp.redsoc.in/",
          title: "Open Proxy Project - Realtime Best Proxy Servers",
          description:
            "opp.redsoc.in is a realtime updated proxy server list. Find the best proxy server for your needs.",
          images: [
            {
              url: "https://opp.redsoc.in/banner.png",
              width: 800,
              height: 600,
              alt: "Banner Image",
              type: "image/png",
            },
          ],
          site_name: "Open Proxy Project",
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />

      <Progress />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

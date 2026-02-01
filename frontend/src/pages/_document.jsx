import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charset="utf-8" />
        <meta name="description" content="Leidy Cleaner - Serviços de limpeza profissional em Porto Alegre. Agende online e receba atendimento rápido e confiável." />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

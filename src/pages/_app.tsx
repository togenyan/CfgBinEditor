import '../styles.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Config Editor</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

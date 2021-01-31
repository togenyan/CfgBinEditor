import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  public render(): JSX.Element {
    return (
      <Html lang='ja'>
        <Head>
          <meta charSet='utf-8' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
          />
          <meta
            name='Config Editor'
            content='Online editor for Yo-kai Watch resource files'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

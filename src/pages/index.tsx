import Container from 'app/components/Container'
import Head from 'next/head'

export default function Dashboard() {
  return (
    <Container id="dashboard-page" className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Dashboard | Nexus</title>
        <meta name="description" content="Nexus" />
        <meta key="twitter:description" name="twitter:description" content="Nexus" />
        <meta key="og:description" property="og:description" content="Nexus" />
      </Head>
    </Container>
  )
}

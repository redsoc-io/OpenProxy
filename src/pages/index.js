import Nav from '../components/Nav';
import Servers from '../components/Servers';

export default function Index({ servers }) {
  return (
    <div>
      <Nav />
      <Servers servers={servers} />
    </div>
  );
}

export async function getServerSideProps() {
  const request = await fetch(`https://api.oproxy.ml/servers`);
  const data = await request.json();

  return {
    props: {
      servers: data,
    },
  };

}
export default function AdvertisersRedirect() { return null; }

export function getServerSideProps() {
  return { redirect: { destination: "/networks", permanent: false } };
}

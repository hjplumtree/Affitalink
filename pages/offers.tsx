export default function LegacyOffersPage() { return null; }
export function getServerSideProps() { return { redirect: { destination: "/links", permanent: true } }; }

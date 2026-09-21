export default function LegacyStudioOffersPage() { return null; }
export function getServerSideProps() { return { redirect: { destination: "/coupons", permanent: true } }; }

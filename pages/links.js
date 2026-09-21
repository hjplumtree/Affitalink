export default function LegacyReviewPage() { return null; }
export function getServerSideProps() { return { redirect: { destination: "/coupons", permanent: true } }; }

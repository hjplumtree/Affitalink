export default function Loading({ loading }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-[rgba(15,17,23,0.16)] backdrop-blur-[8px]">
      <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
    </div>
  );
}

import Footer from "./Footer";

function Layouts({ children, className, ...props }) {
  return (
    <main
      className={`ml-[56px] flex min-h-screen w-full max-w-[1520px] flex-col gap-5 bg-transparent px-4 py-4 lg:ml-[220px] lg:px-8 lg:py-6 lg:pl-10 ${className || ""}`}
      {...props}
    >
      {children}
      <Footer />
    </main>
  );
}

export default Layouts;

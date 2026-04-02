import Footer from "./Footer";

function Layouts({ children, className, ...props }) {
  return (
    <main
      className={`ml-[50px] flex min-h-screen w-full max-w-[1600px] flex-col gap-4 bg-transparent p-3 pl-4 lg:ml-[210px] lg:p-6 lg:pl-10 ${className || ""}`}
      {...props}
    >
      {children}
      <Footer />
    </main>
  );
}

export default Layouts;

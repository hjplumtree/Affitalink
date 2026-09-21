function Layouts({ children, className, ...props }) {
  return (
    <main
      className={`ml-[64px] min-h-screen min-w-0 flex-1 px-4 py-5 lg:ml-[232px] lg:px-8 lg:py-7 ${className || ""}`}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1440px]">{children}</div>
    </main>
  );
}

export default Layouts;

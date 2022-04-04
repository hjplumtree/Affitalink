import Link from "next/link";

function Layouts({ children }) {
  return (
    <div>
      <h1>Header</h1>

      {children}
      <h3>Footer</h3>
    </div>
  );
}

export default Layouts;

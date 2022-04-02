import Link from "next/link";

function Layouts({ children }) {
  return (
    <div>
      <h1>Header</h1>
      <Link href="/" passHref>
        <button>Home</button>
      </Link>
      <Link href="/networks" passHref>
        <button>Network sites</button>
      </Link>
      <Link href="/networks/add" passHref>
        <button>Add Network site</button>
      </Link>
      <Link href="/links" passHref>
        <button>Links</button>
      </Link>
      {children}
      <h3>Footer</h3>
    </div>
  );
}

export default Layouts;

import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mb-5 mt-auto flex flex-col items-center gap-2 pt-10">
      <p className="text-sm text-muted-foreground">Built for faster offer review.</p>
      <div className="flex gap-3 text-muted-foreground">
        <a className="transition-colors hover:text-foreground" href="https://github.com/hjplumtree" target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
        <a className="transition-colors hover:text-primary" href="https://twitter.com/hjplumtree" target="_blank" rel="noreferrer">
          <FaTwitter />
        </a>
        <a className="transition-colors hover:text-primary" href="https://www.linkedin.com/in/hjplumtree/" target="_blank" rel="noreferrer">
          <FaLinkedin />
        </a>
      </div>
    </footer>
  );
}

const Footer = () => {
  return (
    <footer className="flex min-h-[25px] w-full max-w-5xl justify-between bg-c5 px-2 text-c4">
      <p>&copy; Rasmus Eklund</p>
      <div className="flex items-center gap-4">
        <a
          className="hover:text-c2"
          href="https://github.com/rasmus-eklund"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;

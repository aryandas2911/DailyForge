const Footer = () => {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            DailyForge
          </h2>
          <p className="text-sm text-gray-500">
            Plan your week and stay consistent.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <a href="/" className="hover:text-black">
            Home
          </a>

          <a href="/dashboard" className="hover:text-black">
            Dashboard
          </a>

          <a
            href="https://github.com/aryandas2911/DailyForge"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black"
          >
            GitHub
          </a>
        </div>

        <p className="text-xs text-gray-400">
          © 2026 DailyForge
        </p>
      </div>
    </footer>
  );
};

export default Footer;
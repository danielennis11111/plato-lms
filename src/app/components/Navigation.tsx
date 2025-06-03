  <div className="flex items-center sm:hidden">
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-700"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      <span className="sr-only">Open main menu</span>
      {/* ... existing code ... */}
    </button>
  </div>

  {isMobileMenuOpen && (
    <div className="sm:hidden">
      <div className="space-y-1 pb-3 pt-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
              pathname === item.href
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-blue-700'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )} 
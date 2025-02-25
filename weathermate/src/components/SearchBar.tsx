import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-6 py-4 text-lg text-gray-700 dark:text-white bg-white dark:bg-gray-800 border-2 border-transparent rounded-full shadow-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300 group-focus-within:bg-blue-600 dark:group-focus-within:bg-blue-700"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Try searching for major cities like "London", "New York", or "Tokyo"
      </div>
    </form>
  );
}; 
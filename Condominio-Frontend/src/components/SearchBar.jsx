// src/components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className='w-full max-w-lg mx-auto'>
      <div
        className="flex items-center px-3.5 py-2 text-gray-400 group ring-1 ring-gray-200 hover:ring-1 hover:ring-gray-300 focus-within:!ring-2 ring-inset focus-within:!ring-teal-500 rounded-md">
        <svg className="mr-2 h-5 w-5 stroke-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
          </path>
        </svg>
        <input
          className="block w-full appearance-none bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
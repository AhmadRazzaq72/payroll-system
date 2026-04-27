import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
      {/* Branding */}
      <div className="flex items-center space-x-2 text-xl sm:text-2xl font-bold">
        <img
          src="https://res.cloudinary.com/doqzxuxb1/image/upload/v1748249798/Attendance%20And%20Payroll%20Managment/eanj5h57izb4wsvgkzhc.png"
          alt="logo"
          className="h-8 w-auto"
        />
      </div>

      {/* Search Bar - hidden on small screens */}
      <div className="hidden sm:flex w-full sm:w-1/2 md:w-1/3 items-center bg-gray-100 rounded-md px-3 py-1">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent w-full focus:outline-none text-sm"
        />
      </div>

      {/* Notification Bell - hidden on small screens */}
      <div className="hidden sm:flex relative">
        <Bell className="w-6 h-6 text-gray-600" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </div>
    </header>
  );
};

export default Header;

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

      {/* Search and Notifications removed per request */}
    </header>
  );
};

export default Header;

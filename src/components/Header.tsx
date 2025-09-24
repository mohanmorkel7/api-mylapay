import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { GlobalSearch } from '@/components/GlobalSearch';
useState


interface HeaderProps {
  apiEndpoints?: any[];
  postmanData?: any;
  onNavigate?: (result: any) => void;
}

const Header: React.FC<HeaderProps> = ({ apiEndpoints = [], postmanData, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // return (
  //   <div className="bg-white sticky top-0 shadow-sm z-30">
  //     <header className="wrapper">
  //       <nav className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8" aria-label="Global">
          
  //         {/* Logo Section */}
  //         <div className="flex items-center">
  //           <a href="/" className="flex items-center">
  //             <img 
  //               src="/assets/img/mylapaylogo.png"
  //               alt="Mylapay Logo"
  //               className="h-8 w-auto"
  //             />
  //           </a>
  //         </div>

  //         {/* Mobile Menu Button */}
  //         <div className="flex lg:hidden">
  //           <button 
  //             type="button" 
  //             className="inline-flex items-center justify-center p-2.5 text-gray-700"
  //             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  //           >
  //             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
  //               <Menu className="h-6 w-6 text-white" />
  //             </div>
  //           </button>
  //         </div>

  //            {/* Search Bar */}
  //         <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:max-w-lg lg:mx-8">
  //           {onNavigate && (
  //             <GlobalSearch
  //               apiEndpoints={apiEndpoints}
  //               postmanData={postmanData}
  //               onNavigate={onNavigate}
  //             />
  //           )}
  //         </div>
  //         {/* Desktop Navigation */}
  //         <div className="hidden lg:flex lg:items-center space-x-8">
  //           {/* <a href="/api-docs" className="text-sm font-semibold text-gray-900">
  //             API Reference
  //           </a> */}
  //           <a href="https://mylapay.com/" className="text-sm font-semibold text-gray-900">
  //             Back to Mylapay
  //           </a>
  //           <a
  //             href="https://mylapay.com/contact"
  //             target="_blank"
  //             rel="noopener noreferrer"
  //             className="text-xs font-bold uppercase bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md shadow transition-all"
  //           >
  //             Get in touch
  //           </a>
  //           <button className="text-xs font-bold uppercase bg-blue-700 hover:bg-blue-800 text-white py-2 px-3 rounded-md shadow transition-all">
  //             Logout
  //           </button>
  //         </div>
  //       </nav>
  //     </header>
  //   </div>
  // );

  return (
    <div className="bg-white sticky top-0 shadow-sm z-30">
      <header className="wrapper">
        <nav className="flex items-center justify-between px-0 md:px-4" aria-label="Global">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <a className="m-0 p-0" href="/">
              <img 
                alt="Mylapay-logo" 
                loading="lazy" 
                className="h-8 w-auto " 
                // src="../../public/assets/img/mylapaylogo.png" 
                src="../assets/img/mylapaylogo.png"  
              />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button 
              type="button" 
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary lg:hidden">
                <Menu className="h-6 w-6 text-white" />
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:max-w-lg lg:mx-8">
            {onNavigate && (
              <GlobalSearch
                apiEndpoints={apiEndpoints}
                postmanData={postmanData}
                onNavigate={onNavigate}
              />
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center">
            <a className="ml-8 mr-4 text-sm font-semibold leading-6 text-gray-900" href="https://mylapay.com/">
              Back to Mylapay
            </a>
            <div className="flex gap-x-3">
              <a 
                className="px-0 py-0" 
                target="_blank" 
                href="https://mylapay.com/contact"
                rel="noopener noreferrer"
              >
                <div className="mr-1 w-fit my-3 mx-4 lg:my-0 lg:mx-0 lg:mr-0 text-[12px] py-2 px-3 font-bold text-white rounded-md bg-blue-500 hover:bg-blue-600 relative overflow-hidden shadow-2xl transition-all uppercase">
                  <span className="relative z-10">Get in touch</span>
                </div>
              </a>
              <button className="w-fit my-3 mx-4 lg:my-0 lg:mx-0 lg:mr-0 text-[12px] py-2 px-3 font-bold text-white rounded-md bg-blue-700 hover:bg-blue-800 relative overflow-hidden shadow-2xl transition-all uppercase">
                <span className="relative z-10">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;

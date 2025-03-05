// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '../../lib/hooks/use-auth';
// import { Button } from '../../components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuLabel, 
//   DropdownMenuSeparator, 
//   DropdownMenuTrigger 
// } from '../../components/ui/dropdown-menu';
// import { Input } from '../../components/ui/input';
// import { MapPin, Search, Store, User } from 'lucide-react';

// interface HeaderProps {
//   onSearch?: (query: string) => void;
// }

// export function Header({ onSearch }: HeaderProps) {
//   const { user, signOut } = useAuth();
//   const pathname = usePathname();
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (onSearch) {
//       onSearch(searchQuery);
//     }
//   };

//   const isActive = (path: string) => {
//     return pathname === path;
//   };

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container flex h-16 items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Link href="/" className="flex items-center gap-2">
//             <Store className="h-6 w-6" />
//             <span className="hidden font-bold sm:inline-block">Local Business Listings</span>
//           </Link>
//         </div>

//         <form onSubmit={handleSearch} className="hidden md:flex md:w-1/3 lg:w-1/2">
//           <div className="relative w-full">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search businesses..."
//               className="w-full pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </form>

//         <div className="flex items-center gap-4">
//           <Link href="/explore" className="hidden sm:block">
//             <Button variant={isActive('/explore') ? 'default' : 'ghost'} size="sm">
//               <MapPin className="mr-2 h-4 w-4" />
//               Explore
//             </Button>
//           </Link>

//           {user ? (
//             <>
//               <Link href="/dashboard">
//                 <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
//                   <Store className="mr-2 h-4 w-4" />
//                   Dashboard
//                 </Button>
//               </Link>
              
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="icon" className="rounded-full">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
//                       <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuLabel>
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">{user.displayName}</p>
//                       <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem asChild>
//                     <Link href="/dashboard">Dashboard</Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/profile">Profile</Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => signOut()}>
//                     Log out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </>
//           ) : (
//             <>
//               <Link href="/signin">
//                 <Button variant="ghost" size="sm">Sign In</Button>
//               </Link>
//               <Link href="/signup">
//                 <Button size="sm">Sign Up</Button>
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
      
//       <div className="container flex md:hidden py-2">
//         <form onSubmit={handleSearch} className="w-full">
//           <div className="relative w-full">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search businesses..."
//               className="w-full pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </form>
//       </div>
//     </header>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { useTheme } from 'next-themes';

// Dynamically import Lucide icons to prevent hydration errors
const Store = dynamic(() => import('lucide-react').then((mod) => mod.Store), { ssr: false });
const MapPin = dynamic(() => import('lucide-react').then((mod) => mod.MapPin), { ssr: false });
const Sun = dynamic(() => import('lucide-react').then((mod) => mod.Sun), { ssr: false });
const Moon = dynamic(() => import('lucide-react').then((mod) => mod.Moon), { ssr: false });
const Search = dynamic(() => import('lucide-react').then((mod) => mod.Search), { ssr: false });

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure components only render after hydration
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            {mounted && <Store className="h-6 w-6" />}
            <span className="hidden font-bold sm:inline-block">Local Business Listings</span>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex md:w-1/3 lg:w-1/2">
          <div className="relative w-full">
            {mounted && <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />}
            <Input
              type="search"
              placeholder="Search businesses..."
              className="w-full pl-8 bg-white dark:bg-gray-800 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          {/* Explore Button */}
          <Link href="/explore" className="hidden sm:block">
            <Button variant={isActive('/explore') ? 'default' : 'ghost'} size="sm">
              {mounted && <MapPin className="mr-2 h-4 w-4" />}
              Explore
            </Button>
          </Link>

          {/* Dark Mode Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-900" />}
            </Button>
          )}

          {user ? (
            <>
              {/* Dashboard Button */}
              <Link href="/dashboard">
                <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                  {mounted && <Store className="mr-2 h-4 w-4" />}
                  Dashboard
                </Button>
              </Link>
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-white">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="container flex md:hidden py-2">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            {mounted && <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />}
            <Input
              type="search"
              placeholder="Search businesses..."
              className="w-full pl-8 bg-white dark:bg-gray-800 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  );
}

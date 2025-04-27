import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BellIcon,
  ShieldAlertIcon, 
  BarChartIcon, 
  FileTextIcon,
  BrainCircuitIcon,
  CoinsIcon
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const isActiveRoute = (path: string) => {
    return location === path;
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getProfileImage = () => {
    if (user?.profileImage) {
      return user.profileImage;
    }
    return undefined;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg 
                viewBox="0 0 24 24" 
                className="h-8 w-8 text-primary"
                fill="currentColor"
              >
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 19.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V10.5h2.5zM18 19.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-neutral-900">ContractPay</span>
            </div>
            {user && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main navigation">
                <Link href="/dashboard">
                  <a className={`${isActiveRoute("/dashboard") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/contracts">
                  <a className={`${isActiveRoute("/contracts") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Contracts
                  </a>
                </Link>
                <Link href="/payments">
                  <a className={`${isActiveRoute("/payments") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Payments
                  </a>
                </Link>
                <Link href="/templates">
                  <a className={`${isActiveRoute("/templates") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    Templates
                  </a>
                </Link>
                <Link href="/ai-insights">
                  <a className={`${isActiveRoute("/ai-insights") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    <BrainCircuitIcon className="h-4 w-4 mr-1" />
                    AI Insights
                  </a>
                </Link>
                <Link href="/trust-score">
                  <a className={`${isActiveRoute("/trust-score") ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    <ShieldAlertIcon className="h-4 w-4 mr-1" />
                    Trust Score
                  </a>
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="rounded-full mr-3">
                  <BellIcon className="h-5 w-5 text-neutral-500" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="ml-3 relative cursor-pointer flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getProfileImage()} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm font-medium text-neutral-700 hidden sm:block">
                        {user.fullName}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <a>
                    <Button variant="ghost">Log in</Button>
                  </a>
                </Link>
                <Link href="/register">
                  <a>
                    <Button>Sign up</Button>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

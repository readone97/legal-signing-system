"use client";
import Link from "next/link";
import { Button } from "./button";
import { AlignJustify, X } from "lucide-react";
import { useRouter } from "next/navigation";
import MobileNav from "./mobilenav";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { NavigationMenuLink, } from "./navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";
import { logout, selectCurrentUserIsAuth } from "@/slice/authSlice";
import Cookies from "js-cookie";
import { motion } from "motion/react";
import Logo from "../logo";
import { selectCurrentRole } from "@/slice/newAuthSlice";
import { resetAll } from "@/utils/resetAll";


export default function Nav({ shadow }: { shadow: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectCurrentUserIsAuth);
  const currentRole = useAppSelector(selectCurrentRole);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("role");
    dispatch(logout());
    dispatch(resetAll());
    router.push("/auth/signin");
  };
  // 
  //  const handleScroll = (id) => {
  //   scrollToSection(id);
  //   setIsOpen(false)
  //  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8 }}
        viewport={{ once: false }}
      >
        <div className={`bg-white border-b ${shadow ? "shadow-md" : ""} pt-2`}>
          <nav className="flex justify-between items-center max-w-[1700px] mx-auto lg:px-5 px-4 lg:py-3">
            {/* Logo */}
            <div className="flex items-center p-2">
              <Logo />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-10 items-center">
              <Link href="/" className="text-base font-semibold text-black hover:text-primary">
                Home
              </Link>
              {/* <button onClick={() => handleScroll('offers')} className="text-base font-semibold text-black hover:text-primary">
                Features
              </button> */}
              <Link href="/#features" className="text-base font-semibold text-black hover:text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-base font-semibold text-black hover:text-primary">
                Pricing
              </Link>
              <Link href="/contact" className="text-base font-semibold text-black hover:text-primary">
                Contact Us
              </Link>
            </div>

            {/* Authentication / Dashboard Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuth ? (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="lg:h-[50px] lg:w-[160px] rounded-xl"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="primary"
                    className="lg:h-[50px] lg:w-[160px] rounded-xl"
                    onClick={() => currentRole === "super admin" ? router.push("/dashboard/institution") : currentRole === "teacher" ? router.push("/dashboard/staff") : currentRole === "student" ? router.push("/dashboard/student") : router.push("/dashboard/parent")}
                  >
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="lg:h-[50px] lg:w-[160px] border-primary text-primary rounded-xl"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    className="lg:h-[50px] lg:w-[160px] rounded-xl"
                    onClick={() => router.push("/auth/otp")}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle Button */}
            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
                {isMobileNavOpen ? <X /> : <AlignJustify />}
              </Button>
            </div>
          </nav>
        </div>
      </motion.section>

      {/* Mobile Navigation Menu */}
      {isMobileNavOpen && <MobileNav isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} />}
    </>
  );
}


export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-0 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

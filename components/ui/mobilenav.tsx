"use client";
import Link from "next/link";
import { useRouter} from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { selectCurrentUserIsAuth } from "@/slice/authSlice";

export default function MobileNav({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) {
  const router = useRouter();
    const isAuth = useAppSelector(selectCurrentUserIsAuth);

  return (
    <div className={`fixed inset-0 max-h-[350px] bg-white shadow-md transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} z-50`}>
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h2 className="text-xl font-semibold">Menu</h2>
        <button onClick={() => setIsOpen(false)} className="text-2xl">&times;</button>
      </div>

      <nav className="flex flex-col gap-4 p-4">
        <Link href="/" className="text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link href="/features" className="text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>
          Features
        </Link>
        <Link href="/contact" className="text-gray-600 hover:text-gray-900" onClick={() => setIsOpen(false)}>
          Contact
        </Link>

        {isAuth ? (
          <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => { router.push("/auth/signin"); setIsOpen(false); }}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Login
          </button>
          <button
            onClick={() => { router.push("/dashboard/institution"); setIsOpen(false); }}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
         Dashboard
          </button>
        </div> 
        ) : (<div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => { router.push("/auth/signin"); setIsOpen(false); }}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Login
          </button>
          <button
            onClick={() => { router.push("/subscription"); setIsOpen(false); }}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Get Started
          </button>
        </div>)
        }
      

        {/* Authentication / Dashboard Buttons */}
        
      </nav>
    </div>
  );
}
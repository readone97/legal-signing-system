"use client"
import Image from "next/image";
import Link from "next/link";
import { jarkata, jarkataLight } from "@/utils/fontfamilies";



export default function Footer() {
  return (
    <div className="bg-primary text-white px-[108px] max-[1280px]:px-[60px] max-lg:px-4 w-full ">
      <div className="grid grid-cols-6 max-sm:grid-cols-1 gap-8 max-lg:grid-cols-2 max-lg:justify-center justify-between max-w-[1700px] max-sm:py-[48px] py-[45px] pt-[100px] mx-auto ">
        {/* Logo */}
        <div className="flex flex-col col-span-2  items-start gap-10">
          <Link href={"/"}>
            <Image
              src={"/images/UBEDU.svg"}
              alt={"White Logo"}
              className="bg-white rounded p-1"
              width={100}
              height={48.3}
            />
          </Link>
          <p className="max-w-[381px] text-[16px]" style={{ fontFamily: jarkataLight.style.fontFamily }}>
            Empower your school with advanced features designed to transform education.
            From student information management to financial tracking, our system has everything you need to succeed.
          </p>
          <p className="max-w-[381px]" style={{ fontFamily: jarkata.style.fontFamily }}>
            Connect with us
          </p>

          <div className="flex space-x-9">
            <Link href="#">
              <span className="sr-only">Instagram</span>
              <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.2849 0.960449C18.9502 0.96489 19.7954 0.973772 20.5252 0.994495L20.8124 1.00486C21.1439 1.0167 21.4711 1.0315 21.8663 1.04926C23.4413 1.12328 24.516 1.37196 25.4589 1.73759C26.4359 2.11357 27.2589 2.62278 28.0819 3.44433C28.8349 4.18407 29.4174 5.07924 29.7887 6.06736C30.1543 7.01028 30.403 8.08496 30.477 9.66144C30.4948 10.0552 30.5096 10.3823 30.5214 10.7154L30.5303 11.0026C30.5525 11.7308 30.5614 12.5761 30.5643 14.2414L30.5658 15.3456V17.2848C30.5694 18.3645 30.5581 19.4442 30.5318 20.5236L30.5229 20.8108C30.5111 21.1438 30.4962 21.471 30.4785 21.8647C30.4045 23.4412 30.1528 24.5144 29.7887 25.4588C29.4174 26.4469 28.8349 27.3421 28.0819 28.0818C27.3422 28.8348 26.447 29.4173 25.4589 29.7886C24.516 30.1542 23.4413 30.4029 21.8663 30.4769L20.8124 30.5213L20.5252 30.5302C19.7954 30.5509 18.9502 30.5613 17.2849 30.5642L16.1806 30.5657H14.243C13.1628 30.5695 12.0826 30.5582 11.0027 30.5317L10.7155 30.5228C10.3641 30.5095 10.0128 30.4942 9.66154 30.4769C8.08654 30.4029 7.01187 30.1542 6.06747 29.7886C5.07988 29.4171 4.18523 28.8347 3.44592 28.0818C2.69239 27.3422 2.1094 26.4471 1.7377 25.4588C1.37207 24.5159 1.12339 23.4412 1.04937 21.8647L1.00497 20.8108L0.997565 20.5236C0.970278 19.4442 0.957942 18.3645 0.960559 17.2848V14.2414C0.956462 13.1617 0.967318 12.082 0.993125 11.0026L1.00349 10.7154C1.01533 10.3823 1.03013 10.0552 1.04789 9.66144C1.12191 8.08496 1.37059 7.01176 1.73622 6.06736C2.10879 5.07884 2.6928 4.18363 3.4474 3.44433C4.18628 2.69169 5.08041 2.10924 6.06747 1.73759C7.01187 1.37196 8.08506 1.12328 9.66154 1.04926C10.0553 1.0315 10.3839 1.0167 10.7155 1.00486L11.0027 0.995975C12.0821 0.969675 13.1618 0.958325 14.2415 0.961929L17.2849 0.960449ZM15.7632 8.36176C13.8002 8.36176 11.9177 9.14154 10.5297 10.5296C9.14165 11.9176 8.36187 13.8001 8.36187 15.7631C8.36187 17.726 9.14165 19.6086 10.5297 20.9966C11.9177 22.3846 13.8002 23.1644 15.7632 23.1644C17.7261 23.1644 19.6087 22.3846 20.9967 20.9966C22.3847 19.6086 23.1645 17.726 23.1645 15.7631C23.1645 13.8001 22.3847 11.9176 20.9967 10.5296C19.6087 9.14154 17.7261 8.36176 15.7632 8.36176ZM15.7632 11.3223C16.3464 11.3222 16.9238 11.437 17.4627 11.66C18.0015 11.8831 18.4911 12.2101 18.9035 12.6224C19.316 13.0347 19.6431 13.5242 19.8664 14.063C20.0897 14.6017 20.2046 15.1792 20.2047 15.7623C20.2048 16.3455 20.09 16.923 19.867 17.4618C19.6439 18.0006 19.3169 18.4902 18.9046 18.9027C18.4923 19.3151 18.0028 19.6423 17.464 19.8656C16.9253 20.0888 16.3478 20.2038 15.7647 20.2039C14.5869 20.2039 13.4574 19.736 12.6246 18.9032C11.7917 18.0704 11.3239 16.9409 11.3239 15.7631C11.3239 14.5853 11.7917 13.4558 12.6246 12.623C13.4574 11.7902 14.5869 11.3223 15.7647 11.3223M23.5361 6.14137C23.0453 6.14137 22.5747 6.33631 22.2277 6.68332C21.8807 7.03032 21.6857 7.50096 21.6857 7.9917C21.6857 8.48244 21.8807 8.95307 22.2277 9.30008C22.5747 9.64708 23.0453 9.84203 23.5361 9.84203C24.0268 9.84203 24.4974 9.64708 24.8444 9.30008C25.1914 8.95307 25.3864 8.48244 25.3864 7.9917C25.3864 7.50096 25.1914 7.03032 24.8444 6.68332C24.4974 6.33631 24.0268 6.14137 23.5361 6.14137Z" fill="white" />
              </svg>
            </Link>
            <Link href="#">
              <span className="sr-only">X</span>
              <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.36092 0.960449C2.02818 0.960449 0.131592 2.85704 0.131592 5.18977V26.3364C0.131592 28.6691 2.02818 30.5657 4.36092 30.5657H25.5075C27.8403 30.5657 29.7369 
                            28.6691 29.7369 26.3364V5.18977C29.7369 2.85704 27.8403 0.960449 25.5075 0.960449H4.36092ZM23.9942 6.51144L17.1348 14.3489L25.2035 25.0147H18.886L13.943 18.5452L8.27965 
                            25.0147H5.1407L12.4759 16.6288L4.73759 6.51144H11.2137L15.6876 12.4259L20.8553 6.51144H23.9942ZM21.4963 23.138L10.2688 8.28907H8.3986L19.7517 23.138H21.4897H21.4963Z" fill="white" />
              </svg>
            </Link>
            <Link href={"#"}>
              <span className="sr-only">Linkedin</span>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.4671 0.440918C25.2523 0.440918 26.0053 0.75283 26.5605 1.30804C27.1157 1.86324 27.4276 2.61626 27.4276 3.40144V24.1251C27.4276 24.9103 27.1157 25.6633 26.5605 26.2185C26.0053 26.7737 25.2523 27.0857 24.4671 27.0857H3.74342C2.95824 27.0857 2.20522 26.7737 1.65002 26.2185C1.09481 25.6633 0.782898 24.9103 0.782898 24.1251V3.40144C0.782898 2.61626 1.09481 1.86324 1.65002 1.30804C2.20522 0.75283 2.95824 0.440918 3.74342 0.440918H24.4671ZM23.727 23.385V15.5396C23.727 14.2598 23.2186 13.0323 22.3136 12.1273C21.4086 11.2224 20.1812 10.7139 18.9013 10.7139C17.6431 10.7139 16.1776 11.4837 15.4671 12.6383V10.9952H11.3372V23.385H15.4671V16.0873C15.4671 14.9475 16.3849 14.0149 17.5247 14.0149C18.0743 14.0149 18.6014 14.2333 18.9901 14.6219C19.3787 15.0106 19.597 15.5377 19.597 16.0873V23.385H23.727ZM6.52632 8.67118C7.18587 8.67118 7.81841 8.40918 8.28478 7.9428C8.75116 7.47643 9.01316 6.84389 9.01316 6.18434C9.01316 4.80769 7.90296 3.68269 6.52632 3.68269C5.86284 3.68269 5.22654 3.94626 4.75739 4.41541C4.28824 4.88456 4.02467 5.52086 4.02467 6.18434C4.02467 7.56098 5.14967 8.67118 6.52632 8.67118ZM8.58389 23.385V10.9952H4.48356V23.385H8.58389Z" fill="white" />
              </svg>
            </Link>
            <Link href="#">
              <span className="sr-only">Facebook</span>
              <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.0395 15.7631C30.0395 7.59203 23.4079 0.960449 15.2368 0.960449C7.06578 0.960449 0.434204 7.59203 0.434204 15.7631C0.434204 22.9276 5.52631 28.893 12.2763 30.2697V20.2039H9.31578V15.7631H12.2763V12.0624C12.2763 9.20552 14.6003 6.8815 17.4572 6.8815H21.1579V11.3223H18.1974C17.3832 11.3223 16.7171 11.9884 16.7171 12.8026V15.7631H21.1579V20.2039H16.7171V30.4917C24.1924 29.7516 30.0395 23.4456 30.0395 15.7631Z" fill="white" />
              </svg>
            </Link>
           
          </div>
        </div>
        {/* Products */}
        <div>
          <ul className="flex flex-col gap-5 ">
            <li>
              <h3 className="font-semibold text-[#fff]">Quick Links</h3>
            </li>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="#features">Features</Link>
            </li>
            <li>
              <Link href="#benefit">Benefits</Link>
            </li>
            <li>
              <Link href="#pricing">Pricing</Link>
            </li>
          
            <li>
              <Link href="#testimonials">Client Stories</Link>
            </li>
          </ul>
        </div>
        {/* Quick Links */}
        <div>
          <ul className="flex flex-col gap-5 ">
            <li>
              <h3 className="font-semibold text-[#fff]">Company</h3>
            </li>
          
            <li>
              <Link href="/helpCenter">Help Center</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        {/* Contact us */}
        {/* <div>
          <ul className="flex flex-col gap-5 ">
            <li className="flex items-center">
              <h3 className="font-semibold text-[#fff]">Terms</h3>
            </li>
            <li className="flex items-center">
              <Link href="#">Support Center</Link>
            </li>
            <li className="flex items-center">
              <Link href="#">Become a Partner</Link>
            </li>
          </ul>
        </div> */}
        <div>
          <ul className="flex flex-col gap-5 ">
            <li className="flex items-center">
              <h3 className="font-semibold text-[#fff]">Terms</h3>
            </li>
            <li className="flex items-center">
              <Link href="/terms">Terms of service</Link>
            </li>
            <li className="flex items-center">
              <Link href="/privacy">Privacy policy</Link>
            </li>
          </ul>
        </div>
         <div className="flex flex-col gap-4 items-right justify-end">
              <Image src={"/playstore.png"} height={154} width={154} alt="explode svg" />
              <Image src={"/applestore.png"} height={154} width={154} alt="explode svg" />
            </div>
      </div>
      <div className="border-t border-gray-500 text-center mt-8 py-4">
        &copy; 2025 Ubedu. All rights reserved
      </div>
    </div>
  );
}

import SignInStatusIcon from "@/components/ui/feedback/SignInStatusIcon";
import ThemeToggle from "@/components/ui/toggles/DarkModeToggle";
import HeaderBranding from "./HeaderBranding";
import HeaderDropDown from "./HeaderDropDown";
import HeaderNavBar from "./HeaderNavBar";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
      <HeaderBranding />
      {/* HeaderNavBar visible md and up */}
      <div className="hidden md:flex">
        <HeaderNavBar />
      </div>
      <div className="flex gap-2 sm:gap-4 items-center">
        <SignInStatusIcon />
        {/* ThemeToggle visible md and up */}
        <div className="hidden md:flex">
          <ThemeToggle />
        </div>
        {/* HeaderDropDown visible below md */}
        <div className="md:hidden">
          <HeaderDropDown />
        </div>
      </div>
    </div>
  );
};

export default Header;

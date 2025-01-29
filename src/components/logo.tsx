import logo from "../assets/mp_logo.png";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center rounded-full">
      <img className="size-30 mb-5 rounded-full" src={logo} alt="Mentor Program Logo" />
    </div>
  );
};
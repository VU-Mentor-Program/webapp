import { Header } from "../components/header";
import { SocialLinks } from "../components/social-link";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";
import { Calendar } from "../components/Calendar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white text-center px-5">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center">
        <Logo />
        <h1 className="text-2xl font-bold pt-1">Mentor Program</h1>
        <p className="text-base pt-1 pb-1">
          Aiming to bring first-year students together 😊
        </p>
        <SocialLinks />
        <Calendar />
      </div>
      <Footer />
    </div>
  );
}

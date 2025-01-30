import { Header } from "../components/header";
import { SocialLinks } from "../components/social-link";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";
import { Calendar } from "../components/Calendar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white text-center px-5">
      <Header />
      <Logo />

      <h1 className="text-2xl font-bold mt-4">Mentor Program</h1>
      <p className="text-base">
        Aiming to bring first-year students together 😊
      </p>

      <SocialLinks />

      <Calendar />

      <Footer />
    </div>
  );
}

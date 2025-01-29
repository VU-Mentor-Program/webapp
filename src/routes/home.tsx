import { Header } from "../components/header"
import { SocialLinks } from "../components/social-link";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center pr-5 pl-5">
      <Header />
        <Logo />
          <h1 className="text-2xl font-bold">Mentor Program</h1>
          <p className="text-base">Aiming to bring first-year students together 😊</p>
        <SocialLinks />
      <Footer />
    </div>
  );
}

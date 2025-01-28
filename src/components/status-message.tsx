import { Header } from "./header";
import { Footer } from "./footer";

interface StatusMessageProps {
  title: string;
  message: string;
}

export const StatusMessage = ({ title, message }: StatusMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center">
      <Header />
      <h1 className="text-3xl">{title}</h1>
      <p className="text-xl">{message}</p>
      <Footer />
    </div>
  );
};

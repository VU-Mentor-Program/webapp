import { FormsAccordion } from "./FormsAccordion";
import { useTranslations } from "../contexts/TranslationContext";
import FadeIn from "./Fadein-Wrapper";

export const JobApplication: React.FC = () => {
  const t = useTranslations("job_application");
  const promo_img = "/webapp/job_application.jpg";

  const forms = [
    {
      link: "https://forms.gle/V1uokWqV87DTaRfX7",
      title: "Fill this out to apply! Deadline is 23rd of May!",
    },
  ];

  return (
    <FadeIn duration={100} className="mt-10">
      <div className="flex justify-center">
        <img
          src={promo_img}
          alt="Job Application Promo"
          className="w-80 h-80 object-cover rounded-lg" 
        />
      </div>

      <div className="bg-gray-800 text-white text-center px-5">
        <div className="flex flex-col items-center justify-center">
          <FormsAccordion forms={forms} translation={"job_application"}/>
        </div>
      </div>
    </FadeIn>
  );
};

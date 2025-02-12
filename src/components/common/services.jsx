import { AiFillFileText } from "react-icons/ai";
import { FaBriefcase, FaGraduationCap, FaLaptop } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { car1, car2, car3 } from "../../assets";

const services = [
  {
    title: "Business Consultancy Services",
    description:
      "Expert guidance and strategies to help grow and sustain your business.",
    icon: <FaBriefcase className="w-6 h-6" />,
    n_icon: FaBriefcase,
    bgImage: `url(${car1})`,
    link: "/services/businesscs",
  },
  {
    title: "Document Processing and Preparation",
    description:
      "Streamlining and managing the preparation of essential business documents.",
    icon: <AiFillFileText className="w-6 h-6" />,
    n_icon: AiFillFileText,
    bgImage: `url(${car2})`,
    link: "/services/documentpp",
  },
  {
    title: "Events Advisory and Management",
    description: "Advising and managing events to ensure their success.",
    icon: <MdEvent className="w-6 h-6" />,
    n_icon: MdEvent,
    bgImage: `url(${car3})`,
    link: "/services/eventsam",
  },
  {
    title: "Digital Media Consultancy and Management",
    description: "Guidance and management for all your digital media needs.",
    icon: <FaLaptop className="w-6 h-6" />,
    n_icon: FaLaptop,
    bgImage: `url(${car1})`,
    link: "/services/digitalmcm",
  },
  {
    title: "Career Guidance and Coaching",
    description:
      "Providing guidance and coaching for career growth and development.",
    icon: <FaGraduationCap className="w-6 h-6" />,
    n_icon: FaGraduationCap,

    bgImage: `url(${car1})`,
    link: "/services/careergc",
  },
];

export { services };

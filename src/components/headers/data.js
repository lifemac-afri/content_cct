// import { BiBookOpen, BiCalendar } from "react-icons/bi";
// import { FaEllipsis } from "react-icons/fa6";
// import { FcDocument } from "react-icons/fc";
// import { HiIdentification, HiOfficeBuilding } from "react-icons/hi";
// import { IoBulb } from "react-icons/io5";
import { services } from "../common/services";

// const services = [
//   {
//     title: "CV Review",
//     desc: "Professional review of your CV for better job prospects.",
//     icon: FcDocument,
//     href: "#",
//   },
//   {
//     title: "Birth Cert, Passport and other Documents Processing",
//     desc: "Efficient processing of vital documents like birth certificates and passports.",
//     icon: HiIdentification,
//     href: "#",
//   },
//   {
//     title: "Business Registration",
//     desc: "Assistance in registering your business with necessary authorities.",
//     icon: HiOfficeBuilding,
//     href: "#",
//   },
//   {
//     title: "Research",
//     desc: "Comprehensive research services to support your business decisions.",
//     icon: BiBookOpen,
//   },
//   {
//     title: "Business Consulting",
//     desc: "Expert advice to improve your business strategies and operations.",
//     icon: IoBulb,
//     href: "#",
//   },
//   {
//     title: "Events Advisory",
//     desc: "Professional guidance for planning and managing events successfully.",
//     icon: BiCalendar,
//     href: "#",
//   },
//   {
//     title: "Others",
//     desc: "Additional services tailored to meet your unique business needs.",
//     icon: FaEllipsis,
//     href: "#",
//   },
// ];

const data = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About Us",
    link: "/about",
  },
  { title: "Contact", link: "/contact" },
  {
    title: "Services",
    link: "/services",
    items: services,
  },
  { title: "Resource Docs", link: "/downloads", items: [] },
  {
    title: "Blog",
    link: "/blog",
  },
];

export default data;

// const socials = [
//   {
//     icon: <FaFacebook className="w-4 h-4 hover:fill-primary_green" />,
//     link: "//facebook.com",
//   },
//   {
//     icon: <FaInstagram className="w-4 h-4 hover:fill-primary_green" />,
//     link: "//instagram.com",
//   },
//   {
//     icon: <FaX className="w-4 h-4 hover:fill-primary_green" />,
//     link: "//x.com",
//   },
//   {
//     icon: <FaLinkedin className="w-4 h-4 hover:fill-primary_green" />,
//     link: "//linkedin.com",
//   },
// ];

export { services };

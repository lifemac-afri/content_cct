/* eslint-disable react/prop-types */

const Pill = ({ icon, text, link }) =>
  link ? (
    <div className="flex items-center gap-2">
      <a
        href={link}
        className="flex justify-center gap-2 items-center"
        target="_blank"
      >
        {icon} <p className="text-white text-sm">{text}</p>
      </a>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-white text-sm">{text}</p>
    </div>
  );
export default Pill;

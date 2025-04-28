import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <div className="flex flex-col items-center gap-4">
        {/* Illustration */}
        {/* <img
          src="https://via.placeholder.com/300x200?text=404+Illustration"
          alt="404 Illustration"
          className="w-64 md:w-80"
        /> */}

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-800 md:text-6xl">404</h1>
        <p className="text-lg text-gray-600 md:text-xl">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-x-4">
          <Link
            to="/"
            className="px-6 py-2 text-white bg-green-600 rounded-md shadow hover:bg-green-700 transition"
          >
            Go Home
          </Link>
          <Link
            to="/contact"
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

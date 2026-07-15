import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4">Sas Cafe POS</h1>

        <p className="text-[#ababab] text-lg mb-6">
          Restaurant POS system for billing, kitchen orders, tables, payments,
          invoices, and restaurant management.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
          <div className="bg-[#262626] p-4 rounded-lg">✅ Billing System</div>
          <div className="bg-[#262626] p-4 rounded-lg">
            ✅ Kitchen Dashboard
          </div>
          <div className="bg-[#262626] p-4 rounded-lg">✅ Table Management</div>
          <div className="bg-[#262626] p-4 rounded-lg">✅ Payment Tracking</div>
        </div>

        <Link
          to="/auth"
          className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold"
        >
          Staff Login
        </Link>
      </div>
    </div>
  );
};

export default Landing;

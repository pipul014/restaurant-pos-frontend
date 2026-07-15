import React, { useEffect } from "react";
import { MdPeople } from "react-icons/md";

import BackButton from "../components/shared/BackButton";
import BottomNav from "../components/shared/BottomNav";
import StaffManagement from "../components/admin/StaffManagement";

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Staff Management";
  }, []);

  return (
    <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />

          <div>
            <h1 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold tracking-wider flex items-center gap-2">
              <MdPeople />
              Staff Management
            </h1>

            <p className="text-[#ababab] text-sm mt-1">
              Manage restaurant staff users and access permissions.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <StaffManagement />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Dashboard;

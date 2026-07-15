import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import BackButton from "../components/shared/BackButton";
import BottomNav from "../components/shared/BottomNav";
import { updateRestaurantWorkflow } from "../https";
import { setRestaurantSettings } from "../redux/slices/settingsSlice";

const RestaurantSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [selected, setSelected] = useState(settings.workflow || "KITCHEN");
  const [saving, setSaving] = useState(false);
  useEffect(() => { setSelected(settings.workflow || "KITCHEN"); document.title = "POS | Settings"; }, [settings.workflow]);

  const save = async () => {
    try {
      setSaving(true);
      const response = await updateRestaurantWorkflow(selected);
      dispatch(setRestaurantSettings(response.data.data));
      enqueueSnackbar(response.data.message || "Workflow updated", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Unable to update workflow", { variant: "error" });
    } finally { setSaving(false); }
  };

  return <section className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-24 text-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6"><BackButton /><div><h1 className="text-2xl sm:text-3xl font-bold">Restaurant Settings</h1><p className="text-[#ababab] text-sm mt-1">Choose the default workflow for every new order.</p></div></div>
      <div className="bg-[#262626] border border-[#333] rounded-2xl p-5 sm:p-7">
        <div className="space-y-4">
          {[
            ["KITCHEN", "Kitchen Service", "Orders go to KDS, preparation, ready, served and payment."],
            ["POST_BILLING", "Post Billing", "Create an open bill, edit items, collect payment and print receipt without KDS."],
          ].map(([value,title,description]) => <button key={value} type="button" onClick={() => setSelected(value)} className={`w-full text-left rounded-xl border p-5 transition ${selected===value ? "border-[#f6b100] bg-[#332d1c]" : "border-[#3a3a3a] bg-[#1f1f1f] hover:border-[#555]"}`}>
            <div className="flex gap-3"><span className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${selected===value ? "border-[#f6b100]" : "border-[#777]"}`}>{selected===value && <span className="h-2.5 w-2.5 rounded-full bg-[#f6b100]" />}</span><div><h2 className="font-bold text-lg">{title}</h2><p className="text-[#ababab] text-sm mt-1">{description}</p></div></div>
          </button>)}
        </div>
        <div className="mt-6 flex justify-end"><button type="button" disabled={saving || selected===settings.workflow} onClick={save} className="bg-[#f6b100] text-black font-bold px-6 py-3 rounded-xl disabled:opacity-50">{saving ? "Saving..." : "Save Workflow"}</button></div>
      </div>
    </div><BottomNav /></section>;
};
export default RestaurantSettings;

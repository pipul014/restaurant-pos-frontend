import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getRestaurantSettings, getUserData } from "../https";
import { setUser, removeUser } from "../redux/slices/userSlice";
import { setRestaurantSettings } from "../redux/slices/settingsSlice";

const useLoadData = ({ skip = false } = {}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(!skip);

  useEffect(() => {
    if (skip) { setIsLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const userResponse = await getUserData();
        if (!active) return;
        dispatch(setUser(userResponse.data.data));
        try {
          const settingsResponse = await getRestaurantSettings();
          if (active) dispatch(setRestaurantSettings(settingsResponse.data.data));
        } catch (_) {}
      } catch (_) {
        if (active) dispatch(removeUser());
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [dispatch, skip]);

  return isLoading;
};
export default useLoadData;

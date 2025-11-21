import { useEffect } from "react";

export const ShopeeRedirect = () => {
  useEffect(() => {
    const lastOpened = localStorage.getItem("shopee-redirect-date");
    const today = new Date().toDateString();
    
    if (lastOpened !== today) {
      // Open Shopee link in new tab
      window.open("https://s.shopee.ph/3fvxJ5MXX6", "_blank");
      
      // Save today's date
      localStorage.setItem("shopee-redirect-date", today);
    }
  }, []);

  return null;
};

import { Outlet } from "react-router-dom";

import Flash from "../components/Flash";
import { useContext } from "react";
import AppContext from "../context/AppContext";
const RootLayout = () => {
  const { flash } = useContext(AppContext);
  return (
    <>
      {/* <Header footer  />  */}
      <Outlet />
      {flash.message && (
        <Flash
          message={flash.message}
          duration={flash.duration}
          onClose={flash.onClose}
          type={flash.type}
        />
      )}
    </>
  );
};

export default RootLayout;

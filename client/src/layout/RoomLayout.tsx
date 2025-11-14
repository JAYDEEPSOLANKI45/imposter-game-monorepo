import { Outlet } from "react-router-dom";
import ResultModal from "../components/ResultModal";

const RoomLayout = () => {
  return (
    <div>
      <h1>Welcome to Room</h1>
      <Outlet />
      <ResultModal />
    </div>
  );
};

export default RoomLayout;

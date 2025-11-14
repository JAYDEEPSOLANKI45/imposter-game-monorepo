import { useContext } from "react";
import AppContext from "../context/AppContext";
import { Navigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  let { player, setFlash } = useContext(AppContext);
  let { roomId } = useParams();

  if (!player.roomId) {
    setFlash({
      message: `You are not allowed until you join "${roomId}"`,
      duration: 3000,
      onClose: () => {},
      type: "error",
    });
    return <Navigate to="/" replace />;
  }

  if (player.roomId != roomId) {
    setFlash({
      message: `First leave "${player.roomId}", then you'll be able to join "${roomId}"`,
      duration: 3000,
      onClose: () => {},
      type: "error",
    });
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;

import { Outlet, useParams } from "react-router-dom";

const RoomPage = () => {
  const { roomId } = useParams();

  return (
    <>
      <div>Room id: {roomId}</div>
      <Outlet />
    </>
  );
};

export default RoomPage;

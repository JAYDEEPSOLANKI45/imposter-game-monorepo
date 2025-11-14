import "./App.css";
import RootLayout from "./layout/RootLayout";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import RoomLayout from "./layout/RoomLayout";
import RoomPage from "./pages/RoomPage";
import Lobby from "./components/Lobby";
import Arena from "./components/Arena";
import Error from "./components/CustError";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Homepage />} />
        <Route
          path="room"
          element={
            <ProtectedRoute>
              <RoomLayout />
            </ProtectedRoute>
          }
        >
          <Route path=":roomId" element={<RoomPage />}>
            <Route path="lobby" element={<Lobby />} />
            <Route path="arena" element={<Arena />} />
          </Route>
        </Route>
        <Route path="*" element={<Error status={404} message="Not Found" />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

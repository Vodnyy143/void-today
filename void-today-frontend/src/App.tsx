import AppRoutes from "./routes";
import {getMe} from "./store/slices/authSlice.ts";
import {useAppDispatch} from "./store/hooks.ts";
import {useEffect} from "react";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
      <AppRoutes />
  );
}

export default App

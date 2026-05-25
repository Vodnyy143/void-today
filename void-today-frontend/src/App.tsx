import AppRoutes from "./routes";
import {getMe} from "./store/slices/authSlice.ts";
import {useAppDispatch, useAppSelector} from "./store/hooks.ts";
import {useEffect} from "react";

function App() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(s => s.settings);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;

    const apply = (resolved: 'dark' | 'light') => root.setAttribute('data-theme', resolved);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme);
    }
  }, [theme]);

  return (
      <AppRoutes />
  );
}

export default App

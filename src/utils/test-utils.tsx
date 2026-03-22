import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import setupStore, { type PreloadedState } from "@/config/store";
import { apiSliceWithAuth } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";
import initializeTheme from "@/libs/theme";
import type { PropsWithChildren, ReactElement } from "react";

interface ExtendedRenderOptions extends RenderOptions {
  preloadedState?: PreloadedState;
}

export default function renderWithProviders(
  ui: ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const { preloadedState } = extendedRenderOptions;
  const store = setupStore(preloadedState);
  const jwtToken = getJwtToken();
  const theme = initializeTheme();

  if (jwtToken) {
    void store.dispatch(apiSliceWithAuth.endpoints.getUser.initiate(jwtToken));
  }

  const Wrapper = ({ children }: PropsWithChildren) => {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Provider>
    );
  };

  return render(ui, { wrapper: Wrapper });
}

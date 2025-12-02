import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren, ReactElement } from "react";
import setupStore from "@/config/store";
import { apiSliceWithAuth } from "@/slices/authSlice";
import { getJwtToken } from "@/services/localStorage";

export default function renderWithProviders(ui: ReactElement) {
  const store = setupStore();
  const jwtToken = getJwtToken();

  if (jwtToken) {
    void store.dispatch(apiSliceWithAuth.endpoints.getUser.initiate(jwtToken));
  }

  const Wrapper = ({ children }: PropsWithChildren) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return render(ui, { wrapper: Wrapper });
}

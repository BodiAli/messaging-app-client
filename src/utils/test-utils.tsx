import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import type { PropsWithChildren, ReactElement } from "react";
import setupStore from "@/config/store";

export default function renderWithProviders(ui: ReactElement) {
  const store = setupStore();

  const Wrapper = ({ children }: PropsWithChildren) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return render(ui, { wrapper: Wrapper });
}

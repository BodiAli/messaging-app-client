import { useLoginMutation } from "@/slices/authSlice";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [login] = useLoginMutation();
  const navigate = useNavigate();

  return (
    <main>
      <h1>Log in to your account</h1>

      <form
        aria-label="Login form"
        onSubmit={(e) => {
          const asyncHandler = async () => {
            e.preventDefault();

            const username = e.currentTarget.elements.username.value;
            const password = e.currentTarget.elements.password.value;

            await login({ username, password });

            void navigate("/");
          };

          void asyncHandler();
        }}
      >
        <label>
          Username
          <input type="text" name="username" />
        </label>
        <label>
          Password
          <input type="password" name="password" />
        </label>
        <button type="submit">Log in</button>
      </form>
    </main>
  );
}

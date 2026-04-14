import apiSlice from "./apiSlice";
import type { User } from "@/types/modelsType";

const apiSliceWithProfile = apiSlice.injectEndpoints({
  endpoints(build) {
    return {
      updateProfilePicture: build.mutation<{ user: User }, FormData>({
        query: (formData) => {
          return {
            url: "/me",
            method: "PATCH",
            body: formData,
          };
        },
      }),
    };
  },
});

export const { useUpdateProfilePictureMutation } = apiSliceWithProfile;

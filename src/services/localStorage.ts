export const getJwtToken = () => localStorage.getItem("token");

export const setJwtToken = (value: string) => {
  localStorage.setItem("token", value);
};

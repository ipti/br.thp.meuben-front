import { createContext } from "react";
import { UsersTypes } from "./type";
import { UsersState } from "./state";

export const UsersContext = createContext<UsersTypes | null>(null);

const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    users,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    nameSearch,
    setNameSearch,
    CreateUser,
    DeleteUser,
    UpdateUser,
    isLoading,
    role,
    setRole,
    ChangePassword,
  } = UsersState();
  return (
    <UsersContext.Provider
      value={{
        users,
        total,
        page,
        perPage,
        setPage,
        setPerPage,
        nameSearch,
        setNameSearch,
        CreateUser,
        DeleteUser,
        UpdateUser,
        isLoading,
        role,
        setRole,
        ChangePassword,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersProvider;

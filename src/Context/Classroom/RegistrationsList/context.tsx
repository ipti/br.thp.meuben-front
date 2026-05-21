import { createContext } from "react";
import { RegistrationClassroomState } from "./state";
import { RegistrationClassroomTypes } from "./type";

export const RegistrationClassroomContext =
  createContext<RegistrationClassroomTypes | null>(null);

const RegistartionClassroomProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { registrations, DeleteRegistration, isLoading, statusTerm, setStatusTerm } = RegistrationClassroomState();

  return (
    <RegistrationClassroomContext.Provider
      value={{ registrations, DeleteRegistration, isLoading, statusTerm, setStatusTerm }}
    >
      {children}
    </RegistrationClassroomContext.Provider>
  );
};

export default RegistartionClassroomProvider;

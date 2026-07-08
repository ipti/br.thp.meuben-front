import { useEffect, useState } from "react";
import { converterData } from "../../Controller/controllerGlobal";
import { ControllerUser } from "../../Services/Users/controller";
import { useFetchRequestUsers } from "../../Services/Users/query";
import { CreateUser } from "./type";

export const UsersState = () => {
  const [users, setusers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [role, setRole] = useState<string | undefined>("TODOS");
  const [nameSearch, setNameSearch] = useState("");

  const { data: userRequest, isLoading } = useFetchRequestUsers({
    role,
    page,
    perPage,
    name: nameSearch,
  });

  const props = ControllerUser();

  const GetId = (data: any) => {
    const array = [];
    for (const project of data) {
      array.push(project.id);
    }
    return array;
  };

  const CreateUser = (data: CreateUser) => {
    const body = {
      name: data.name,
      username: data.username,
      password: data.password,
      role: data.role,
    };
    props.requestUserMutation.mutate(body);
  };

  const UpdateUser = (data: CreateUser, id: number) => {
    const body = {
      name: data.name,
      username: data.username,
      role: data.role,
      sex: data.sex,
      color_race: data.color_race,
      birthday: data.birthday ? converterData(data.birthday.toString()) : undefined,
      email: data.email,
      initial_date: data.initial_date ? converterData(data.initial_date.toString()) : undefined,
      phone: data.phone,
    };
    props.requestUpdateUserMutation.mutate({ data: body, id: id });
  };

  const ChangePassword = (data: { password: string }, id: number) => {
    props.requestPasswordMutation.mutate({ data: data, id: id });
  };

  const DeleteUser = (id: number) => {
    props.requestDeleteUserMutation.mutate(id);
  };

  useEffect(() => {
    if (userRequest) {
      setusers(userRequest.data ?? []);
      setTotal(userRequest.total ?? 0);
    }
  }, [userRequest]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [role, nameSearch]);

  return {
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
  };
};

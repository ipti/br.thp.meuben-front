import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { idProject, idUser, login, logout, menuItem } from "../localstorage";
import { LoginRequest } from "./request";
import { LoginTypes } from "./types";
import Swal from "sweetalert2";
import styles from "../../Styles";

export const LoginController = ({ setError }: { setError: any, }) => {
  const history = useNavigate();

  const LoginRequestMutation = useMutation(
    (data: LoginTypes) => LoginRequest(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response.data.message,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
        setError(error.response.data.message)
      },
      onSuccess: (data) => {
        logout()
        login(data.data.access_token);
        idUser(data.data.userRegistered.id);
        // ProjectLogin(data.data.user.schools)
        const firstSocialTech =
          data.data.userRegistered.profile?.profile_social_technology?.[0]?.social_technology_fk;
        if (firstSocialTech) {
          idProject(firstSocialTech);
        }

        history("/");
        menuItem("1");
        window.location.reload();
      },

    }
  );

  return {
    LoginRequestMutation
  }
}
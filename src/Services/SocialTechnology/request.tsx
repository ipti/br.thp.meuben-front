import http from "../axios";
import { GetIdUser } from "../localstorage";

export const requestSocialTechnologytList = async () => {
  if (GetIdUser()) {
    return await http
      .get("/social-technology-bff/user", { params: { userId: GetIdUser() } })
      .then((response) => response.data)
      .catch((err) => {
        // if(err.response.status === 401){
        //   logout()
        //   window.location.reload()
        // }

        throw err;
      });
  }
};


export const requestSocialTechnologyOne = async () => {
  if (GetIdUser()) {
    return await http
      .get("/social-technology-bff/one", { params: { stId: GetIdUser() } })
      .then((response) => response.data)
      .catch((err) => {
        // if(err.response.status === 401){
        //   logout()
        //   window.location.reload()
        // }

        throw err;
      });
  }
};


export const requestCreateSocialTechnology = async (body: {name: string}) => {
    return await http
      .post("/social-technology-bff", body)
      .then((response) => response.data)
      .catch((err) => {
        throw err;
      });
};

export const requestDeleteSocialTechnology = async (stId: number) =>
  http.delete("/social-technology-bff", { params: { stId } }).then((r) => r.data);
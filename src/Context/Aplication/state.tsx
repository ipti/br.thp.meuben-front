import { useEffect, useState } from "react";
import { useFetchRequestSocialTechnologyLists } from "../../Services/SocialTechnology/query";
import { useFetchRequestUsersLogin } from "../../Services/Users/query";
import { GetIdTs, GetIdUser, idTs } from "../../Services/localstorage";
import { Projects, PropsForm } from "../../Types/types";
import { User } from "../Users/type";

const AplicationState = () => {
    const [form, setform] = useState<PropsForm>({ title: "Formulário Sem título", description: "", question: [] })
    const { data: projects } = useFetchRequestSocialTechnologyLists();

    const [project, setproject] = useState<Array<Projects> | undefined>();
    const [user, setuser] = useState<User | undefined>();


    const { data: userRequest } = useFetchRequestUsersLogin(parseInt(GetIdUser()!))



    useEffect(() => {
        if (projects) {
            setproject(projects)

            if (!GetIdTs()) {
                idTs(projects[0]?.id?.toString())
            }

        }
        if (userRequest) {
            setuser({
                ...userRequest,
                profileId:   userRequest.profile?.id,
                profileType: userRequest.profile?.current_type,
            })
        }
    }, [projects, userRequest])

    return {
        form, setform, project, user
    }
}

export default AplicationState;
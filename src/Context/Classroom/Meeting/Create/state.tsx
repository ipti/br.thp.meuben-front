import { MeetingController } from "../../../../Services/Meeting/controller"
import { CreateMeeting } from "./type"

export const CreateMeetingState = () => {

    const { requestCreateMeetingMutation } = MeetingController()

    const getId = (array: any) => {
        var arrayReturn = [];

        for(var user of array){
            arrayReturn.push(user.id)
        }

        return arrayReturn
    }

    const CreateMeeting = (data: CreateMeeting) => {
        requestCreateMeetingMutation.mutate({...data, profiles: getId(data.profiles)})
    }

    return {
        CreateMeeting
    }
}
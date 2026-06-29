import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchRequestMeetingOne } from "../../../../Services/Meeting/query";
import { Meeting } from "./type";
import { CreateFouls, EditMeeting, EditMeetingUser } from "../Create/type";
import { MeetingController } from "../../../../Services/Meeting/controller";
import { requestArchivesMeeting } from "../../../../Services/Meeting/request";
import queryClient from "../../../../Services/reactquery";
export const MeetingListRegistrationState = () => {

  const { idMeeting } = useParams();

  const { data: meetingRequest, isLoading } = useFetchRequestMeetingOne(idMeeting!);
  const [meeting, setmeeting] = useState<Meeting | undefined>();

  const { requestUpdateMeetingMutation, requestDeleteArchivesMeetingMutation,requestCreateFoulsMutation, requestArchvesMeetingMutation, requestUpdateMeetinUsergMutation } = MeetingController()

  const UpdateMeeting = (data: EditMeeting, id: number) => {
    requestUpdateMeetingMutation.mutate({data: data, id: id})
  }

   const UpdateMeetingUser = (data: EditMeetingUser) => {
    requestUpdateMeetinUsergMutation.mutate({data: data})
  }

  const DeleteArchiveMeeting = (id: number) => {
    requestDeleteArchivesMeetingMutation.mutate(id)
  }

  const ArchivesMeeting = async (files: File[], id: number) => {
    await Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        return requestArchivesMeeting(formData, id);
      })
    );
    queryClient.refetchQueries("useRequestsMeetingOne");
  }

  const CreateFouls = (data: CreateFouls) => {
    requestCreateFoulsMutation.mutate(data)
  }

  useEffect(() => {
    if (meetingRequest) {
      setmeeting(meetingRequest);
    }
  }, [meetingRequest]);

  return { meeting, UpdateMeeting, CreateFouls, ArchivesMeeting, isLoading, DeleteArchiveMeeting, UpdateMeetingUser };
};

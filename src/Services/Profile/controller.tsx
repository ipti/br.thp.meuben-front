import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import queryClient from '../reactquery';
import styles from '../../Styles';
import {
  requestCreateProfile,
  requestCreateUserWithProfile,
  requestUpdateProfile,
  requestDeleteProfile,
} from './request';
import { CreateProfileDto, CreateUserWithProfile } from '../../Context/Profile/type';

const invalidateProfiles = (profileId?: number) => {
  queryClient.refetchQueries('useRequestsProfiles');
  queryClient.refetchQueries('useRequestsUsersWithoutProfile');
  if (profileId) {
    queryClient.refetchQueries(['useRequestsProfileOne', profileId]);
    queryClient.refetchQueries(['useRequestsProfileTypeLog', profileId]);
  }
};

export const ControllerProfile = () => {
  const history = useNavigate();

  const createProfileMutation = useMutation(
    (data: CreateProfileDto) => requestCreateProfile(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao criar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil criado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidateProfiles();
          history('/perfis/' + data.id);
        });
      },
    }
  );

  const createUserWithProfileMutation = useMutation(
    (data: CreateUserWithProfile) => requestCreateUserWithProfile(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao criar perfil com login',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil e conta criados com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidateProfiles();
          const profileId = data?.profile?.id ?? data?.id;
          if (profileId) history('/perfis/' + profileId);
          else history('/perfis');
        });
      },
    }
  );

  const updateProfileMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateProfileDto> }) =>
      requestUpdateProfile(id, data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao atualizar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (data, vars) => {
        const typeChanged = vars.data.current_type !== undefined;
        Swal.fire({
          icon: 'success',
          title: typeChanged
            ? 'Tipo atualizado. O acesso será refletido no próximo login do usuário.'
            : 'Perfil atualizado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidateProfiles(vars.id);
          history('/perfis/' + vars.id);
        });
      },
    }
  );

  const linkUserMutation = useMutation(
    ({ profileId, userId }: { profileId: number; userId: number }) =>
      requestUpdateProfile(profileId, { user_fk: userId }),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao vincular usuário',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (_, vars) => {
        Swal.fire({
          icon: 'success',
          title: 'Usuário vinculado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => invalidateProfiles(vars.profileId));
      },
    }
  );

  const unlinkUserMutation = useMutation(
    (profileId: number) => requestUpdateProfile(profileId, { user_fk: null }),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao desvincular usuário',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (_, profileId) => {
        Swal.fire({
          icon: 'success',
          title: 'Vínculo removido. O usuário não foi excluído.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => invalidateProfiles(profileId));
      },
    }
  );

  const deleteProfileMutation = useMutation(
    (id: number) => requestDeleteProfile(id),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao excluir perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil excluído. O usuário vinculado não foi excluído.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidateProfiles();
          history('/perfis');
        });
      },
    }
  );

  const confirmDelete = (id: number) =>
    Swal.fire({
      icon: 'warning',
      title: 'Excluir perfil?',
      text: 'Esta ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) deleteProfileMutation.mutate(id);
    });

  const confirmUnlink = (profileId: number) =>
    Swal.fire({
      icon: 'warning',
      title: 'Desvincular usuário?',
      text: 'O usuário perderá o acesso operacional. Deseja continuar?',
      showCancelButton: true,
      confirmButtonText: 'Desvincular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) unlinkUserMutation.mutate(profileId);
    });

  return {
    createProfileMutation,
    createUserWithProfileMutation,
    updateProfileMutation,
    linkUserMutation,
    unlinkUserMutation,
    deleteProfileMutation,
    confirmDelete,
    confirmUnlink,
  };
};

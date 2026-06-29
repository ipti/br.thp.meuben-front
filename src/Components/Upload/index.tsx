import { Button } from 'primereact/button';
import { FileUpload, FileUploadHeaderTemplateOptions, ItemTemplateOptions } from 'primereact/fileupload';
import { useContext, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MeetingListRegistrationContext } from '../../Context/Classroom/Meeting/MeetingListRegistration/context';
import { MeetingListRegisterTypes } from '../../Context/Classroom/Meeting/MeetingListRegistration/type';

export default function Upload() {
    const [files, setFiles] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const fileUploadRef = useRef<FileUpload>(null);

    const { idMeeting } = useParams();
    const meetingList = useContext(MeetingListRegistrationContext) as MeetingListRegisterTypes;

    const handleSend = async () => {
        if (files.length === 0) return;
        setIsSending(true);
        setSent(false);
        try {
            await meetingList.ArchivesMeeting(files, parseInt(idMeeting!));
            fileUploadRef.current?.clear();
            setFiles([]);
            setSent(true);
            setTimeout(() => setSent(false), 4000);
        } finally {
            setIsSending(false);
        }
    };

    const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
        const { className, chooseButton, cancelButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {chooseButton}
                <Button
                    rounded
                    outlined
                    icon={isSending ? 'pi pi-spin pi-spinner' : sent ? 'pi pi-check' : 'pi pi-upload'}
                    label={
                        isSending
                            ? `Enviando ${files.length} arquivo${files.length > 1 ? 's' : ''}…`
                            : sent
                                ? 'Enviado!'
                                : `Enviar${files.length > 1 ? ` ${files.length} arquivos` : ' arquivo'}`
                    }
                    className={`p-button-rounded p-button-outlined ${sent ? 'p-button-secondary' : 'p-button-success'}`}
                    disabled={files.length === 0 || isSending}
                    onClick={handleSend}
                />
                {cancelButton}
            </div>
        );
    };

    const onTemplateSelect = (e: any) => {
        setFiles(Array.from(e.files));
    };

    const onTemplateRemove = (removedFile: File, callback: Function) => {
        setFiles((prev) => prev.filter((f) => f.name !== removedFile.name));
        callback();
    };

    const onTemplateClear = () => {
        setFiles([]);
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as any;
        const isPdf = file.type === 'application/pdf';

        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    {isPdf ? (
                        <div style={{
                            width: 100, height: 60,
                            background: '#fee2e2', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <i className="pi pi-file-pdf" style={{ color: '#dc2626', fontSize: 28 }} />
                        </div>
                    ) : (
                        <img alt={file.name} role="presentation" src={file?.objectURL} width={100} style={{ borderRadius: 8, objectFit: 'cover', height: 60 }} />
                    )}
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Button
                    type="button"
                    icon="pi pi-times"
                    className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                    disabled={isSending}
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                />
            </div>
        );
    };

    const chooseOptions = {
        icon: 'pi pi-fw pi-plus',
        label: 'Selecionar arquivos',
        className: 'custom-choose-btn p-button-rounded p-button-outlined',
    };
    const uploadOptions = {
        icon: 'pi pi-fw pi-cloud-upload',
        iconOnly: true,
        className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined',
        style: { display: 'none' },
    };
    const cancelOptions = {
        icon: 'pi pi-fw pi-times',
        label: 'Limpar',
        className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined',
    };

    return (
        <FileUpload
            ref={fileUploadRef}
            multiple
            accept="image/*,application/pdf"
            chooseOptions={chooseOptions}
            uploadOptions={uploadOptions}
            cancelOptions={cancelOptions}
            name="demo[]"
            headerTemplate={headerTemplate}
            itemTemplate={itemTemplate}
            onSelect={onTemplateSelect}
            onClear={onTemplateClear}
            emptyTemplate={
                sent
                    ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                            <i className="pi pi-check-circle" style={{ fontSize: '1.2rem' }} />
                            <p className="m-0">Arquivos enviados com sucesso!</p>
                        </div>
                    )
                    : <p className="m-0">Arraste e solte os arquivos aqui.</p>
            }
        />
    );
}

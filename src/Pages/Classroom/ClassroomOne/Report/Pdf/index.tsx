import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import img from "../../../../../Assets/images/logothp.png";
import {
  useFetchRequestClassroomReport,
  useFetchRequestFoulsClassroomOne,
} from "../../../../../Services/Classroom/query";
import {
  RegisterClassroom,
  ReportClassroomType,
} from "../../../../../Services/Classroom/type";

import imgLateral from "../../../../../Assets/images/logoleftpdf.png";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import {
  convertImageUrlToBase64,
  formatarDataAnoDuas,
  loadImageFileAsBase64,
} from "../../../../../Controller/controllerGlobal";
import { MediafrequencyType } from "../../../../../Context/Classroom/type";
import { minutesToTimeStr } from "../../../../../Components/TimeInput";
import styles from "../../../../../Styles";
import Swal from "sweetalert2";

pdfMake.vfs = pdfFonts.vfs;

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
const PDFJS_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

declare global {
  interface Window {
    pdfjsLib?: any;
    JSZip?: any;
  }
}

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src=\"${src}\"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
    document.body.appendChild(script);
  });

export const ReportClassroom = () => {
  const { id } = useParams();

  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoBaseLeft64, setLogoBaseLeft64] = useState<string | null>(null);
  const [logoBaseRegua64, setLogoBaseRegua64] = useState<string | null>(null);
  const [isGeneratingImagesZip, setIsGeneratingImagesZip] = useState(false);

  const [report, setReport] = useState<ReportClassroomType | undefined>();
  const { data: foulsRequest } = useFetchRequestFoulsClassroomOne(parseInt(id!));
  const { data } = useFetchRequestClassroomReport(parseInt(id!));

  const fouls = foulsRequest as MediafrequencyType;

  const totalMedia = fouls?.reduce((sum, item) => sum + item.media, 0);
  const totalWorkload = report?.meeting.reduce(
    (acc, meeting) => acc + (meeting.workload ?? 0),
    0
  );
  const mediaDasMedias = totalMedia / (fouls?.length || 1);

  useEffect(() => {
    if (data) {
      setReport(data);
    }
  }, [data]);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const base64 = await loadImageFileAsBase64(img);
        setLogoBase64(base64);
      } catch (error) {
        console.error("Error loading logo image:", error);
      }
    };

    loadLogo();
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const base64 = await loadImageFileAsBase64(imgLateral);
        setLogoBaseLeft64(base64);
      } catch (error) {
        console.error("Error loading logo image:", error);
      }
    };

    loadLogo();
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        if (report?.project.ruler_url) {
          const base64 = await convertImageUrlToBase64(report?.project.ruler_url);
          setLogoBaseRegua64(base64);
        }
      } catch (error) {
        console.error("Error loading logo image:", error);
      }
    };

    loadLogo();
  }, [report]);

  const bodyMeeting = (rowData: any, meeting: any) => {
    const verifyFouls = () => {
      const verify = meeting.fouls?.find(
        (props: any) => props.registration_fk === rowData.registration_fk
      );
      return verify;
    };
    return !verifyFouls() ? "P" : "F";
  };

  const uniqueProfilesMap = new Map();

  report?.meeting?.forEach((meeting: any) => {
    (meeting?.meeting_profile ?? []).forEach((entry: any) => {
      const profile = entry.profile;
      if (profile && !uniqueProfilesMap.has(profile.id)) {
        uniqueProfilesMap.set(profile.id, profile);
      }
    });
  });

  const uniqueUsers = Array.from(uniqueProfilesMap.values());

  const bodyTotal = (rowData: RegisterClassroom) => {
    let count = 0;
    const verifyFouls = () => {
      for (const meeting of data?.meeting) {
        const verify = meeting?.fouls?.find(
          (props: any) => props.registration_fk === rowData.registration_fk
        );

        if (verify) {
          count++;
        }
      }

      return data.meeting.length !== 0
        ? ((data.meeting.length - count) / data.meeting.length) * 100
        : 0;
    };
    return { percentage: verifyFouls().toFixed(0), count: count };
  };

  const projectYear = report?.project?.date_initial
    ? new Date(report.project.date_initial).getFullYear()
    : null;
  const requiresTerm = projectYear === null || projectYear >= 2026;

  const getExportableRegistrations = () =>
    (report?.register_classroom || []).filter(
      (item: any) =>
        item?.status === "APPROVED" &&
        (!requiresTerm ||
          item?.registration?.register_term?.[0]?.status === "ACTIVE_TERM")
    );

  const buildPdfDoc = () => {
    const exportRegistrations = getExportableRegistrations();

    const approvedCountExport = exportRegistrations.filter(
      (item: any) =>
        parseInt(bodyTotal(item).percentage) >=
        (report?.project?.approval_percentage || 0)
    ).length;

    const maxMeetingsPerPage = 12;
    const maxStudentsPerPage = 25;

    const createTableBody = (
      registrationsSubset: any,
      meetingSubset: any,
      startIndex: number
    ) => {
      const headerRow = [
        { text: "Nº", style: "tableHeader" },
        { text: "NOME COMPLETO", style: "tableHeader" },
        ...meetingSubset.map((item: any) => ({
          text: `${formatarDataAnoDuas(item.meeting_date)}\n${minutesToTimeStr(item.workload ?? 0)}h`,
          style: "tableHeader",
          alignment: "center",
        })),
        { text: "FREQUÊNCIA", style: "tableHeader", alignment: "center" },
        { text: "STATUS", style: "tableHeader", alignment: "center" },
      ];

      const bodyRows = registrationsSubset.map((item: any, index: number) => {
        const isApproved =
          parseInt(bodyTotal(item).percentage) >= report?.project?.approval_percentage!;
        return [
          { text: startIndex + index + 1, style: "tableCell", alignment: "center" },
          { text: `${item.registration.name} - ${item.registration.cpf}`, style: "tableCell" },
          ...meetingSubset.map((meeting: any) => ({
            text: bodyMeeting(item, meeting),
            style: "tableCell",
            alignment: "center",
          })),
          { text: `${bodyTotal(item).percentage}%`, style: "tableCell", alignment: "center" },
          {
            text: isApproved ? "Aprovado" : "Reprovado",
            style: isApproved ? "statusApproved" : "statusRejected",
            alignment: "center",
          },
        ];
      });

      return [headerRow, ...bodyRows];
    };

    const splitMeetingsIntoPages = () => {
      const meetingPages = [];
      const totalMeetings = report?.meeting.length || 0;

      for (let i = 0; i < totalMeetings; i += maxMeetingsPerPage) {
        meetingPages.push(report?.meeting.slice(i, i + maxMeetingsPerPage));
      }

      return meetingPages;
    };

    const splitStudentsIntoPages = () => {
      const studentPages = [];
      const totalStudents = exportRegistrations.length || 0;

      for (let i = 0; i < totalStudents; i += maxStudentsPerPage) {
        studentPages.push(exportRegistrations.slice(i, i + maxStudentsPerPage));
      }

      return studentPages;
    };

    const meetingPages = splitMeetingsIntoPages();
    const studentPages = splitStudentsIntoPages();

    const content: any[] = [
      {
        text: `${report?.project.social_technology.name}`,
        style: "header",
        alignment: "center",
        bold: true,
        marginTop: -32,
      },
      {
        text: `${report?.project.name}`,
        style: "header",
        alignment: "center",
        fontSize: 10,
      },
      {
        text: "Relatório de Frequência",
        style: "header",
        alignment: "center",
        fontSize: 8,
        marginTop: 4,
      },
      {
        style: "tableExample",
        marginTop: 4,
        fontSize: 6,
        table: {
          widths: ["*", "*"],
          body: [[`Reaplicador: ${uniqueUsers?.map((e) => e.name + "; ")}`, `Turma: ${report?.name}`]],
        },
      },
      ...studentPages.flatMap((studentSubset, studentPageIndex) =>
        meetingPages.map((meetingSubset, meetingPageIndex) => [
          {
            style: "tableExample",
            marginTop: 8,
            fontSize: 6,
            table: {
              widths: [
                "3%",
                "22%",
                ...meetingSubset!.map(() => "*"),
                "8%",
                "6%",
                "7%",
              ],
              body: createTableBody(
                studentSubset || [],
                meetingSubset,
                studentPageIndex * maxStudentsPerPage
              ),
            },
            layout: {
              fillColor: (rowIndex: number) => {
                if (rowIndex === 0) return "#E5E7EB";
                return rowIndex % 2 === 0 ? "#F9FAFB" : null;
              },
              hLineColor: "#D1D5DB",
              vLineColor: "#D1D5DB",
            },
            pageBreak:
              studentPageIndex === 0 && meetingPageIndex === 0
                ? undefined
                : "before",
          },
          {
            style: "tableExample",
            marginTop: 8,
            fontSize: 6,
            table: {
              widths: ["*", "*"],
              body: [
                [
                  {
                    text: `Critério Mínimo de Aprovação: ${report?.project?.approval_percentage}%\nQuantidade de Encontros: ${report?.meeting.length}\nQuantidade de Alunos: ${exportRegistrations.length}`,
                    style: "summaryCell",
                  },
                  {
                    text: `Quantidade de aprovados: ${approvedCountExport}\nMédia de Presença da Turma: ${mediaDasMedias.toFixed(2)}%\nCarga horária total: ${minutesToTimeStr(totalWorkload ?? 0)}h`,
                    style: "summaryCell",
                  },
                ],
              ],
            },
            layout: {
              fillColor: "#F3F4F6",
              hLineColor: "#D1D5DB",
              vLineColor: "#D1D5DB",
            },
          },
        ])
      ),
    ];

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      content,
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          fontSize: 6,
          bold: true,
          color: "#111827",
          margin: [0, 2, 0, 2],
        },
        tableCell: {
          fontSize: 6,
          color: "#111827",
          margin: [0, 2, 0, 2],
        },
        statusApproved: {
          fontSize: 6,
          bold: true,
          color: styles.colors.green,
        },
        statusRejected: {
          fontSize: 6,
          bold: true,
          color: styles.colors.red,
        },
        summaryCell: {
          fontSize: 6,
          color: "#111827",
          margin: [0, 2, 0, 2],
        },
      },
      header: () => ({
        image: logoBase64 || "",
        alignment: "center",
        marginTop: 32,
        marginBottom: 128,
        fit: [400, 400],
      }),
      footer: () =>
        logoBaseRegua64
          ? {
              image: logoBaseRegua64 || "",
              alignment: "center",
              margin: [0, 0, 20, 20],
              fit: [400, 400],
            }
          : {
              image: logoBase64 || "",
              alignment: "center",
              margin: [0, 0, 20, 20],
              fit: [400, 400],
            },
      pageMargins: [40, 100, 40, 60],
      background: (currentPage) => {
        if (currentPage > 1) {
          return [
            {
              text: `${report?.project.social_technology.name}`,
              fontSize: 10,
              italics: true,
              alignment: "right",
              opacity: 0.5,
              margin: [0, 10, 10, 0],
            },
            {
              text: `${report?.project.name}`,
              fontSize: 10,
              italics: true,
              alignment: "right",
              opacity: 0.5,
              margin: [0, 10, 10, 0],
            },
            {
              image: logoBaseLeft64 || "",
              width: 16,
              absolutePosition: { x: 8, y: 360 },
            },
          ];
        }

        return {
          image: logoBaseLeft64 || "",
          width: 16,
          absolutePosition: { x: 8, y: 360 },
        };
      },
    };

    return docDefinition;
  };

  const generatePDF = () => {
    if (getExportableRegistrations().length === 0 && requiresTerm) {
      Swal.fire({
        icon: "warning",
        title: "Nenhum beneficiário elegível",
        text: requiresTerm
            ? "Para exportar, o beneficiário precisa ter matrícula aprovada e termo de adesão ativo."
            : "Para exportar, o beneficiário precisa ter matrícula aprovada.",
        confirmButtonText: "Entendi",
        confirmButtonColor: styles.colors.colorsBaseProductNormal,
      });
      return;
    }
    const docDefinition = buildPdfDoc();
    pdfMake.createPdf(docDefinition).open();
  };

  const generateImagesZip = async () => {
    if (getExportableRegistrations().length === 0 && requiresTerm) {
      Swal.fire({
        icon: "warning",
        title: "Nenhum beneficiário elegível",
        text: requiresTerm
            ? "Para exportar, o beneficiário precisa ter matrícula aprovada e termo de adesão ativo."
            : "Para exportar, o beneficiário precisa ter matrícula aprovada.",
        confirmButtonText: "Entendi",
        confirmButtonColor: styles.colors.colorsBaseProductNormal,
      });
      return;
    }
    try {
      setIsGeneratingImagesZip(true);

      await loadScript(PDFJS_URL);
      await loadScript(JSZIP_URL);

      if (!window.pdfjsLib || !window.JSZip) {
        throw new Error("Bibliotecas de geração não disponíveis.");
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

      const docDefinition = buildPdfDoc();

      const pdfBlob: Blob = await new Promise((resolve) => {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => resolve(blob));
      });

      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const zip = new window.JSZip();

      for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Não foi possível criar o contexto do canvas.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageBlob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Falha ao converter página em imagem."));
              return;
            }
            resolve(blob);
          }, "image/png");
        });

        zip.file(`pagina-${String(pageNumber).padStart(2, "0")}.png`, imageBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${report?.name || "relatorio"}-paginas.zip`);
    } catch (error) {
      console.error("Erro ao gerar ZIP de imagens do relatrio:", error);
      alert("Não foi possível gerar o ZIP com as imagens das páginas.");
    } finally {
      setIsGeneratingImagesZip(false);
    }
  };

  return { generatePDF, generateImagesZip, isGeneratingImagesZip };
};

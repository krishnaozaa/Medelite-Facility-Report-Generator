import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type { FacilityAssessmentReport } from "@/types/report";
import {
  getFacilityAssessmentReportRows,
  isFacilityAssessmentReportExportReady,
  type ReportFieldRow,
} from "@/lib/report/reportRows";
export { buildFacilityAssessmentDocxFileName } from "@/lib/report/fileNames";

const TABLE_BORDER = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: "000000",
};

const BRAND_LOGO_PATH = "/branding-medelite.png";

async function loadBrandLogoData() {
  if (typeof fetch !== "function") {
    return null;
  }

  try {
    const response = await fetch(BRAND_LOGO_PATH);

    if (!response.ok) {
      return null;
    }

    return response.arrayBuffer();
  } catch {
    return null;
  }
}

function createTextParagraph(text: string, bold = false) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold,
        size: 20,
        font: "Arial",
      }),
    ],
    spacing: {
      before: 40,
      after: 40,
    },
  });
}

function createReportRow(row: ReportFieldRow) {
  return new TableRow({
    children: [
      new TableCell({
        borders: {
          top: TABLE_BORDER,
          right: TABLE_BORDER,
          bottom: TABLE_BORDER,
          left: TABLE_BORDER,
        },
        margins: {
          top: 100,
          right: 160,
          bottom: 100,
          left: 160,
        },
        width: {
          size: 50,
          type: WidthType.PERCENTAGE,
        },
        children: [createTextParagraph(row.label, true)],
      }),
      new TableCell({
        borders: {
          top: TABLE_BORDER,
          right: TABLE_BORDER,
          bottom: TABLE_BORDER,
          left: TABLE_BORDER,
        },
        margins: {
          top: 100,
          right: 160,
          bottom: 100,
          left: 160,
        },
        width: {
          size: 50,
          type: WidthType.PERCENTAGE,
        },
        children: [createTextParagraph(row.value)],
      }),
    ],
  });
}

export function isFacilityAssessmentReportDocxReady(report: FacilityAssessmentReport) {
  return isFacilityAssessmentReportExportReady(report);
}

export function buildFacilityDocxDocument(
  report: FacilityAssessmentReport,
  brandLogoData?: ArrayBuffer | Uint8Array | null,
) {
  const rows = getFacilityAssessmentReportRows(report);
  const brandHeader = brandLogoData
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: "png",
            data: brandLogoData,
            transformation: {
              width: 226,
              height: 52,
            },
            altText: {
              name: report.branding.platform,
              title: report.branding.platform,
              description: "INFINITE logo with Managed by MEDELITE text.",
            },
          }),
        ],
        spacing: {
          after: 80,
        },
      })
    : new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: report.branding.platform,
            bold: true,
            color: "B000E8",
            size: 28,
            font: "Arial",
          }),
        ],
        spacing: {
          after: 120,
        },
      });

  return new Document({
    creator: report.branding.platform,
    description: "Facility Assessment Snapshot generated from the canonical report model.",
    title: `${report.branding.title} - ${report.facility.ccn}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          brandHeader,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: report.branding.title,
                bold: true,
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: report.branding.state,
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
            spacing: {
              after: 120,
            },
          }),
          new Table({
            borders: {
              top: TABLE_BORDER,
              right: TABLE_BORDER,
              bottom: TABLE_BORDER,
              left: TABLE_BORDER,
              insideHorizontal: TABLE_BORDER,
              insideVertical: TABLE_BORDER,
            },
            rows: rows.map(createReportRow),
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Medicare Care Compare: ",
                bold: true,
                size: 20,
                font: "Arial",
              }),
              new ExternalHyperlink({
                link: report.facility.medicareUrl,
                children: [
                  new TextRun({
                    text: report.facility.medicareUrl,
                    style: "Hyperlink",
                  }),
                ],
              }),
            ],
            spacing: {
              before: 240,
            },
          }),
        ],
      },
    ],
  });
}

export async function buildFacilityDocx(report: FacilityAssessmentReport) {
  return Packer.toBlob(buildFacilityDocxDocument(report, await loadBrandLogoData()));
}

import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { FacilityAssessmentReport } from "@/types/report";
import { BRAND_LOGO_SRC } from "@/lib/report/branding";
import { getFacilityAssessmentPdfRows, type PdfFieldRow } from "@/lib/report/pdfExport";

type FacilityAssessmentPdfProps = {
  report: FacilityAssessmentReport;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 54,
    paddingBottom: 28,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: "center",
    marginBottom: 2,
  },
  logo: {
    width: 214,
    height: 49,
    objectFit: "contain",
    marginBottom: 9,
  },
  brandFallback: {
    fontSize: 1,
    color: "#ffffff",
    lineHeight: 1,
  },
  title: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "center",
    lineHeight: 1.1,
  },
  state: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#000000",
    textAlign: "center",
    lineHeight: 1.05,
  },
  table: {
    borderColor: "#000000",
    borderWidth: 1,
    marginTop: 0,
  },
  row: {
    flexDirection: "row",
    borderBottomColor: "#000000",
    borderBottomWidth: 1,
    minHeight: 19,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  labelCell: {
    width: "53%",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRightColor: "#000000",
    borderRightWidth: 1,
    justifyContent: "center",
  },
  valueCell: {
    width: "47%",
    paddingVertical: 4,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    lineHeight: 1.1,
  },
  value: {
    color: "#000000",
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.1,
  },
  source: {
    marginTop: 8,
    fontSize: 7.5,
    color: "#000000",
  },
  link: {
    color: "#075985",
    textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    left: 54,
    right: 54,
    bottom: 14,
    color: "#666666",
    fontSize: 6.5,
    textAlign: "center",
  },
});

function FieldRows({ rows }: { rows: PdfFieldRow[] }) {
  return (
    <View style={styles.table}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index === rows.length - 1 ? styles.lastRow : {}]}
          wrap={false}
        >
          <View style={styles.labelCell}>
            <Text style={styles.label}>{row.label}</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function FacilityAssessmentPdf({ report }: FacilityAssessmentPdfProps) {
  const rows = getFacilityAssessmentPdfRows(report);

  return (
    <Document
      author="INFINITE — Managed by MEDELITE"
      subject="Facility Assessment Snapshot"
      title={`${report.branding.title} - ${report.facility.ccn}`}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image does not support alt text. */}
          <Image src={BRAND_LOGO_SRC} style={styles.logo} />
          <Text style={styles.brandFallback}>{report.branding.platform}</Text>
          <Text style={styles.title}>{report.branding.title}</Text>
          <Text style={styles.state}>{report.branding.state}</Text>
        </View>

        <FieldRows rows={rows} />

        <View style={styles.source}>
          <Text>
            Medicare Care Compare:{" "}
            <Link src={report.facility.medicareUrl} style={styles.link}>
              {report.facility.medicareUrl}
            </Link>
          </Text>
        </View>

        <Text style={styles.footer}>
          {report.branding.platform} | CCN {report.facility.ccn}
        </Text>
      </Page>
    </Document>
  );
}

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { FacilityAssessmentReport } from "@/types/report";
import { getFacilityAssessmentPdfRows, type PdfFieldRow } from "@/lib/report/pdfExport";

type FacilityAssessmentPdfProps = {
  report: FacilityAssessmentReport;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#172033",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomColor: "#cbd5e1",
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 18,
  },
  brand: {
    color: "#1d4ed8",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#172033",
  },
  state: {
    fontSize: 10,
    color: "#475569",
    marginTop: 3,
  },
  facilityName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  ccn: {
    fontSize: 10,
    color: "#475569",
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f766e",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  grid: {
    borderColor: "#d7dee8",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    borderBottomColor: "#d7dee8",
    borderBottomWidth: 1,
    minHeight: 32,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  labelCell: {
    width: "38%",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRightColor: "#d7dee8",
    borderRightWidth: 1,
  },
  valueCell: {
    width: "62%",
    padding: 8,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  value: {
    color: "#172033",
    lineHeight: 1.35,
  },
  source: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  link: {
    color: "#1d4ed8",
    textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 24,
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    paddingTop: 8,
    color: "#64748b",
    fontSize: 8,
  },
});

function FieldRows({ rows }: { rows: PdfFieldRow[] }) {
  return (
    <View style={styles.grid}>
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
          <Text style={styles.brand}>{report.branding.platform}</Text>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>{report.branding.title}</Text>
              <Text style={styles.state}>State: {report.branding.state}</Text>
            </View>
            <View>
              <Text style={styles.facilityName}>{report.facility.name}</Text>
              <Text style={styles.ccn}>CCN {report.facility.ccn}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility</Text>
          <FieldRows rows={rows.facilityRows} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations</Text>
          <FieldRows rows={rows.operationRows} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          <FieldRows rows={rows.ratingRows} />
        </View>

        <View style={styles.source}>
          <Text>
            Medicare Care Compare:{" "}
            <Link src={report.facility.medicareUrl} style={styles.link}>
              {report.facility.medicareUrl}
            </Link>
          </Text>
        </View>

        <Text style={styles.footer}>
          {report.branding.platform} | {report.branding.title}
        </Text>
      </Page>
    </Document>
  );
}

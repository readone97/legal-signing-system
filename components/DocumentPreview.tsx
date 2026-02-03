// components/DocumentPreview.tsx
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 12 },
});

interface Props {
  data: any; // FormData type
}

export default function DocumentPreview({ data }: Props) {
  return (
    <PDFViewer width="100%" height="600" className="mt-8">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Prenuptial Agreement</Text>
            <Text style={styles.text}>Title: {data.title}</Text>
            <Text style={styles.text}>Party A: {data.partyAName}, {data.partyAAddress}, DOB: {data.partyADOB}</Text>
            <Text style={styles.text}>Party B: {data.partyBName}, {data.partyBAddress}, DOB: {data.partyBDOB}</Text>
            {/* Add all fields */}
            <Text style={styles.text}>Assets: {data.asset1}, {data.asset2}, etc.</Text>
            {/* Sign blocks */}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}